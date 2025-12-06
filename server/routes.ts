import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertProductSchema, insertMessageSchema, insertOfferSchema, insertCommunityPostSchema, updateUserSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { chat as aiChat, estimatePrice } from "./openai";

async function getCurrentUserId(req: Request): Promise<string | null> {
  const user = req.user as any;
  if (!user?.claims?.sub) return null;
  const dbUser = await storage.getUserByReplitId(user.claims.sub);
  return dbUser?.id || null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password, country, state, city, pincode } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }

      if (!country || !state || !city || !pincode) {
        return res.status(400).json({ message: "Location details (country, state, city, pincode) are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let location = await storage.getLocationByDetails(country, state, city, pincode);
      if (!location) {
        location = await storage.createLocation({ country, state, city, pincode });
      }

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        locationId: location.id,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const replitUserId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const replitUserId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validationResult = updateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const updated = await storage.updateUser(user.id, validationResult.data);
      if (!updated) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validationResult = insertProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const user = await storage.getUserByReplitId(req.user.claims.sub);
      const product = await storage.createProduct({
        ...validationResult.data,
        sellerId: userId,
        locationId: user?.locationId || undefined,
        institutionId: user?.institutionId || undefined,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category, condition, minPrice, maxPrice, search, locationId, institutionId } = req.query;

      const filters: {
        category?: string;
        condition?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        locationId?: string;
        institutionId?: string;
      } = {};

      if (category && typeof category === "string") filters.category = category;
      if (condition && typeof condition === "string") filters.condition = condition;
      if (minPrice && typeof minPrice === "string") filters.minPrice = parseFloat(minPrice);
      if (maxPrice && typeof maxPrice === "string") filters.maxPrice = parseFloat(maxPrice);
      if (search && typeof search === "string") filters.search = search;
      if (locationId && typeof locationId === "string") filters.locationId = locationId;
      if (institutionId && typeof institutionId === "string") filters.institutionId = institutionId;

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

  app.patch("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId) {
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

  app.post("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { productId, participantIds } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "participantIds array is required" });
      }

      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
      }

      const chat = await storage.createChat(productId || null, participantIds);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Create chat error:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const chats = await storage.getChatsByUser(userId);
      res.json(chats);
    } catch (error) {
      console.error("Get chats error:", error);
      res.status(500).json({ message: "Failed to get chats" });
    }
  });

  app.get("/api/chats/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(userId)) {
        return res.status(403).json({ message: "Not authorized to view this chat" });
      }

      res.json({ ...chat, participants });
    } catch (error) {
      console.error("Get chat error:", error);
      res.status(500).json({ message: "Failed to get chat" });
    }
  });

  app.post("/api/chats/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(userId)) {
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
        senderId: userId,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/chats/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const participants = await storage.getChatParticipants(req.params.id);
      const participantIds = participants.map(p => p.userId);

      if (!participantIds.includes(userId)) {
        return res.status(403).json({ message: "Not authorized to view messages in this chat" });
      }

      const messages = await storage.getMessagesByChat(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Mark message as read error:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.post("/api/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

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

      if (product.sellerId === userId) {
        return res.status(400).json({ message: "Cannot make an offer on your own product" });
      }

      const offer = await storage.createOffer({
        productId,
        buyerId: userId,
        amount,
      });

      res.status(201).json(offer);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.get("/api/offers/product/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const product = await storage.getProduct(req.params.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view offers for this product" });
      }

      const offers = await storage.getOffersByProduct(req.params.productId);
      res.json(offers);
    } catch (error) {
      console.error("Get offers by product error:", error);
      res.status(500).json({ message: "Failed to get offers" });
    }
  });

  app.get("/api/offers/buyer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const offers = await storage.getOffersByBuyer(userId);
      res.json(offers);
    } catch (error) {
      console.error("Get offers by buyer error:", error);
      res.status(500).json({ message: "Failed to get offers" });
    }
  });

  app.patch("/api/offers/:id/accept", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const offer = await storage.getOffer(req.params.id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      const product = await storage.getProduct(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId) {
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

  app.patch("/api/offers/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const offer = await storage.getOffer(req.params.id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      const product = await storage.getProduct(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId) {
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

  app.post("/api/community", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validationResult = insertCommunityPostSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const post = await storage.createCommunityPost({
        ...validationResult.data,
        authorId: userId,
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

  app.post("/api/community/:id/like", isAuthenticated, async (req, res) => {
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

  app.delete("/api/community/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      const post = await storage.getCommunityPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }

      if (post.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }

      await storage.deleteCommunityPost(req.params.id);
      res.json({ message: "Community post deleted successfully" });
    } catch (error) {
      console.error("Delete community post error:", error);
      res.status(500).json({ message: "Failed to delete community post" });
    }
  });

  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const currentUser = await storage.getUser(userId);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password: _, ...user }) => user);
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

  app.post("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const targetUserId = req.params.id;

      if (targetUserId === userId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAlreadyFollowing = await storage.isFollowing(userId, targetUserId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }

      await storage.followUser(userId, targetUserId);
      res.status(201).json({ message: "Successfully followed user" });
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const targetUserId = req.params.id;

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isFollowing = await storage.isFollowing(userId, targetUserId);
      if (!isFollowing) {
        return res.status(400).json({ message: "Not following this user" });
      }

      await storage.unfollowUser(userId, targetUserId);
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
          const followedUser = await storage.getUser(id);
          if (followedUser) {
            const { password: _, ...userWithoutPassword } = followedUser;
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

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ message: "Failed to get locations" });
    }
  });

  app.get("/api/locations/countries", async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error) {
      console.error("Get countries error:", error);
      res.status(500).json({ message: "Failed to get countries" });
    }
  });

  app.get("/api/locations/states/:country", async (req, res) => {
    try {
      const states = await storage.getStates(req.params.country);
      res.json(states);
    } catch (error) {
      console.error("Get states error:", error);
      res.status(500).json({ message: "Failed to get states" });
    }
  });

  app.get("/api/locations/cities/:country/:state", async (req, res) => {
    try {
      const cities = await storage.getCities(req.params.country, req.params.state);
      res.json(cities);
    } catch (error) {
      console.error("Get cities error:", error);
      res.status(500).json({ message: "Failed to get cities" });
    }
  });

  app.get("/api/locations/pincodes/:country/:state/:city", async (req, res) => {
    try {
      const pincodes = await storage.getPincodes(req.params.country, req.params.state, req.params.city);
      res.json(pincodes);
    } catch (error) {
      console.error("Get pincodes error:", error);
      res.status(500).json({ message: "Failed to get pincodes" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Get location error:", error);
      res.status(500).json({ message: "Failed to get location" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req: any, res) => {
    try {
      const { country, state, city, pincode } = req.body;
      
      if (!country || !state || !city || !pincode) {
        return res.status(400).json({ message: "Country, state, city and pincode are required" });
      }

      let location = await storage.getLocationByDetails(country, state, city, pincode);
      
      if (!location) {
        location = await storage.createLocation({ country, state, city, pincode });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Create/get location error:", error);
      res.status(500).json({ message: "Failed to create/get location" });
    }
  });

  app.get("/api/institutions", async (req, res) => {
    try {
      const { locationId, search } = req.query;
      
      if (search && typeof search === "string") {
        const institutions = await storage.searchInstitutions(
          search,
          typeof locationId === "string" ? locationId : undefined
        );
        return res.json(institutions);
      }

      if (locationId && typeof locationId === "string") {
        const institutions = await storage.getInstitutionsByLocation(locationId);
        return res.json(institutions);
      }

      const institutions = await storage.getAllInstitutions();
      res.json(institutions);
    } catch (error) {
      console.error("Get institutions error:", error);
      res.status(500).json({ message: "Failed to get institutions" });
    }
  });

  app.post("/api/institutions", isAuthenticated, async (req: any, res) => {
    try {
      const { name, type, locationId, address } = req.body;
      
      if (!name || !type || !locationId) {
        return res.status(400).json({ message: "Name, type and locationId are required" });
      }

      const institution = await storage.createInstitution({ name, type, locationId, address });
      res.status(201).json(institution);
    } catch (error) {
      console.error("Create institution error:", error);
      res.status(500).json({ message: "Failed to create institution" });
    }
  });

  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { message, sessionId } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      let session;
      if (sessionId) {
        session = await storage.getAiChatSession(sessionId);
        if (!session || session.userId !== userId) {
          return res.status(404).json({ message: "Chat session not found" });
        }
      } else {
        session = await storage.createAiChatSession(userId);
      }

      const existingMessages = (session.messages as any[]) || [];
      
      const response = await aiChat(existingMessages, message);
      
      const updatedMessages = [
        ...existingMessages,
        { role: "user", content: message },
        { role: "assistant", content: response },
      ];
      
      await storage.updateAiChatSession(session.id, updatedMessages);

      res.json({
        sessionId: session.id,
        response,
        messages: updatedMessages,
      });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  app.get("/api/ai/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const sessions = await storage.getAiChatSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Get AI sessions error:", error);
      res.status(500).json({ message: "Failed to get AI sessions" });
    }
  });

  app.get("/api/ai/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = await getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const session = await storage.getAiChatSession(req.params.id);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get AI session error:", error);
      res.status(500).json({ message: "Failed to get AI session" });
    }
  });

  app.post("/api/ai/estimate-price", isAuthenticated, async (req: any, res) => {
    try {
      const { title, description, condition, category } = req.body;
      
      if (!title || !description || !condition || !category) {
        return res.status(400).json({ message: "Title, description, condition, and category are required" });
      }

      const estimate = await estimatePrice(title, description, condition, category);
      res.json(estimate);
    } catch (error) {
      console.error("Price estimate error:", error);
      res.status(500).json({ message: "Failed to estimate price" });
    }
  });

  return httpServer;
}
