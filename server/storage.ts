import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  listings, type Listing, type InsertListing,
  messages, type Message, type InsertMessage,
  reviews, type Review, type InsertReview,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private listings: Map<number, Listing>;
  private messages: Map<number, Message>;
  private reviews: Map<number, Review>;
  private favorites: Map<number, Favorite>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private listingIdCounter: number;
  private messageIdCounter: number;
  private reviewIdCounter: number;
  private favoriteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.listings = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    this.favorites = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.listingIdCounter = 1;
    this.messageIdCounter = 1;
    this.reviewIdCounter = 1;
    this.favoriteIdCounter = 1;
    
    // Initialize with some categories
    this.initializeCategories();
  }

  private initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Furniture", slug: "furniture" },
      { name: "Books & Notes", slug: "books-and-notes" },
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Vehicles", slug: "vehicles" },
      { name: "Services", slug: "services" }
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      isAdmin: false
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = {
      ...insertCategory,
      id,
      itemCount: 0
    };
    this.categories.set(id, category);
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
    let listings = Array.from(this.listings.values());
    
    // Apply filters
    if (filters.categoryId !== undefined) {
      listings = listings.filter(listing => listing.categoryId === filters.categoryId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      listings = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) || 
        listing.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.minPrice !== undefined) {
      listings = listings.filter(listing => listing.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      listings = listings.filter(listing => listing.price <= filters.maxPrice!);
    }
    
    if (filters.condition) {
      listings = listings.filter(listing => listing.condition === filters.condition);
    }
    
    if (filters.location) {
      listings = listings.filter(listing => listing.location === filters.location);
    }
    
    if (filters.sellerId !== undefined) {
      listings = listings.filter(listing => listing.sellerId === filters.sellerId);
    }
    
    // Sort by newest first
    listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || listings.length;
    
    return listings.slice(offset, offset + limit);
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async createListing(insertListing: InsertListing, sellerId: number): Promise<Listing> {
    const id = this.listingIdCounter++;
    const now = new Date();
    const listing: Listing = {
      ...insertListing,
      id,
      sellerId,
      createdAt: now
    };
    this.listings.set(id, listing);
    
    // Update category item count
    const category = this.categories.get(insertListing.categoryId);
    if (category) {
      this.categories.set(category.id, {
        ...category,
        itemCount: category.itemCount + 1
      });
    }
    
    return listing;
  }

  async updateListing(id: number, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;
    
    const updatedListing: Listing = {
      ...listing,
      ...updateData
    };
    
    this.listings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteListing(id: number): Promise<boolean> {
    const listing = this.listings.get(id);
    if (!listing) return false;
    
    // Update category item count
    const category = this.categories.get(listing.categoryId);
    if (category) {
      this.categories.set(category.id, {
        ...category,
        itemCount: Math.max(0, category.itemCount - 1)
      });
    }
    
    return this.listings.delete(id);
  }

  // Message methods
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.senderId === userId || message.receiverId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number, listingId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id && message.listingId === listingId) || 
        (message.senderId === user2Id && message.receiverId === user1Id && message.listingId === listingId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage, senderId: number): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      senderId,
      read: false,
      createdAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = {
      ...message,
      read: true
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Review methods
  async getReviewsForSeller(sellerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewForListing(listingId: number, reviewerId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      review => review.listingId === listingId && review.reviewerId === reviewerId
    );
  }

  async createReview(insertReview: InsertReview, reviewerId: number): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      reviewerId,
      createdAt: now
    };
    this.reviews.set(id, review);
    return review;
  }

  // Favorite methods
  async getUserFavorites(userId: number): Promise<Listing[]> {
    const favoriteListingIds = Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .map(favorite => favorite.listingId);
    
    return Array.from(this.listings.values())
      .filter(listing => favoriteListingIds.includes(listing.id));
  }

  async addToFavorites(userId: number, listingId: number): Promise<Favorite> {
    // Check if already a favorite
    const existingFavorite = Array.from(this.favorites.values()).find(
      favorite => favorite.userId === userId && favorite.listingId === listingId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    const id = this.favoriteIdCounter++;
    const favorite: Favorite = {
      id,
      userId,
      listingId
    };
    
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, listingId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      favorite => favorite.userId === userId && favorite.listingId === listingId
    );
    
    if (!favorite) return false;
    
    return this.favorites.delete(favorite.id);
  }

  async isFavorite(userId: number, listingId: number): Promise<boolean> {
    return !!Array.from(this.favorites.values()).find(
      favorite => favorite.userId === userId && favorite.listingId === listingId
    );
  }
}

export const storage = new MemStorage();
