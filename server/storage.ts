import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  listings, type Listing, type InsertListing,
  messages, type Message, type InsertMessage,
  reviews, type Review, type InsertReview,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Listing methods
  getListings(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    sellerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing, sellerId: number): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Message methods
  getMessagesByUser(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number, listingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage, senderId: number): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Review methods
  getReviewsForSeller(sellerId: number): Promise<Review[]>;
  getReviewForListing(listingId: number, reviewerId: number): Promise<Review | undefined>;
  createReview(review: InsertReview, reviewerId: number): Promise<Review>;
  
  // Favorite methods
  getUserFavorites(userId: number): Promise<Listing[]>;
  addToFavorites(userId: number, listingId: number): Promise<Favorite>;
  removeFromFavorites(userId: number, listingId: number): Promise<boolean>;
  isFavorite(userId: number, listingId: number): Promise<boolean>;
}

// Initialize the database with seed categories
async function initializeDatabase() {
  // Check if categories exist
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    // Seed categories
    const defaultCategories: InsertCategory[] = [
      { name: "Ethnic Wear", slug: "ethnic-wear" },
      { name: "Streetwear", slug: "streetwear" },
      { name: "Athleisure", slug: "athleisure" },
      { name: "Luxury Accessories", slug: "luxury-accessories" },
      { name: "Sustainable Fashion", slug: "sustainable-fashion" },
      { name: "Vintage Clothing", slug: "vintage-clothing" },
      { name: "Footwear", slug: "footwear" },
      { name: "Jewelry", slug: "jewelry" }
    ];

    for (const category of defaultCategories) {
      await db.insert(categories).values({
        ...category,
        itemCount: 0
      });
    }
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize the database with seed data
    initializeDatabase().catch(error => {
      console.error("Failed to initialize database:", error);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false
    }).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values({
      ...insertCategory,
      itemCount: 0
    }).returning();
    return category;
  }

  // Listing methods
  async getListings(filters: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    sellerId?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<Listing[]> {
    let query = db.select().from(listings);
    
    // Apply filters
    const whereConditions = [];
    
    if (filters.categoryId !== undefined) {
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
    
    if (filters.minPrice !== undefined) {
      whereConditions.push(gte(listings.price, filters.minPrice));
    }
    
    if (filters.maxPrice !== undefined) {
      whereConditions.push(lte(listings.price, filters.maxPrice));
    }
    
    if (filters.condition) {
      whereConditions.push(eq(listings.condition, filters.condition));
    }
    
    if (filters.location) {
      whereConditions.push(eq(listings.location, filters.location));
    }
    
    if (filters.sellerId !== undefined) {
      whereConditions.push(eq(listings.sellerId, filters.sellerId));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    // Sort by newest first
    query = query.orderBy(desc(listings.createdAt));
    
    // Apply pagination
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Execute the query and return the results
    return await query;
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    const result = await db.select().from(listings).where(eq(listings.id, id));
    return result[0];
  }

  async createListing(insertListing: InsertListing, sellerId: number): Promise<Listing> {
    // Start a transaction to ensure atomicity
    const [listing] = await db.insert(listings).values({
      ...insertListing,
      sellerId
    }).returning();
    
    // Update category item count
    await db.update(categories)
      .set({ itemCount: sql`${categories.itemCount} + 1` })
      .where(eq(categories.id, insertListing.categoryId));
    
    return listing;
  }

  async updateListing(id: number, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const [updatedListing] = await db.update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();
    
    return updatedListing;
  }

  async deleteListing(id: number): Promise<boolean> {
    // Get the listing first to get the category ID
    const existingListing = await this.getListingById(id);
    if (!existingListing) return false;
    
    // Delete the listing
    const deletedListings = await db.delete(listings)
      .where(eq(listings.id, id))
      .returning();
    
    if (deletedListings.length === 0) return false;
    
    // Update category item count
    await db.update(categories)
      .set({ itemCount: sql`GREATEST(${categories.itemCount} - 1, 0)` })
      .where(eq(categories.id, existingListing.categoryId));
    
    return true;
  }

  // Message methods
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number, listingId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(
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
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage, senderId: number): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      senderId,
      read: false
    }).returning();
    
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    
    return updatedMessage;
  }

  // Review methods
  async getReviewsForSeller(sellerId: number): Promise<Review[]> {
    return db.select()
      .from(reviews)
      .where(eq(reviews.sellerId, sellerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewForListing(listingId: number, reviewerId: number): Promise<Review | undefined> {
    const result = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.listingId, listingId),
          eq(reviews.reviewerId, reviewerId)
        )
      );
    
    return result[0];
  }

  async createReview(insertReview: InsertReview, reviewerId: number): Promise<Review> {
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      reviewerId
    }).returning();
    
    return review;
  }

  // Favorite methods
  async getUserFavorites(userId: number): Promise<Listing[]> {
    const result = await db.select()
      .from(listings)
      .innerJoin(favorites, eq(listings.id, favorites.listingId))
      .where(eq(favorites.userId, userId));
    
    return result.map(row => row.listings);
  }

  async addToFavorites(userId: number, listingId: number): Promise<Favorite> {
    // Check if it already exists
    const existing = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.listingId, listingId)
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Create a new favorite
    const [favorite] = await db.insert(favorites).values({
      userId,
      listingId
    }).returning();
    
    return favorite;
  }

  async removeFromFavorites(userId: number, listingId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.listingId, listingId)
        )
      )
      .returning();
    
    return result.length > 0;
  }

  async isFavorite(userId: number, listingId: number): Promise<boolean> {
    const result = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.listingId, listingId)
        )
      );
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
