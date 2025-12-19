import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // hashed password
  name: text("name").notNull(),
  campus: text("campus").default("Main Campus"),
  avatar: text("avatar"),
  bio: text("bio").default(""),
  phone: text("phone"),
  rating: decimal("rating").default("5.0"),
  reviewCount: integer("review_count").default(0),
  totalListings: integer("total_listings").default(0),
  role: text("role").notNull().default("user"), // user, seller, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  condition: text("condition").notNull(), // New, Used - Like New, Used - Good, Used - Fair
  category: text("category").notNull(),
  image: text("image").notNull(),
  sellerId: integer("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerRating: decimal("seller_rating").default("5.0"),
  status: text("status").notNull().default("active"), // active, sold, archived
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: decimal("total").notNull(),
  status: text("status").notNull(), // Created, Paid, Shipped, Delivered, Cancelled
  createdAt: timestamp("created_at").defaultNow(),
  items: jsonb("items").notNull(), // Array of product details
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // order_update, message, price_drop, system
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type Review = typeof reviews.$inferSelect;
