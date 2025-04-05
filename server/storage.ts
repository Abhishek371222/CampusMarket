import { 
  users, listings, messages, reviews, savedListings,
  type User, type InsertUser, 
  type Listing, type InsertListing,
  type Message, type InsertMessage,
  type Review, type InsertReview,
  type SavedListing, type InsertSavedListing
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Listing methods
  getListing(id: number): Promise<Listing | undefined>;
  getListings(filters?: {
    category?: string;
    searchQuery?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    location?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getRecentListings(limit?: number): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, data: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(senderId: number, receiverId: number, listingId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{
    otherUserId: number;
    otherUsername: string;
    otherProfileImage: string | null;
    listingId: number;
    listingTitle: string;
    lastMessage: string;
    unreadCount: number;
    lastMessageDate: Date;
  }[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: number, receiverId: number, listingId: number): Promise<boolean>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsBySeller(sellerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Saved listings methods
  getSavedListings(userId: number): Promise<Listing[]>;
  saveListingForUser(savedListing: InsertSavedListing): Promise<SavedListing>;
  removeSavedListing(userId: number, listingId: number): Promise<boolean>;
  isListingSaved(userId: number, listingId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private messages: Map<number, Message>;
  private reviews: Map<number, Review>;
  private savedListings: Map<number, SavedListing>;
  
  private userIdCounter: number;
  private listingIdCounter: number;
  private messageIdCounter: number;
  private reviewIdCounter: number;
  private savedListingIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    this.savedListings = new Map();
    
    this.userIdCounter = 1;
    this.listingIdCounter = 1;
    this.messageIdCounter = 1;
    this.reviewIdCounter = 1;
    this.savedListingIdCounter = 1;
    
    // Initialize with a mock admin user for testing
    this.createUser({
      username: "admin",
      password: "password123",
      email: "admin@campusmarket.com",
      fullName: "Admin User",
      bio: "System administrator",
      campus: "Main Campus",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    }).then(user => {
      this.users.set(user.id, { ...user, isAdmin: true });
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, isAdmin: false, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Listing methods
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }
  
  async getListings(filters?: {
    category?: string;
    searchQuery?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    location?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]> {
    let listings = Array.from(this.listings.values());
    
    if (filters) {
      if (filters.category) {
        listings = listings.filter(listing => listing.category === filters.category);
      }
      
      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        listings = listings.filter(listing => 
          listing.title.toLowerCase().includes(search) || 
          listing.description.toLowerCase().includes(search)
        );
      }
      
      if (filters.priceMin !== undefined) {
        listings = listings.filter(listing => listing.price >= filters.priceMin!);
      }
      
      if (filters.priceMax !== undefined) {
        listings = listings.filter(listing => listing.price <= filters.priceMax!);
      }
      
      if (filters.condition) {
        listings = listings.filter(listing => listing.condition === filters.condition);
      }
      
      if (filters.location) {
        listings = listings.filter(listing => listing.location === filters.location);
      }
      
      if (filters.userId !== undefined) {
        listings = listings.filter(listing => listing.userId === filters.userId);
      }
      
      // Sort by newest first
      listings = listings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply offset and limit if specified
      if (filters.offset !== undefined) {
        listings = listings.slice(filters.offset);
      }
      
      if (filters.limit !== undefined) {
        listings = listings.slice(0, filters.limit);
      }
    }
    
    return listings;
  }
  
  async getFeaturedListings(limit: number = 4): Promise<Listing[]> {
    // Here we simulate featured listings by preferring urgent ones first, then newest
    const listings = Array.from(this.listings.values())
      .filter(listing => !listing.isSold)
      .sort((a, b) => {
        // Sort by urgent first
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        // Then sort by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
    
    return listings;
  }
  
  async getRecentListings(limit: number = 4): Promise<Listing[]> {
    const listings = Array.from(this.listings.values())
      .filter(listing => !listing.isSold)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return listings;
  }
  
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.listingIdCounter++;
    const createdAt = new Date();
    const listing: Listing = { ...insertListing, id, createdAt };
    this.listings.set(id, listing);
    return listing;
  }
  
  async updateListing(id: number, data: Partial<Listing>): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;
    
    const updatedListing = { ...listing, ...data };
    this.listings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteListing(id: number): Promise<boolean> {
    return this.listings.delete(id);
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getMessagesBetweenUsers(senderId: number, receiverId: number, listingId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === senderId && message.receiverId === receiverId && message.listingId === listingId) ||
        (message.senderId === receiverId && message.receiverId === senderId && message.listingId === listingId)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getConversations(userId: number): Promise<{
    otherUserId: number;
    otherUsername: string;
    otherProfileImage: string | null;
    listingId: number;
    listingTitle: string;
    lastMessage: string;
    unreadCount: number;
    lastMessageDate: Date;
  }[]> {
    // Get all messages where the user is either sender or receiver
    const userMessages = Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId);
    
    // Group messages by conversation (unique combination of other user and listing)
    const conversationsMap = new Map<string, {
      otherUserId: number;
      listingId: number;
      messages: Message[];
    }>();
    
    userMessages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const key = `${otherUserId}-${message.listingId}`;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUserId,
          listingId: message.listingId,
          messages: []
        });
      }
      
      conversationsMap.get(key)!.messages.push(message);
    });
    
    // Process each conversation to get the required format
    const conversations = await Promise.all(Array.from(conversationsMap.values()).map(async conv => {
      // Get other user info
      const otherUser = await this.getUser(conv.otherUserId);
      // Get listing info
      const listing = await this.getListing(conv.listingId);
      
      // Sort messages by date
      const sortedMessages = conv.messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Get last message
      const lastMessage = sortedMessages[0];
      
      // Count unread messages
      const unreadCount = sortedMessages.filter(
        m => m.senderId === conv.otherUserId && !m.isRead
      ).length;
      
      return {
        otherUserId: conv.otherUserId,
        otherUsername: otherUser?.username || "Unknown User",
        otherProfileImage: otherUser?.profileImage || null,
        listingId: conv.listingId,
        listingTitle: listing?.title || "Unknown Listing",
        lastMessage: lastMessage.content,
        unreadCount,
        lastMessageDate: new Date(lastMessage.createdAt)
      };
    }));
    
    // Sort conversations by most recent message
    return conversations.sort(
      (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const message: Message = { ...insertMessage, id, isRead: false, createdAt };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessagesAsRead(senderId: number, receiverId: number, listingId: number): Promise<boolean> {
    let updated = false;
    
    Array.from(this.messages.entries())
      .filter(([_, message]) => 
        message.senderId === senderId && 
        message.receiverId === receiverId &&
        message.listingId === listingId &&
        !message.isRead
      )
      .forEach(([id, message]) => {
        this.messages.set(id, { ...message, isRead: true });
        updated = true;
      });
    
    return updated;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.reviewerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getReviewsBySeller(sellerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { ...insertReview, id, createdAt };
    this.reviews.set(id, review);
    return review;
  }
  
  // Saved listings methods
  async getSavedListings(userId: number): Promise<Listing[]> {
    const savedListingEntries = Array.from(this.savedListings.values())
      .filter(saved => saved.userId === userId);
    
    const listings = await Promise.all(
      savedListingEntries.map(async entry => {
        const listing = await this.getListing(entry.listingId);
        return listing;
      })
    );
    
    return listings.filter((listing): listing is Listing => listing !== undefined);
  }
  
  async saveListingForUser(insertSavedListing: InsertSavedListing): Promise<SavedListing> {
    const id = this.savedListingIdCounter++;
    const createdAt = new Date();
    const savedListing: SavedListing = { ...insertSavedListing, id, createdAt };
    this.savedListings.set(id, savedListing);
    return savedListing;
  }
  
  async removeSavedListing(userId: number, listingId: number): Promise<boolean> {
    const savedListingEntry = Array.from(this.savedListings.entries())
      .find(([_, saved]) => saved.userId === userId && saved.listingId === listingId);
    
    if (savedListingEntry) {
      return this.savedListings.delete(savedListingEntry[0]);
    }
    
    return false;
  }
  
  async isListingSaved(userId: number, listingId: number): Promise<boolean> {
    return Array.from(this.savedListings.values())
      .some(saved => saved.userId === userId && saved.listingId === listingId);
  }
}

export const storage = new MemStorage();
