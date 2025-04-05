import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { 
  insertUserSchema, 
  insertListingSchema, 
  insertMessageSchema, 
  insertReviewSchema,
  insertSavedListingSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Session store
const MemoryStoreSession = MemoryStore(session);
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "campus-market-secret",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // Prune expired entries every 24h
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    secure: process.env.NODE_ENV === "production"
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup websocket server for real-time messaging
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Map();
  
  httpServer.on("upgrade", (request, socket, head) => {
    sessionMiddleware(request as any, {} as any, () => {
      const session = (request as any).session;
      if (!session?.passport?.user) {
        socket.destroy();
        return;
      }
      
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request, session.passport.user);
      });
    });
  });
  
  wss.on("connection", (ws, request, userId) => {
    clients.set(userId, ws);
    
    ws.on("close", () => {
      clients.delete(userId);
    });
  });
  
  // Session setup
  app.use(sessionMiddleware);
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (user.password !== password) { // In production, use proper password hashing
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Middleware to handle Zod validation errors
  const validateRequest = (schema: any) => (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  };
  
  // Auth check middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  };
  
  // Admin check middleware
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any)?.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Admin access required" });
  };
  
  // Auth routes
  app.post("/api/auth/register", validateRequest(insertUserSchema), async (req, res) => {
    try {
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(req.body);
      
      // Log the user in after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json({ id: user.id, username: user.username, email: user.email });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin
    });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        campus: user.campus,
        isAdmin: user.isAdmin
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't expose password and limit info for non-self users
      const { password, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user as any;
      
      // Only allow users to update their own profile
      if (currentUser.id !== userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      
      // Don't allow updating sensitive fields
      const { password, isAdmin, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userInfo } = updatedUser;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const filters: any = {};
      
      // Extract filter parameters from query
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.searchQuery) filters.searchQuery = req.query.searchQuery as string;
      if (req.query.priceMin) filters.priceMin = parseFloat(req.query.priceMin as string);
      if (req.query.priceMax) filters.priceMax = parseFloat(req.query.priceMax as string);
      if (req.query.condition) filters.condition = req.query.condition as string;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.userId) filters.userId = parseInt(req.query.userId as string);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.offset) filters.offset = parseInt(req.query.offset as string);
      
      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get listings" });
    }
  });
  
  app.get("/api/listings/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const listings = await storage.getFeaturedListings(limit);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get featured listings" });
    }
  });
  
  app.get("/api/listings/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const listings = await storage.getRecentListings(limit);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent listings" });
    }
  });
  
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to get listing" });
    }
  });
  
  app.post("/api/listings", isAuthenticated, validateRequest(insertListingSchema), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const listing = await storage.createListing({ ...req.body, userId });
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create listing" });
    }
  });
  
  app.patch("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      const userId = (req.user as any).id;
      const isAdmin = (req.user as any).isAdmin;
      
      // Only allow the owner or admin to update
      if (listing.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }
      
      const updatedListing = await storage.updateListing(listingId, req.body);
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update listing" });
    }
  });
  
  app.delete("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      const userId = (req.user as any).id;
      const isAdmin = (req.user as any).isAdmin;
      
      // Only allow the owner or admin to delete
      if (listing.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }
      
      await storage.deleteListing(listingId);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });
  
  // Message routes
  app.get("/api/messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });
  
  app.get("/api/messages/:receiverId/:listingId", isAuthenticated, async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      const receiverId = parseInt(req.params.receiverId);
      const listingId = parseInt(req.params.listingId);
      
      const messages = await storage.getMessagesBetweenUsers(senderId, receiverId, listingId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(receiverId, senderId, listingId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  
  app.post("/api/messages", isAuthenticated, validateRequest(insertMessageSchema), async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      if (senderId !== req.body.senderId) {
        return res.status(403).json({ message: "Cannot send messages as another user" });
      }
      
      const message = await storage.createMessage(req.body);
      
      // If receiver is connected, send them the message in real-time
      const receiverWs = clients.get(req.body.receiverId);
      if (receiverWs) {
        receiverWs.send(JSON.stringify({ 
          type: 'new_message', 
          data: message 
        }));
      }
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Reviews routes
  app.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.id);
      const reviews = await storage.getReviewsBySeller(sellerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });
  
  app.post("/api/reviews", isAuthenticated, validateRequest(insertReviewSchema), async (req, res) => {
    try {
      const reviewerId = (req.user as any).id;
      if (reviewerId !== req.body.reviewerId) {
        return res.status(403).json({ message: "Cannot post reviews as another user" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListing(req.body.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Create the review
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to post review" });
    }
  });
  
  // Saved listings routes
  app.get("/api/saved-listings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const savedListings = await storage.getSavedListings(userId);
      res.json(savedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved listings" });
    }
  });
  
  app.post("/api/saved-listings", isAuthenticated, validateRequest(insertSavedListingSchema), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      if (userId !== req.body.userId) {
        return res.status(403).json({ message: "Cannot save listings for another user" });
      }
      
      // Check if already saved
      const isAlreadySaved = await storage.isListingSaved(userId, req.body.listingId);
      if (isAlreadySaved) {
        return res.status(409).json({ message: "Listing already saved" });
      }
      
      // Save the listing
      const savedListing = await storage.saveListingForUser(req.body);
      res.status(201).json(savedListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to save listing" });
    }
  });
  
  app.delete("/api/saved-listings/:listingId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const listingId = parseInt(req.params.listingId);
      
      const removed = await storage.removeSavedListing(userId, listingId);
      if (!removed) {
        return res.status(404).json({ message: "Saved listing not found" });
      }
      
      res.json({ message: "Listing removed from saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved listing" });
    }
  });
  
  app.get("/api/saved-listings/check/:listingId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const listingId = parseInt(req.params.listingId);
      
      const isSaved = await storage.isListingSaved(userId, listingId);
      res.json({ isSaved });
    } catch (error) {
      res.status(500).json({ message: "Failed to check saved status" });
    }
  });
  
  return httpServer;
}
