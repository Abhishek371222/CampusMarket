import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Chat,
  type ChatParticipant,
  type Message,
  type InsertMessage,
  type Offer,
  type InsertOffer,
  type Notification,
  type InsertNotification,
  type CommunityPost,
  type InsertCommunityPost,
  type Follow,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<string[]>;
  getFollowing(userId: string): Promise<string[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Product operations
  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;
  searchProducts(filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Product[]>;

  // Chat operations
  createChat(productId: string | null, participantIds: string[]): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getChatsByUser(userId: string): Promise<Chat[]>;
  addChatParticipant(chatId: string, userId: string): Promise<ChatParticipant>;
  getChatParticipants(chatId: string): Promise<ChatParticipant[]>;

  // Message operations
  createMessage(message: InsertMessage & { senderId: string }): Promise<Message>;
  getMessagesByChat(chatId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;

  // Offer operations
  createOffer(offer: InsertOffer & { buyerId: string }): Promise<Offer>;
  getOffer(id: string): Promise<Offer | undefined>;
  getOffersByProduct(productId: string): Promise<Offer[]>;
  getOffersByBuyer(buyerId: string): Promise<Offer[]>;
  updateOfferStatus(id: string, status: string): Promise<Offer | undefined>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Community post operations
  createCommunityPost(post: InsertCommunityPost & { authorId: string }): Promise<CommunityPost>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  updateCommunityPostLikes(id: string, likes: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private follows: Map<string, Follow>;
  private products: Map<string, Product>;
  private chats: Map<string, Chat>;
  private chatParticipants: Map<string, ChatParticipant>;
  private messages: Map<string, Message>;
  private offers: Map<string, Offer>;
  private notifications: Map<string, Notification>;
  private communityPosts: Map<string, CommunityPost>;

  constructor() {
    this.users = new Map();
    this.follows = new Map();
    this.products = new Map();
    this.chats = new Map();
    this.chatParticipants = new Map();
    this.messages = new Map();
    this.offers = new Map();
    this.notifications = new Map();
    this.communityPosts = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = {
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      avatar: insertUser.avatar ?? null,
      id,
      role: "student",
      isVerified: false,
      verificationStatus: "unverified",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const id = crypto.randomUUID();
    const follow: Follow = {
      id,
      followerId,
      followingId,
      createdAt: new Date(),
    };
    this.follows.set(id, follow);
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const entries = Array.from(this.follows.entries());
    for (const [id, follow] of entries) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        this.follows.delete(id);
        return;
      }
    }
  }

  async getFollowers(userId: string): Promise<string[]> {
    return Array.from(this.follows.values())
      .filter((f) => f.followingId === userId)
      .map((f) => f.followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    return Array.from(this.follows.values())
      .filter((f) => f.followerId === userId)
      .map((f) => f.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
  }

  // Product operations
  async createProduct(productData: InsertProduct & { sellerId: string }): Promise<Product> {
    const id = crypto.randomUUID();
    const product: Product = {
      id,
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      condition: productData.condition,
      images: productData.images || [],
      sellerId: productData.sellerId,
      status: productData.status || "available",
      aiEstimatedPriceMin: productData.aiEstimatedPriceMin || null,
      aiEstimatedPriceMax: productData.aiEstimatedPriceMax || null,
      isPromoted: productData.isPromoted || false,
      viewCount: 0,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.sellerId === sellerId);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...data };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async incrementProductViews(id: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.viewCount++;
      this.products.set(id, product);
    }
  }

  async searchProducts(filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Product[]> {
    let results = Array.from(this.products.values());

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }
    if (filters.condition) {
      results = results.filter((p) => p.condition === filters.condition);
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => parseFloat(p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => parseFloat(p.price) <= filters.maxPrice!);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }

  // Chat operations
  async createChat(productId: string | null, participantIds: string[]): Promise<Chat> {
    const id = crypto.randomUUID();
    const chat: Chat = {
      id,
      productId: productId || null,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);

    for (const userId of participantIds) {
      await this.addChatParticipant(id, userId);
    }

    return chat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUser(userId: string): Promise<Chat[]> {
    const userParticipations = Array.from(this.chatParticipants.values()).filter(
      (cp) => cp.userId === userId
    );
    const chatIds = userParticipations.map((cp) => cp.chatId);
    return Array.from(this.chats.values()).filter((c) => chatIds.includes(c.id));
  }

  async addChatParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
    const id = crypto.randomUUID();
    const participant: ChatParticipant = {
      id,
      chatId,
      userId,
      joinedAt: new Date(),
    };
    this.chatParticipants.set(id, participant);
    return participant;
  }

  async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    return Array.from(this.chatParticipants.values()).filter((cp) => cp.chatId === chatId);
  }

  // Message operations
  async createMessage(messageData: InsertMessage & { senderId: string }): Promise<Message> {
    const id = crypto.randomUUID();
    const message: Message = {
      id,
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      content: messageData.content,
      readAt: null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChat(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.readAt = new Date();
      this.messages.set(id, message);
    }
  }

  // Offer operations
  async createOffer(offerData: InsertOffer & { buyerId: string }): Promise<Offer> {
    const id = crypto.randomUUID();
    const offer: Offer = {
      id,
      productId: offerData.productId,
      buyerId: offerData.buyerId,
      amount: offerData.amount,
      status: "pending",
      createdAt: new Date(),
    };
    this.offers.set(id, offer);
    return offer;
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async getOffersByProduct(productId: string): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter((o) => o.productId === productId);
  }

  async getOffersByBuyer(buyerId: string): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter((o) => o.buyerId === buyerId);
  }

  async updateOfferStatus(id: string, status: string): Promise<Offer | undefined> {
    const offer = this.offers.get(id);
    if (!offer) return undefined;
    offer.status = status;
    this.offers.set(id, offer);
    return offer;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = crypto.randomUUID();
    const notification: Notification = {
      id,
      userId: notificationData.userId,
      type: notificationData.type,
      content: notificationData.content,
      link: notificationData.link || null,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      if (notification.userId === userId) {
        notification.isRead = true;
        this.notifications.set(id, notification);
      }
    }
  }

  // Community post operations
  async createCommunityPost(
    postData: InsertCommunityPost & { authorId: string }
  ): Promise<CommunityPost> {
    const id = crypto.randomUUID();
    const post: CommunityPost = {
      id,
      authorId: postData.authorId,
      content: postData.content,
      type: postData.type || "general",
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateCommunityPostLikes(id: string, likes: number): Promise<void> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.likes = likes;
      this.communityPosts.set(id, post);
    }
  }
}

export const storage = new MemStorage();
