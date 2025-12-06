import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertMessageSchema, insertOfferSchema, insertCommunityPostSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "campus-marketplace-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.post("/api/signup", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const { name, email, password, avatar } = validationResult.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        avatar,
      });

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const product = await storage.createProduct({
        ...validationResult.data,
        sellerId: req.session.userId!,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category, condition, minPrice, maxPrice, search } = req.query;

      const filters: {
        category?: string;
        condition?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
      } = {};

      if (category && typeof category === "string") {
        filters.category = category;
      }
      if (condition && typeof condition === "string") {
        filters.condition = condition;
      }
      if (minPrice && typeof minPrice === "string") {
        filters.minPrice = parseFloat(minPrice);
      }
      if (maxPrice && typeof maxPrice === "string") {
        filters.maxPrice = parseFloat(maxPrice);
      }
      if (search && typeof search === "string") {
        filters.search = search;
      }

      const products = Object.keys(filters).length > 0
        ? await storage.searchProducts(filters)
        : await storage.getAllProducts();

      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/products/seller/:sellerId", async (req, res) => {
    try {
      const products = await storage.getProductsBySeller(req.params.sellerId);
      res.json(products);
    } catch (error) {
      console.error("Get products by seller error:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  app.post("/api/products/:id/view", async (req, res) => {
    try {
      await storage.incrementProductViews(req.params.id);
      res.json({ message: "View count incremented" });
    } catch (error) {
      console.error("Increment view error:", error);
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  app.post("/api/chats", requireAuth, async (req, res) => {
    try {
      const { productId, participantIds } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "participantIds array is required" });
      }

      if (!participantIds.includes(req.session.userId!)) {
        participantIds.push(req.session.userId!);
      }

      const chat = await storage.createChat(productId || null, participantIds);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Create chat error:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get("/api/chats", requireAuth, async (req, res) => {
    try {
      const chats = await storage.getChatsByUser(req.session.userId!);
      res.json(chats);
    } catch (error) {
      console.error("Get chats error:", error);
      res.status(500).json({ message: "Failed to get chats" });
    }
  });

  app.get("/api/chats/:id", requireAuth, async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.id);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(req.session.userId!)) {
        return res.status(403).json({ message: "Not authorized to view this chat" });
      }

      res.json({ ...chat, participants });
    } catch (error) {
      console.error("Get chat error:", error);
      res.status(500).json({ message: "Failed to get chat" });
    }
  });

  app.post("/api/chats/:id/messages", requireAuth, async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.id);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(req.session.userId!)) {
        return res.status(403).json({ message: "Not authorized to send messages in this chat" });
      }

      const validationResult = insertMessageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      if (validationResult.data.chatId !== req.params.id) {
        return res.status(400).json({ message: "Chat ID mismatch" });
      }

      const message = await storage.createMessage({
        ...validationResult.data,
        senderId: req.session.userId!,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/chats/:id/messages", requireAuth, async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.id);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(req.session.userId!)) {
        return res.status(403).json({ message: "Not authorized to view messages in this chat" });
      }

      const messages = await storage.getMessagesByChat(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.patch("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Mark message as read error:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.post("/api/offers", requireAuth, async (req, res) => {
    try {
      const validationResult = insertOfferSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const { productId, amount } = validationResult.data;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId === req.session.userId) {
        return res.status(400).json({ message: "Cannot make an offer on your own product" });
      }

      const offer = await storage.createOffer({
        productId,
        buyerId: req.session.userId!,
        amount,
      });

      res.status(201).json(offer);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.get("/api/offers/product/:productId", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view offers for this product" });
      }

      const offers = await storage.getOffersByProduct(req.params.productId);
      res.json(offers);
    } catch (error) {
      console.error("Get offers by product error:", error);
      res.status(500).json({ message: "Failed to get offers" });
    }
  });

  app.get("/api/offers/buyer", requireAuth, async (req, res) => {
    try {
      const offers = await storage.getOffersByBuyer(req.session.userId!);
      res.json(offers);
    } catch (error) {
      console.error("Get offers by buyer error:", error);
      res.status(500).json({ message: "Failed to get offers" });
    }
  });

  app.patch("/api/offers/:id/accept", requireAuth, async (req, res) => {
    try {
      const offer = await storage.getOffer(req.params.id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      const product = await storage.getProduct(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to accept this offer" });
      }

      if (offer.status !== "pending") {
        return res.status(400).json({ message: "Offer has already been processed" });
      }

      const updatedOffer = await storage.updateOffer(req.params.id, { status: "accepted" });
      res.json(updatedOffer);
    } catch (error) {
      console.error("Accept offer error:", error);
      res.status(500).json({ message: "Failed to accept offer" });
    }
  });

  app.patch("/api/offers/:id/reject", requireAuth, async (req, res) => {
    try {
      const offer = await storage.getOffer(req.params.id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      const product = await storage.getProduct(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to reject this offer" });
      }

      if (offer.status !== "pending") {
        return res.status(400).json({ message: "Offer has already been processed" });
      }

      const updatedOffer = await storage.updateOffer(req.params.id, { status: "rejected" });
      res.json(updatedOffer);
    } catch (error) {
      console.error("Reject offer error:", error);
      res.status(500).json({ message: "Failed to reject offer" });
    }
  });

  app.post("/api/community", requireAuth, async (req, res) => {
    try {
      const validationResult = insertCommunityPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const post = await storage.createCommunityPost({
        ...validationResult.data,
        authorId: req.session.userId!,
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Create community post error:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.get("/api/community", async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get community posts error:", error);
      res.status(500).json({ message: "Failed to get community posts" });
    }
  });

  app.get("/api/community/:id", async (req, res) => {
    try {
      const post = await storage.getCommunityPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Get community post error:", error);
      res.status(500).json({ message: "Failed to get community post" });
    }
  });

  app.post("/api/community/:id/like", requireAuth, async (req, res) => {
    try {
      const post = await storage.getCommunityPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }

      const newLikes = post.likes + 1;
      await storage.updateCommunityPostLikes(req.params.id, newLikes);

      res.json({ likes: newLikes });
    } catch (error) {
      console.error("Like community post error:", error);
      res.status(500).json({ message: "Failed to like community post" });
    }
  });

  app.delete("/api/community/:id", requireAuth, async (req, res) => {
    try {
      const post = await storage.getCommunityPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }

      if (post.authorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }

      await storage.deleteCommunityPost(req.params.id);
      res.json({ message: "Community post deleted successfully" });
    } catch (error) {
      console.error("Delete community post error:", error);
      res.status(500).json({ message: "Failed to delete community post" });
    }
  });

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  app.post("/api/users/:id/follow", requireAuth, async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const currentUserId = req.session.userId!;

      if (targetUserId === currentUserId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAlreadyFollowing = await storage.isFollowing(currentUserId, targetUserId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }

      await storage.followUser(currentUserId, targetUserId);
      res.status(201).json({ message: "Successfully followed user" });
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", requireAuth, async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const currentUserId = req.session.userId!;

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isFollowing = await storage.isFollowing(currentUserId, targetUserId);
      if (!isFollowing) {
        return res.status(400).json({ message: "Not following this user" });
      }

      await storage.unfollowUser(currentUserId, targetUserId);
      res.json({ message: "Successfully unfollowed user" });
    } catch (error) {
      console.error("Unfollow user error:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const followerIds = await storage.getFollowers(req.params.id);
      const followers = await Promise.all(
        followerIds.map(async (id) => {
          const follower = await storage.getUser(id);
          if (follower) {
            const { password: _, ...userWithoutPassword } = follower;
            return userWithoutPassword;
          }
          return null;
        })
      );

      res.json(followers.filter(Boolean));
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ message: "Failed to get followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const followingIds = await storage.getFollowing(req.params.id);
      const following = await Promise.all(
        followingIds.map(async (id) => {
          const user = await storage.getUser(id);
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
          return null;
        })
      );

      res.json(following.filter(Boolean));
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ message: "Failed to get following" });
    }
  });

  app.patch("/api/users/:id/verify", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { verificationStatus } = req.body;
      if (!verificationStatus || !["verified", "unverified", "pending"].includes(verificationStatus)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }

      const isVerified = verificationStatus === "verified";
      const updatedUser = await storage.updateUser(req.params.id, {
        verificationStatus,
        isVerified,
      });

      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    } catch (error) {
      console.error("Update verification status error:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  return httpServer;
}
