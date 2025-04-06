// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import session from "express-session";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, real, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  itemCount: integer("item_count").default(0).notNull()
});
var listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  images: text("images").array().notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  attachments: text("attachments").array()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id)
});
var walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  // 'deposit', 'withdraw', 'purchase', 'sale'
  status: text("status").notNull(),
  // 'pending', 'completed', 'failed'
  reference: text("reference"),
  // Order ID, payment reference, etc.
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  // 'pending', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatSupportMessages = pgTable("chat_support_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  isFromUser: boolean("is_from_user").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  reviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "seller" }),
  favorites: many(favorites),
  walletTransactions: many(walletTransactions),
  orders: many(orders, { relationName: "buyer" }),
  soldItems: many(orders, { relationName: "seller" })
}));
var categoriesRelations = relations(categories, ({ many }) => ({
  listings: many(listings)
}));
var listingsRelations = relations(listings, ({ one, many }) => ({
  category: one(categories, {
    fields: [listings.categoryId],
    references: [categories.id]
  }),
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id]
  }),
  messages: many(messages),
  reviews: many(reviews),
  favorites: many(favorites)
}));
var messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver"
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer"
  }),
  seller: one(users, {
    fields: [reviews.sellerId],
    references: [users.id],
    relationName: "seller"
  }),
  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id]
  })
}));
var walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id]
  })
}));
var ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyer"
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "seller"
  }),
  listing: one(listings, {
    fields: [orders.listingId],
    references: [listings.id]
  })
}));
var chatSupportMessagesRelations = relations(chatSupportMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatSupportMessages.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  walletBalance: true
}).extend({
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  sellerId: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  createdAt: true,
  read: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  reviewerId: true,
  createdAt: true
});
var insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  itemCount: true
});
var insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  userId: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  buyerId: true,
  createdAt: true
});
var insertChatSupportMessageSchema = createInsertSchema(chatSupportMessages).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString = process.env.DATABASE_URL;
var sql = postgres(connectionString);
var db = drizzle(sql);

// server/storage.ts
import { eq, and, or, desc, sql as sql2, like, gte, lte } from "drizzle-orm";
async function initializeDatabase() {
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    const defaultCategories = [
      { name: "Lecture Notes", slug: "lecture-notes" },
      { name: "Textbooks", slug: "textbooks" },
      { name: "Furniture", slug: "furniture" },
      { name: "Electronics", slug: "electronics" },
      { name: "Dorm Essentials", slug: "dorm-essentials" }
    ];
    for (const category of defaultCategories) {
      await db.insert(categories).values({
        ...category,
        itemCount: 0
      });
    }
  }
}
var DatabaseStorage = class {
  constructor() {
    initializeDatabase().catch((error) => {
      console.error("Failed to initialize database:", error);
    });
  }
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false
    }).returning();
    return user;
  }
  // Category methods
  async getCategories() {
    return db.select().from(categories);
  }
  async getCategoryBySlug(slug) {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values({
      ...insertCategory,
      itemCount: 0
    }).returning();
    return category;
  }
  // Listing methods
  async getListings(filters = {}) {
    let query;
    const whereConditions = [];
    if (filters.categoryId !== void 0) {
      whereConditions.push(eq(listings.categoryId, filters.categoryId));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      whereConditions.push(
        or(
          like(listings.title, searchPattern),
          like(listings.description, searchPattern)
        )
      );
    }
    if (filters.minPrice !== void 0) {
      whereConditions.push(gte(listings.price, filters.minPrice));
    }
    if (filters.maxPrice !== void 0) {
      whereConditions.push(lte(listings.price, filters.maxPrice));
    }
    if (filters.condition) {
      whereConditions.push(eq(listings.condition, filters.condition));
    }
    if (filters.location) {
      whereConditions.push(eq(listings.location, filters.location));
    }
    if (filters.sellerId !== void 0) {
      whereConditions.push(eq(listings.sellerId, filters.sellerId));
    }
    if (whereConditions.length > 0) {
      query = await db.select().from(listings).where(and(...whereConditions)).orderBy(desc(listings.createdAt)).limit(filters.limit || 100).offset(filters.offset || 0);
    } else {
      query = await db.select().from(listings).orderBy(desc(listings.createdAt)).limit(filters.limit || 100).offset(filters.offset || 0);
    }
    return query;
  }
  async getListingById(id) {
    const result = await db.select().from(listings).where(eq(listings.id, id));
    return result[0];
  }
  async createListing(insertListing, sellerId) {
    const [listing] = await db.insert(listings).values({
      ...insertListing,
      sellerId
    }).returning();
    await db.update(categories).set({ itemCount: sql2`${categories.itemCount} + 1` }).where(eq(categories.id, insertListing.categoryId));
    return listing;
  }
  async updateListing(id, updateData) {
    const [updatedListing] = await db.update(listings).set(updateData).where(eq(listings.id, id)).returning();
    return updatedListing;
  }
  async deleteListing(id) {
    const existingListing = await this.getListingById(id);
    if (!existingListing) return false;
    const deletedListings = await db.delete(listings).where(eq(listings.id, id)).returning();
    if (deletedListings.length === 0) return false;
    await db.update(categories).set({ itemCount: sql2`GREATEST(${categories.itemCount} - 1, 0)` }).where(eq(categories.id, existingListing.categoryId));
    return true;
  }
  // Message methods
  async getMessagesByUser(userId) {
    return db.select().from(messages).where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    ).orderBy(desc(messages.createdAt));
  }
  async getMessagesBetweenUsers(user1Id, user2Id, listingId) {
    return db.select().from(messages).where(
      and(
        eq(messages.listingId, listingId),
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
    ).orderBy(messages.createdAt);
  }
  async createMessage(insertMessage, senderId) {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      senderId,
      read: false
    }).returning();
    return message;
  }
  async markMessageAsRead(id) {
    const [updatedMessage] = await db.update(messages).set({ read: true }).where(eq(messages.id, id)).returning();
    return updatedMessage;
  }
  // Review methods
  async getReviewsForSeller(sellerId) {
    return db.select().from(reviews).where(eq(reviews.sellerId, sellerId)).orderBy(desc(reviews.createdAt));
  }
  async getReviewForListing(listingId, reviewerId) {
    const result = await db.select().from(reviews).where(
      and(
        eq(reviews.listingId, listingId),
        eq(reviews.reviewerId, reviewerId)
      )
    );
    return result[0];
  }
  async createReview(insertReview, reviewerId) {
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      reviewerId
    }).returning();
    return review;
  }
  // Favorite methods
  async getUserFavorites(userId) {
    const result = await db.select().from(listings).innerJoin(favorites, eq(listings.id, favorites.listingId)).where(eq(favorites.userId, userId));
    return result.map((row) => row.listings);
  }
  async addToFavorites(userId, listingId) {
    const existing = await db.select().from(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.listingId, listingId)
      )
    );
    if (existing.length > 0) {
      return existing[0];
    }
    const [favorite] = await db.insert(favorites).values({
      userId,
      listingId
    }).returning();
    return favorite;
  }
  async removeFromFavorites(userId, listingId) {
    const result = await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.listingId, listingId)
      )
    ).returning();
    return result.length > 0;
  }
  async isFavorite(userId, listingId) {
    const result = await db.select().from(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.listingId, listingId)
      )
    );
    return result.length > 0;
  }
  // Wallet methods
  async getUserWalletBalance(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.walletBalance.toString();
  }
  async getUserWalletTransactions(userId) {
    return db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt));
  }
  async addToWallet(userId, amount, reference) {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    const [transaction] = await db.insert(walletTransactions).values({
      userId,
      amount: amount.toString(),
      type: "deposit",
      status: "completed",
      reference: reference || null
    }).returning();
    await db.update(users).set({
      walletBalance: sql2`${users.walletBalance} + ${amount}`
    }).where(eq(users.id, userId));
    return transaction;
  }
  async withdrawFromWallet(userId, amount, reference) {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const currentBalance = parseFloat(user.walletBalance.toString());
    if (currentBalance < amount) {
      throw new Error("Insufficient wallet balance");
    }
    const [transaction] = await db.insert(walletTransactions).values({
      userId,
      amount: amount.toString(),
      type: "withdraw",
      status: "completed",
      reference: reference || null
    }).returning();
    await db.update(users).set({
      walletBalance: sql2`${users.walletBalance} - ${amount}`
    }).where(eq(users.id, userId));
    return transaction;
  }
  // Order methods
  async getUserOrders(userId) {
    return db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
  }
  async getUserSales(userId) {
    return db.select().from(orders).where(eq(orders.sellerId, userId)).orderBy(desc(orders.createdAt));
  }
  async getOrderById(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }
  async createOrder(buyerId, sellerId, listingId, amount) {
    if (buyerId === sellerId) {
      throw new Error("Buyer and seller cannot be the same user");
    }
    const buyer = await this.getUser(buyerId);
    if (!buyer) {
      throw new Error("Buyer not found");
    }
    const currentBalance = parseFloat(buyer.walletBalance.toString());
    if (currentBalance < amount) {
      throw new Error("Insufficient wallet balance");
    }
    const [order] = await db.insert(orders).values({
      buyerId,
      sellerId,
      listingId,
      amount: amount.toString(),
      status: "pending"
    }).returning();
    await this.withdrawFromWallet(buyerId, amount, `Order #${order.id}`);
    return order;
  }
  async updateOrderStatus(id, status) {
    if (!["pending", "completed", "cancelled"].includes(status)) {
      throw new Error("Invalid order status");
    }
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status === "completed") {
      throw new Error("Cannot update a completed order");
    }
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    if (status === "completed" && order.status !== "completed") {
      const amount = parseFloat(order.amount.toString());
      await this.addToWallet(order.sellerId, amount, `Order #${order.id}`);
    }
    if (status === "cancelled" && order.status === "pending") {
      const amount = parseFloat(order.amount.toString());
      await this.addToWallet(order.buyerId, amount, `Refund: Order #${order.id}`);
    }
    return updatedOrder;
  }
  // Chat Support methods
  async getUserChatSupport(userId) {
    return db.select().from(chatSupportMessages).where(eq(chatSupportMessages.userId, userId)).orderBy(chatSupportMessages.createdAt);
  }
  async createChatSupportMessage(userId, content, isFromUser) {
    const [message] = await db.insert(chatSupportMessages).values({
      userId,
      content,
      isFromUser
    }).returning();
    return message;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import MemoryStore from "memorystore";
import { z as z2 } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage_config = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
var SessionStore = MemoryStore(session);
async function registerRoutes(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "campus-marketplace-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1e3 },
      // 24 hours
      store: new SessionStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      })
    })
  );
  const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };
  const isAdmin = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
  app2.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    next();
  }, express.static(uploadsDir));
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const { confirmPassword, ...userData } = validatedData;
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to log in" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user data" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      return res.json(categories2);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.json(category);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.get("/api/listings", async (req, res) => {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        condition,
        location,
        sellerId,
        limit,
        offset
      } = req.query;
      let categoryId;
      if (category) {
        const categoryObj = await storage.getCategoryBySlug(category);
        if (categoryObj) {
          categoryId = categoryObj.id;
        }
      }
      const listings2 = await storage.getListings({
        categoryId,
        search,
        minPrice: minPrice ? parseFloat(minPrice) : void 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
        condition,
        location,
        sellerId: sellerId ? parseInt(sellerId) : void 0,
        limit: limit ? parseInt(limit) : void 0,
        offset: offset ? parseInt(offset) : void 0
      });
      const listingsWithSellerInfo = await Promise.all(
        listings2.map(async (listing) => {
          const seller = await storage.getUser(listing.sellerId);
          if (!seller) {
            return { ...listing, seller: null };
          }
          const { password, ...sellerWithoutPassword } = seller;
          const reviews2 = await storage.getReviewsForSeller(seller.id);
          const avgRating = reviews2.length > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviews2.length : 0;
          let isFavorite = false;
          if (req.session.userId) {
            isFavorite = await storage.isFavorite(req.session.userId, listing.id);
          }
          return {
            ...listing,
            seller: sellerWithoutPassword,
            sellerRating: avgRating,
            reviewCount: reviews2.length,
            isFavorite
          };
        })
      );
      return res.json(listingsWithSellerInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch listings" });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      const seller = await storage.getUser(listing.sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      const { password, ...sellerWithoutPassword } = seller;
      const reviews2 = await storage.getReviewsForSeller(seller.id);
      const avgRating = reviews2.length > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviews2.length : 0;
      let isFavorite = false;
      if (req.session.userId) {
        isFavorite = await storage.isFavorite(req.session.userId, listing.id);
      }
      const relatedListings = await storage.getListings({
        categoryId: listing.categoryId,
        limit: 4
      });
      const filteredRelatedListings = relatedListings.filter((item) => item.id !== listing.id);
      return res.json({
        ...listing,
        seller: sellerWithoutPassword,
        sellerRating: avgRating,
        reviewCount: reviews2.length,
        isFavorite,
        relatedListings: filteredRelatedListings
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch listing" });
    }
  });
  app2.post("/api/listings", isAuthenticated, upload.array("images", 5), async (req, res) => {
    try {
      const files = req.files;
      const images = [];
      const attachments = [];
      files.forEach((file) => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith("image/")) {
          images.push(filePath);
        } else if (file.mimetype === "application/pdf") {
          attachments.push(filePath);
        }
      });
      const listingData = JSON.parse(req.body.data);
      const validatedData = insertListingSchema.parse({
        ...listingData,
        images: images.length > 0 ? images : [],
        attachments: attachments.length > 0 ? attachments : void 0
      });
      const listing = await storage.createListing(validatedData, req.session.userId);
      return res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create listing" });
    }
  });
  app2.put("/api/listings/:id", isAuthenticated, upload.array("images", 5), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      if (listing.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      const files = req.files;
      const listingData = JSON.parse(req.body.data);
      let updatedImages = listing.images;
      let updatedAttachments = listing.attachments || [];
      if (files.length > 0) {
        const newImages = [];
        const newAttachments = [];
        files.forEach((file) => {
          const filePath = `/uploads/${file.filename}`;
          if (file.mimetype.startsWith("image/")) {
            newImages.push(filePath);
          } else if (file.mimetype === "application/pdf") {
            newAttachments.push(filePath);
          }
        });
        if (listingData.images !== void 0) {
          if (Array.isArray(listingData.images)) {
            updatedImages = [...listingData.images, ...newImages];
          } else if (listingData.images === null) {
            updatedImages = newImages;
          }
        } else if (newImages.length > 0) {
          updatedImages = [...listing.images, ...newImages];
        }
        if (listingData.attachments !== void 0) {
          if (Array.isArray(listingData.attachments)) {
            updatedAttachments = [...listingData.attachments, ...newAttachments];
          } else if (listingData.attachments === null) {
            updatedAttachments = newAttachments;
          }
        } else if (newAttachments.length > 0) {
          updatedAttachments = [...listing.attachments || [], ...newAttachments];
        }
      }
      const updatedListing = await storage.updateListing(id, {
        ...listingData,
        images: updatedImages,
        attachments: updatedAttachments.length > 0 ? updatedAttachments : void 0
      });
      return res.json(updatedListing);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update listing" });
    }
  });
  app2.delete("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      const user = await storage.getUser(req.session.userId);
      if (listing.sellerId !== req.session.userId && !user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      const success = await storage.deleteListing(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete listing" });
      }
      return res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete listing" });
    }
  });
  app2.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const listings2 = await storage.getUserFavorites(req.session.userId);
      const listingsWithSellerInfo = await Promise.all(
        listings2.map(async (listing) => {
          const seller = await storage.getUser(listing.sellerId);
          if (!seller) {
            return { ...listing, seller: null };
          }
          const { password, ...sellerWithoutPassword } = seller;
          const reviews2 = await storage.getReviewsForSeller(seller.id);
          const avgRating = reviews2.length > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviews2.length : 0;
          return {
            ...listing,
            seller: sellerWithoutPassword,
            sellerRating: avgRating,
            reviewCount: reviews2.length,
            isFavorite: true
          };
        })
      );
      return res.json(listingsWithSellerInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const listing = await storage.getListingById(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      const favorite = await storage.addToFavorites(req.session.userId, listingId);
      return res.status(201).json(favorite);
    } catch (error) {
      return res.status(500).json({ message: "Failed to add to favorites" });
    }
  });
  app2.delete("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const success = await storage.removeFromFavorites(req.session.userId, listingId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      return res.json({ message: "Removed from favorites successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });
  app2.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages2 = await storage.getMessagesByUser(req.session.userId);
      const conversations = {};
      for (const message of messages2) {
        const otherUserId = message.senderId === req.session.userId ? message.receiverId : message.senderId;
        const listingId = message.listingId;
        const conversationKey = `${otherUserId}-${listingId}`;
        if (!conversations[conversationKey]) {
          const otherUser = await storage.getUser(otherUserId);
          if (!otherUser) continue;
          const { password, ...otherUserWithoutPassword } = otherUser;
          const listing = await storage.getListingById(listingId);
          if (!listing) continue;
          conversations[conversationKey] = {
            otherUser: otherUserWithoutPassword,
            listing,
            messages: [],
            lastMessageAt: null,
            unreadCount: 0
          };
        }
        conversations[conversationKey].messages.push(message);
        if (!conversations[conversationKey].lastMessageAt || message.createdAt > conversations[conversationKey].lastMessageAt) {
          conversations[conversationKey].lastMessageAt = message.createdAt;
        }
        if (message.receiverId === req.session.userId && !message.read) {
          conversations[conversationKey].unreadCount++;
        }
      }
      const conversationArray = Object.values(conversations).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      return res.json(conversationArray);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/messages/:userId/:listingId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const listingId = parseInt(req.params.listingId);
      if (isNaN(otherUserId) || isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid user ID or listing ID" });
      }
      const messages2 = await storage.getMessagesBetweenUsers(req.session.userId, otherUserId, listingId);
      await Promise.all(
        messages2.filter((message) => message.receiverId === req.session.userId && !message.read).map((message) => storage.markMessageAsRead(message.id))
      );
      return res.json(messages2);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const receiver = await storage.getUser(validatedData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      const listing = await storage.getListingById(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      const message = await storage.createMessage(validatedData, req.session.userId);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/reviews/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      const seller = await storage.getUser(sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      const reviews2 = await storage.getReviewsForSeller(sellerId);
      const reviewsWithReviewerInfo = await Promise.all(
        reviews2.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          if (!reviewer) {
            return { ...review, reviewer: null };
          }
          const { password, ...reviewerWithoutPassword } = reviewer;
          return { ...review, reviewer: reviewerWithoutPassword };
        })
      );
      return res.json(reviewsWithReviewerInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const seller = await storage.getUser(validatedData.sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      const listing = await storage.getListingById(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      const existingReview = await storage.getReviewForListing(validatedData.listingId, req.session.userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this listing" });
      }
      const review = await storage.createReview(validatedData, req.session.userId);
      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create review" });
    }
  });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
  });
  app2.get("/api/wallet/balance", isAuthenticated, async (req, res) => {
    try {
      const balance = await storage.getUserWalletBalance(req.session.userId);
      return res.json({ balance });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });
  app2.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getUserWalletTransactions(req.session.userId);
      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });
  app2.post("/api/wallet/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      const amountInPaisa = Math.round(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaisa,
        currency: "inr",
        // Indian Rupee
        metadata: {
          userId: req.session.userId.toString(),
          type: "wallet_deposit"
        }
      });
      return res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Stripe error:", error);
      return res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  app2.post("/api/wallet/confirm-deposit", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId, amount } = req.body;
      if (!paymentIntentId || !amount) {
        return res.status(400).json({ message: "Payment intent ID and amount are required" });
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded" || paymentIntent.metadata.userId !== req.session.userId.toString() || paymentIntent.metadata.type !== "wallet_deposit") {
        return res.status(400).json({ message: "Invalid or unsuccessful payment" });
      }
      const transaction = await storage.addToWallet(
        req.session.userId,
        amount,
        `Deposit via Stripe: ${paymentIntentId}`
      );
      return res.json(transaction);
    } catch (error) {
      console.error("Error confirming deposit:", error);
      return res.status(500).json({ message: "Failed to confirm deposit" });
    }
  });
  app2.post("/api/wallet/withdraw", isAuthenticated, async (req, res) => {
    try {
      const { amount, accountDetails } = req.body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      if (!accountDetails) {
        return res.status(400).json({ message: "Account details are required for withdrawal" });
      }
      const balance = await storage.getUserWalletBalance(req.session.userId);
      if (parseFloat(balance) < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      const transaction = await storage.withdrawFromWallet(
        req.session.userId,
        amount,
        `Withdrawal to account: ${JSON.stringify(accountDetails).substring(0, 50)}...`
      );
      return res.json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });
  app2.get("/api/orders/my-orders", isAuthenticated, async (req, res) => {
    try {
      const orders2 = await storage.getUserOrders(req.session.userId);
      return res.json(orders2);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/my-sales", isAuthenticated, async (req, res) => {
    try {
      const sales = await storage.getUserSales(req.session.userId);
      return res.json(sales);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.buyerId !== req.session.userId && order.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { listingId } = req.body;
      if (!listingId) {
        return res.status(400).json({ message: "Listing ID is required" });
      }
      const listing = await storage.getListingById(parseInt(listingId));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      if (listing.sellerId === req.session.userId) {
        return res.status(400).json({ message: "You cannot buy your own listing" });
      }
      const balance = await storage.getUserWalletBalance(req.session.userId);
      if (parseFloat(balance) < listing.price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      const order = await storage.createOrder(
        req.session.userId,
        listing.sellerId,
        listing.id,
        listing.price
      );
      return res.status(201).json(order);
    } catch (error) {
      return res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isBuyer = order.buyerId === req.session.userId;
      const isSeller = order.sellerId === req.session.userId;
      if (!isBuyer && !isSeller) {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      if (order.status === "pending" && status === "completed" && isBuyer) {
        const updatedOrder = await storage.updateOrderStatus(id, status);
        return res.json(updatedOrder);
      } else if (order.status === "pending" && status === "cancelled") {
        const updatedOrder = await storage.updateOrderStatus(id, status);
        return res.json(updatedOrder);
      } else {
        return res.status(400).json({
          message: "Invalid status transition or you don't have permission to perform this action"
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/chat-support", isAuthenticated, async (req, res) => {
    try {
      const messages2 = await storage.getUserChatSupport(req.session.userId);
      return res.json(messages2);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch chat support messages" });
    }
  });
  app2.post("/api/chat-support", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const userMessage = await storage.createChatSupportMessage(
        req.session.userId,
        content,
        true
        // isFromUser = true
      );
      const botResponse = await storage.createChatSupportMessage(
        req.session.userId,
        "Thanks for your message! Our support team will get back to you soon.",
        false
        // isFromUser = false
      );
      return res.json([userMessage, botResponse]);
    } catch (error) {
      return res.status(500).json({ message: "Failed to send message" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "/CampusMarket/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
import { eq as eq2, sql as sql3 } from "drizzle-orm";
async function seedDatabase() {
  console.log("\u{1F331} Seeding database with demo data...");
  try {
    const testUsers = [
      {
        username: "janesmith",
        email: "jane@campus.edu",
        displayName: "Jane Smith",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        username: "mikebrown",
        email: "mike@campus.edu",
        displayName: "Mike Brown",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        username: "sarahlee",
        email: "sarah@campus.edu",
        displayName: "Sarah Lee",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/women/67.jpg"
      },
      {
        username: "alexjohnson",
        email: "alex@campus.edu",
        displayName: "Alex Johnson",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/men/91.jpg"
      }
    ];
    for (const userData of testUsers) {
      const existingUser = await db.select().from(users).where(eq2(users.email, userData.email)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          username: userData.username,
          password: userData.password,
          email: userData.email,
          displayName: userData.displayName,
          avatar: userData.avatar,
          isAdmin: false
        });
      }
    }
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map((u) => [u.email, u.id]));
    const demoListings = [
      // Lecture Notes
      {
        title: "Organic Chemistry Complete Notes",
        description: "Comprehensive notes for Organic Chemistry 101 covering all semester topics including reactions, mechanisms, and nomenclature. Color-coded and organized by chapter with practice problem solutions included.",
        price: 35,
        sellerEmail: "jane@campus.edu",
        condition: "Like New",
        location: "Science Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1422&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Calculus II Study Guide with Examples",
        description: "Detailed study guide for Calculus II with step-by-step examples, all theorems, and practice problems. Perfect for final exam preparation.",
        price: 25,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Math Department",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Psychology 101 Complete Lecture Notes",
        description: "Comprehensive notes covering developmental psychology, cognitive psychology, behavioral theory, and more. Includes diagrams and study questions.",
        price: 30,
        sellerEmail: "sarah@campus.edu",
        condition: "Like New",
        location: "Psychology Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Computer Science Data Structures Notes",
        description: "Detailed notes on arrays, linked lists, trees, graphs, and algorithm complexity. Includes pseudocode examples and complexity analysis.",
        price: 40,
        sellerEmail: "alex@campus.edu",
        condition: "Excellent",
        location: "Computer Science Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1469&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Introduction to Economics Notes",
        description: "Complete semester notes for Intro to Economics covering micro and macro concepts. Charts, graphs, and practice problems included.",
        price: 28,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Business School",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1526&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Physics Mechanics Study Guide",
        description: "Comprehensive study guide for Physics I (Mechanics). Includes formulas, diagrams, example problems, and exam prep questions.",
        price: 32,
        sellerEmail: "mike@campus.edu",
        condition: "Like New",
        location: "Physics Department",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Textbooks
      {
        title: "Campbell Biology 12th Edition",
        description: "Campbell Biology 12th edition in excellent condition. Minimal highlighting, no damaged pages. Includes access code for online resources.",
        price: 75,
        sellerEmail: "sarah@campus.edu",
        condition: "Like New",
        location: "Science Library",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1473&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Principles of Microeconomics - Mankiw",
        description: "8th edition of Principles of Microeconomics by Gregory Mankiw. Great condition with minimal wear.",
        price: 55,
        sellerEmail: "alex@campus.edu",
        condition: "Good",
        location: "Economics Department",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=1476&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Introduction to Algorithms - Cormen",
        description: "Classic computer science textbook on algorithms. Third edition in good condition with some highlighting in important sections.",
        price: 60,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Computer Science Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Organic Chemistry - Bruice",
        description: "Organic Chemistry 8th edition by Paula Bruice. Complete with study guide and solution manual. Minor wear on cover.",
        price: 65,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Chemistry Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=1361&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Psychology: The Science of Mind and Behavior",
        description: "Latest edition of this comprehensive psychology textbook. Clean pages with minimal highlighting.",
        price: 50,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Psychology Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1576872381149-7847515ce5d8?auto=format&fit=crop&q=80&w=1472&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Calculus: Early Transcendentals",
        description: "James Stewart's Calculus textbook. No writing or highlighting inside. Perfect for Calculus I, II, and III courses.",
        price: 70,
        sellerEmail: "alex@campus.edu",
        condition: "Like New",
        location: "Mathematics Department",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      // Furniture
      {
        title: "Queen Size Mattress - 1 Year Old",
        description: "Sealy Posturepedic queen mattress, very comfortable and in excellent condition. Only 1 year old. Mattress protector always used. Selling because I'm moving out of state.",
        price: 250,
        sellerEmail: "jane@campus.edu",
        condition: "Like New",
        location: "University Apartments",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1631052066179-9487293567c7?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Study Desk with Chair",
        description: "IKEA desk and chair set in good condition. Desk has two drawers and plenty of workspace. Chair is adjustable height. Perfect for dorm or apartment.",
        price: 85,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Off-campus Housing",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1536&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Twin XL Mattress - Perfect for Dorms",
        description: "Memory foam twin XL mattress, perfect for dorm beds. Used for one year only, in excellent condition. Includes mattress protector.",
        price: 120,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Campus Dorms",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1592789705501-eaad6c950fc9?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Small Bookshelf - 3 Shelves",
        description: "Compact bookshelf with 3 shelves, perfect for textbooks and supplies. Easily fits in dorm room or apartment.",
        price: 40,
        sellerEmail: "alex@campus.edu",
        condition: "Good",
        location: "Near Student Center",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=1399&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Futon - Converts to Bed",
        description: "Black futon that easily converts from sofa to bed. Great for dorm rooms or small apartments when you have guests. Minor wear but very comfortable.",
        price: 95,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Off-campus Housing",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Comfortable Dorm Chair",
        description: "Padded desk chair with adjustable height. Much more comfortable than standard dorm chairs. Easy to transport.",
        price: 45,
        sellerEmail: "mike@campus.edu",
        condition: "Like New",
        location: "Campus Dorms",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Electronics
      {
        title: "TI-84 Plus CE Graphing Calculator",
        description: "TI-84 Plus CE graphing calculator in perfect working condition. Used for one semester of calculus. Comes with charging cable and case.",
        price: 80,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Math Building",
        categoryId: categoryMap.get("electronics") || 13,
        imageUrls: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80&w=1386&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Apple iPad Air (2020) - 64GB",
        description: "iPad Air 2020 model in excellent condition. 64GB storage, space gray color. Perfect for note-taking and textbooks. Includes charger and case.",
        price: 350,
        sellerEmail: "alex@campus.edu",
        condition: "Like New",
        location: "Library",
        categoryId: categoryMap.get("electronics") || 13,
        imageUrls: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1557&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Dorm Essentials
      {
        title: "Mini Refrigerator",
        description: "Compact dorm refrigerator (3.2 cubic feet) with small freezer section. Works perfectly. Great for keeping snacks and drinks cold.",
        price: 75,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "South Campus Dorms",
        categoryId: categoryMap.get("dorm-essentials") || 14,
        imageUrls: ["https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Microwave - Perfect for Dorms",
        description: "Compact 700W microwave, perfect for dorm use. Clean and works perfectly. Easy to transport.",
        price: 40,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "North Campus Dorms",
        categoryId: categoryMap.get("dorm-essentials") || 14,
        imageUrls: ["https://images.unsplash.com/photo-1574179629957-c89281248196?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      }
    ];
    let addedCount = 0;
    for (const listingData of demoListings) {
      const sellerId = userMap.get(listingData.sellerEmail);
      if (!sellerId) continue;
      const existingListing = await db.select().from(listings).where(
        eq2(listings.title, listingData.title)
      ).limit(1);
      if (existingListing.length === 0) {
        const { sellerEmail, imageUrls, ...insertData } = listingData;
        await db.insert(listings).values({
          ...insertData,
          sellerId,
          images: imageUrls
        });
        await db.update(categories).set({ itemCount: sql3`${categories.itemCount} + 1` }).where(eq2(categories.id, insertData.categoryId));
        addedCount++;
      }
    }
    console.log(`Added ${addedCount} new listings`);
    console.log("\u2705 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5173;
  server.listen(port, "localhost", () => {
    console.log("\n\u{1F680} Server started successfully!");
    console.log("\u{1F4F1} Open the application in your browser:");
    console.log("\x1B[36m%s\x1B[0m", `   http://localhost:${port}
`);
  });
})();
