import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import MemoryStore from "memorystore";
import { z } from "zod";
import Stripe from "stripe";

// Extend the session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}
import { 
  insertUserSchema, insertListingSchema, insertMessageSchema, insertReviewSchema,
  insertWalletTransactionSchema, insertOrderSchema, insertChatSupportMessageSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Create a session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "campus-marketplace-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    return next();
  };

  // Serve uploads directory
  app.use('/uploads', (req, res, next) => {
    // Check if the file exists
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    next();
  }, express.static(uploadsDir));

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user (excluding confirmPassword)
      const { confirmPassword, ...userData } = validatedData;
      const user = await storage.createUser(userData);
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
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

  // Listings Routes
  app.get("/api/listings", async (req, res) => {
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
      
      let categoryId: number | undefined;
      
      // If category is provided as a slug, convert it to categoryId
      if (category) {
        const categoryObj = await storage.getCategoryBySlug(category as string);
        if (categoryObj) {
          categoryId = categoryObj.id;
        }
      }
      
      const listings = await storage.getListings({
        categoryId,
        search: search as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        condition: condition as string | undefined,
        location: location as string | undefined,
        sellerId: sellerId ? parseInt(sellerId as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      // For each listing, get the seller info (excluding password)
      const listingsWithSellerInfo = await Promise.all(
        listings.map(async (listing) => {
          const seller = await storage.getUser(listing.sellerId);
          if (!seller) {
            return { ...listing, seller: null };
          }
          
          const { password, ...sellerWithoutPassword } = seller;
          
          // Get seller ratings
          const reviews = await storage.getReviewsForSeller(seller.id);
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;
          
          // Check if the listing is favorited by the current user
          let isFavorite = false;
          if (req.session.userId) {
            isFavorite = await storage.isFavorite(req.session.userId, listing.id);
          }
          
          return { 
            ...listing, 
            seller: sellerWithoutPassword,
            sellerRating: avgRating,
            reviewCount: reviews.length,
            isFavorite
          };
        })
      );
      
      return res.json(listingsWithSellerInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get seller info
      const seller = await storage.getUser(listing.sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      const { password, ...sellerWithoutPassword } = seller;
      
      // Get seller ratings
      const reviews = await storage.getReviewsForSeller(seller.id);
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      // Check if the listing is favorited by the current user
      let isFavorite = false;
      if (req.session.userId) {
        isFavorite = await storage.isFavorite(req.session.userId, listing.id);
      }
      
      // Get related listings
      const relatedListings = await storage.getListings({
        categoryId: listing.categoryId,
        limit: 4
      });
      
      // Exclude the current listing from related listings
      const filteredRelatedListings = relatedListings.filter(item => item.id !== listing.id);
      
      return res.json({
        ...listing,
        seller: sellerWithoutPassword,
        sellerRating: avgRating,
        reviewCount: reviews.length,
        isFavorite,
        relatedListings: filteredRelatedListings
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post("/api/listings", isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
      // Get the uploaded files
      const files = req.files as Express.Multer.File[];
      
      // Separate images and attachments
      const images: string[] = [];
      const attachments: string[] = [];
      
      files.forEach(file => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          images.push(filePath);
        } else if (file.mimetype === 'application/pdf') {
          attachments.push(filePath);
        }
      });
      
      // Parse the listing data from the request body
      const listingData = JSON.parse(req.body.data);
      
      // Validate the listing data
      const validatedData = insertListingSchema.parse({
        ...listingData,
        images: images.length > 0 ? images : [],
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      // Create the listing
      const listing = await storage.createListing(validatedData, req.session.userId!);
      
      return res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put("/api/listings/:id", isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user is the seller
      if (listing.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      // Get the uploaded files
      const files = req.files as Express.Multer.File[];
      
      // Get the listing data from the request body
      const listingData = JSON.parse(req.body.data);
      
      let updatedImages = listing.images;
      let updatedAttachments = listing.attachments || [];
      
      // Handle images and attachments if files are uploaded
      if (files.length > 0) {
        // Separate images and attachments
        const newImages: string[] = [];
        const newAttachments: string[] = [];
        
        files.forEach(file => {
          const filePath = `/uploads/${file.filename}`;
          if (file.mimetype.startsWith('image/')) {
            newImages.push(filePath);
          } else if (file.mimetype === 'application/pdf') {
            newAttachments.push(filePath);
          }
        });
        
        // Update images if specified
        if (listingData.images !== undefined) {
          if (Array.isArray(listingData.images)) {
            // Combine existing images with new ones
            updatedImages = [...listingData.images, ...newImages];
          } else if (listingData.images === null) {
            // Replace all images with new ones
            updatedImages = newImages;
          }
        } else if (newImages.length > 0) {
          // Append new images to existing ones
          updatedImages = [...listing.images, ...newImages];
        }
        
        // Update attachments if specified
        if (listingData.attachments !== undefined) {
          if (Array.isArray(listingData.attachments)) {
            // Combine existing attachments with new ones
            updatedAttachments = [...listingData.attachments, ...newAttachments];
          } else if (listingData.attachments === null) {
            // Replace all attachments with new ones
            updatedAttachments = newAttachments;
          }
        } else if (newAttachments.length > 0) {
          // Append new attachments to existing ones
          updatedAttachments = [...(listing.attachments || []), ...newAttachments];
        }
      }
      
      // Update the listing
      const updatedListing = await storage.updateListing(id, {
        ...listingData,
        images: updatedImages,
        attachments: updatedAttachments.length > 0 ? updatedAttachments : undefined
      });
      
      return res.json(updatedListing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user is the seller or an admin
      const user = await storage.getUser(req.session.userId!);
      if (listing.sellerId !== req.session.userId && !user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      // Delete the listing
      const success = await storage.deleteListing(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete listing" });
      }
      
      return res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Favorites Routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const listings = await storage.getUserFavorites(req.session.userId!);
      
      // Add seller info to each listing
      const listingsWithSellerInfo = await Promise.all(
        listings.map(async (listing) => {
          const seller = await storage.getUser(listing.sellerId);
          if (!seller) {
            return { ...listing, seller: null };
          }
          
          const { password, ...sellerWithoutPassword } = seller;
          
          // Get seller ratings
          const reviews = await storage.getReviewsForSeller(seller.id);
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;
          
          return { 
            ...listing, 
            seller: sellerWithoutPassword,
            sellerRating: avgRating,
            reviewCount: reviews.length,
            isFavorite: true
          };
        })
      );
      
      return res.json(listingsWithSellerInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Add to favorites
      const favorite = await storage.addToFavorites(req.session.userId!, listingId);
      
      return res.status(201).json(favorite);
    } catch (error) {
      return res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Remove from favorites
      const success = await storage.removeFromFavorites(req.session.userId!, listingId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      return res.json({ message: "Removed from favorites successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Messages Routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.session.userId!);
      
      // Group messages by conversation (unique combination of other user and listing)
      const conversations: Record<string, any> = {};
      
      for (const message of messages) {
        const otherUserId = message.senderId === req.session.userId ? message.receiverId : message.senderId;
        const listingId = message.listingId;
        const conversationKey = `${otherUserId}-${listingId}`;
        
        if (!conversations[conversationKey]) {
          // Get other user info
          const otherUser = await storage.getUser(otherUserId);
          if (!otherUser) continue;
          
          const { password, ...otherUserWithoutPassword } = otherUser;
          
          // Get listing info
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
        
        // Update last message time
        if (!conversations[conversationKey].lastMessageAt || 
            message.createdAt > conversations[conversationKey].lastMessageAt) {
          conversations[conversationKey].lastMessageAt = message.createdAt;
        }
        
        // Count unread messages
        if (message.receiverId === req.session.userId && !message.read) {
          conversations[conversationKey].unreadCount++;
        }
      }
      
      // Convert to array and sort by last message time
      const conversationArray = Object.values(conversations)
        .sort((a: any, b: any) => b.lastMessageAt - a.lastMessageAt);
      
      return res.json(conversationArray);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:userId/:listingId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const listingId = parseInt(req.params.listingId);
      
      if (isNaN(otherUserId) || isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid user ID or listing ID" });
      }
      
      // Get messages between users for the specific listing
      const messages = await storage.getMessagesBetweenUsers(req.session.userId!, otherUserId, listingId);
      
      // Mark received messages as read
      await Promise.all(
        messages
          .filter(message => message.receiverId === req.session.userId && !message.read)
          .map(message => storage.markMessageAsRead(message.id))
      );
      
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Check if the receiver exists
      const receiver = await storage.getUser(validatedData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Create the message
      const message = await storage.createMessage(validatedData, req.session.userId!);
      
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Reviews Routes
  app.get("/api/reviews/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      // Check if the seller exists
      const seller = await storage.getUser(sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      // Get reviews for the seller
      const reviews = await storage.getReviewsForSeller(sellerId);
      
      // Add reviewer info to each review
      const reviewsWithReviewerInfo = await Promise.all(
        reviews.map(async (review) => {
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

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Check if the seller exists
      const seller = await storage.getUser(validatedData.sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user has already reviewed this listing
      const existingReview = await storage.getReviewForListing(validatedData.listingId, req.session.userId!);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this listing" });
      }
      
      // Create the review
      const review = await storage.createReview(validatedData, req.session.userId!);
      
      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  });

  // Wallet Routes
  app.get("/api/wallet/balance", isAuthenticated, async (req, res) => {
    try {
      const balance = await storage.getUserWalletBalance(req.session.userId);
      return res.json({ balance });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  app.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getUserWalletTransactions(req.session.userId);
      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Stripe payment intent for adding funds to wallet
  app.post("/api/wallet/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      // Convert amount to paisa (Stripe requires smallest currency unit)
      const amountInPaisa = Math.round(amount * 100);

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaisa,
        currency: 'inr', // Indian Rupee
        metadata: {
          userId: req.session.userId.toString(),
          type: 'wallet_deposit'
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

  // Confirm wallet deposit after successful Stripe payment
  app.post("/api/wallet/confirm-deposit", isAuthenticated, async (req, res) => {
    try {
      const { paymentIntentId, amount } = req.body;
      
      if (!paymentIntentId || !amount) {
        return res.status(400).json({ message: "Payment intent ID and amount are required" });
      }

      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (
        paymentIntent.status !== 'succeeded' || 
        paymentIntent.metadata.userId !== req.session.userId.toString() ||
        paymentIntent.metadata.type !== 'wallet_deposit'
      ) {
        return res.status(400).json({ message: "Invalid or unsuccessful payment" });
      }

      // Add the amount to the user's wallet
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

  // Withdraw funds from wallet
  app.post("/api/wallet/withdraw", isAuthenticated, async (req, res) => {
    try {
      const { amount, accountDetails } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (!accountDetails) {
        return res.status(400).json({ message: "Account details are required for withdrawal" });
      }

      // Check if user has sufficient balance
      const balance = await storage.getUserWalletBalance(req.session.userId);
      if (parseFloat(balance) < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Process the withdrawal (in a real app, this would initiate a bank transfer)
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

  // Order Routes
  app.get("/api/orders/my-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId);
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/my-sales", isAuthenticated, async (req, res) => {
    try {
      const sales = await storage.getUserSales(req.session.userId);
      return res.json(sales);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is either the buyer or the seller
      if (order.buyerId !== req.session.userId && order.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { listingId } = req.body;
      
      if (!listingId) {
        return res.status(400).json({ message: "Listing ID is required" });
      }
      
      // Check if the listing exists
      const listing = await storage.getListingById(parseInt(listingId));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user is not buying their own listing
      if (listing.sellerId === req.session.userId) {
        return res.status(400).json({ message: "You cannot buy your own listing" });
      }
      
      // Check if user has sufficient wallet balance
      const balance = await storage.getUserWalletBalance(req.session.userId);
      if (parseFloat(balance) < listing.price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Create the order
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

  app.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Check if the order exists
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is either the buyer or the seller
      const isBuyer = order.buyerId === req.session.userId;
      const isSeller = order.sellerId === req.session.userId;
      
      if (!isBuyer && !isSeller) {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      
      // Validate status transitions based on current status and user role
      if (order.status === 'pending' && status === 'completed' && isBuyer) {
        // Only buyer can mark order as completed from pending state
        const updatedOrder = await storage.updateOrderStatus(id, status);
        return res.json(updatedOrder);
      } else if (order.status === 'pending' && status === 'cancelled') {
        // Both buyer and seller can cancel a pending order
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

  // Chat Support Routes
  app.get("/api/chat-support", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getUserChatSupport(req.session.userId);
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch chat support messages" });
    }
  });

  app.post("/api/chat-support", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Create user message
      const userMessage = await storage.createChatSupportMessage(
        req.session.userId,
        content,
        true // isFromUser = true
      );
      
      // Here you would typically integrate with a chatbot API or service
      // For now, we'll create a simple automated response
      const botResponse = await storage.createChatSupportMessage(
        req.session.userId,
        "Thanks for your message! Our support team will get back to you soon.",
        false // isFromUser = false
      );
      
      return res.json([userMessage, botResponse]);
    } catch (error) {
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
