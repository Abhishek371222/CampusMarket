import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  campus: text("campus").default("Main Campus"),
  avatar: text("avatar"),
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
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: decimal("total").notNull(),
  status: text("status").notNull(), // Processing, Shipped, Delivered
  createdAt: timestamp("created_at").defaultNow(),
  items: jsonb("items").notNull(), // Array of product details
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
