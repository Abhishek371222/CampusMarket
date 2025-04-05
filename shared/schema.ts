import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  bio: text("bio"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  campus: text("campus"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Listing categories
export const listingCategories = [
  "furniture",
  "textbooks",
  "electronics",
  "clothing",
  "academic",
  "accessories",
  "other"
] as const;

export const conditions = [
  "new",
  "like-new",
  "good",
  "fair",
  "poor"
] as const;

// Listings schema
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  images: text("images").array().notNull(),
  pdfUrl: text("pdf_url"),
  isUrgent: boolean("is_urgent").default(false),
  isSold: boolean("is_sold").default(false),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  listingId: integer("listing_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  listingId: integer("listing_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Saved listings schema
export const savedListings = pgTable("saved_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSavedListingSchema = createInsertSchema(savedListings).omit({
  id: true,
  createdAt: true
});

export type InsertSavedListing = z.infer<typeof insertSavedListingSchema>;
export type SavedListing = typeof savedListings.$inferSelect;
