import { db } from "./db";
import {
  users,
  products,
  orders,
  reviews,
  favorites,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Favorite,
  type Review,
} from "@shared/schema";
import { and, eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Product[]>;
  
  getOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  getFavorites(userId: number): Promise<Favorite[]>;
  toggleFavorite(userId: number, productId: number): Promise<"added" | "removed">;

  getReviewsForProduct(productId: number): Promise<
    {
      id: number;
      productId: number;
      sellerId: number;
      buyerId: number;
      rating: number;
      comment: string | null;
      createdAt: Date | null;
      buyerName: string | null;
    }[]
  >;
  createReview(input: {
    productId: number;
    sellerId: number;
    buyerId: number;
    rating: number;
    comment?: string;
  }): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async searchProducts(query: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Product[]> {
    const conditions = [];
    if (query.q) {
      const pattern = `%${query.q}%`;
      conditions.push(
        or(
          ilike(products.title, pattern),
          ilike(products.description, pattern),
          ilike(products.category, pattern),
        ),
      );
    }
    if (query.category) {
      conditions.push(eq(products.category, query.category));
    }
    if (query.status) {
      conditions.push(eq(products.status, query.status));
    }
    // price range filtering can be done application-side if needed,
    // or via SQL if decimal comparison is configured.

    if (conditions.length === 0) {
      return this.getProducts();
    }

    return await db
      .select()
      .from(products)
      .where(and(...conditions));
  }

  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getFavorites(userId: number): Promise<Favorite[]> {
    const rows = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return rows;
  }

  async toggleFavorite(userId: number, productId: number): Promise<"added" | "removed"> {
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
      return "removed";
    }

    await db.insert(favorites).values({ userId, productId });
    return "added";
  }

  async getReviewsForProduct(productId: number) {
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        sellerId: reviews.sellerId,
        buyerId: reviews.buyerId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        buyerName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.buyerId, users.id))
      .where(eq(reviews.productId, productId));

    return rows;
  }

  async createReview(input: {
    productId: number;
    sellerId: number;
    buyerId: number;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        productId: input.productId,
        sellerId: input.sellerId,
        buyerId: input.buyerId,
        rating: input.rating,
        comment: input.comment,
      })
      .returning();
    return review;
  }
}

export const storage = new DatabaseStorage();
