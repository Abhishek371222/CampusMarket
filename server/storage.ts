import { eq, and, or, ilike, gte, lte, desc, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  follows,
  products,
  chats,
  chatParticipants,
  messages,
  offers,
  notifications,
  communityPosts,
  postComments,
  postLikes,
  uploads,
  locations,
  institutions,
  phoneVerifications,
  aiChatSessions,
  type User,
  type InsertUser,
  type UpdateUser,
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
  type PostComment,
  type InsertPostComment,
  type PostLike,
  type Upload,
  type InsertUpload,
  type Follow,
  type Location,
  type InsertLocation,
  type Institution,
  type InsertInstitution,
  type PhoneVerification,
  type AiChatSession,
} from "@shared/schema";

export interface UpsertUserData {
  replitUserId: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReplitId(replitUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  upsertUser(userData: UpsertUserData): Promise<User>;
  getAllUsers(): Promise<User[]>;

  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<string[]>;
  getFollowing(userId: string): Promise<string[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  getProductsByLocation(locationId: string): Promise<Product[]>;
  getProductsByInstitution(institutionId: string): Promise<Product[]>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;
  searchProducts(filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    locationId?: string;
    institutionId?: string;
  }): Promise<Product[]>;

  createChat(productId: string | null, participantIds: string[]): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getChatsByUser(userId: string): Promise<Chat[]>;
  addChatParticipant(chatId: string, userId: string): Promise<ChatParticipant>;
  getChatParticipants(chatId: string): Promise<ChatParticipant[]>;

  createMessage(message: InsertMessage & { senderId: string }): Promise<Message>;
  getMessagesByChat(chatId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;

  createOffer(offer: InsertOffer & { buyerId: string }): Promise<Offer>;
  getOffer(id: string): Promise<Offer | undefined>;
  getOffersByProduct(productId: string): Promise<Offer[]>;
  getOffersByBuyer(buyerId: string): Promise<Offer[]>;
  updateOffer(id: string, data: Partial<Offer>): Promise<Offer | undefined>;
  updateOfferStatus(id: string, status: string): Promise<Offer | undefined>;

  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  createCommunityPost(post: InsertCommunityPost & { authorId: string }): Promise<CommunityPost>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  updateCommunityPostLikes(id: string, likes: number): Promise<void>;
  deleteCommunityPost(id: string): Promise<void>;
  updateCommunityPostCommentCount(id: string, count: number): Promise<void>;

  createPostComment(comment: InsertPostComment & { authorId: string }): Promise<PostComment>;
  getPostComments(postId: string): Promise<PostComment[]>;
  deletePostComment(id: string): Promise<void>;

  createPostLike(postId: string, userId: string): Promise<PostLike>;
  getPostLike(postId: string, userId: string): Promise<PostLike | undefined>;
  deletePostLike(postId: string, userId: string): Promise<void>;
  getPostLikesCount(postId: string): Promise<number>;

  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUploadsByUser(userId: string): Promise<Upload[]>;
  deleteUpload(id: string): Promise<void>;

  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: string): Promise<Location | undefined>;
  getLocationByDetails(country: string, state: string, city: string, pincode: string): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  getCountries(): Promise<string[]>;
  getStates(country: string): Promise<string[]>;
  getCities(country: string, state: string): Promise<string[]>;
  getPincodes(country: string, state: string, city: string): Promise<string[]>;

  createInstitution(institution: InsertInstitution): Promise<Institution>;
  getInstitution(id: string): Promise<Institution | undefined>;
  getInstitutionsByLocation(locationId: string): Promise<Institution[]>;
  getAllInstitutions(): Promise<Institution[]>;
  searchInstitutions(query: string, locationId?: string): Promise<Institution[]>;

  createPhoneVerification(userId: string, phone: string, codeHash: string, expiresAt: Date): Promise<PhoneVerification>;
  getPhoneVerification(userId: string, phone: string): Promise<PhoneVerification | undefined>;
  updatePhoneVerification(id: string, data: Partial<PhoneVerification>): Promise<void>;
  deletePhoneVerification(id: string): Promise<void>;

  createAiChatSession(userId: string): Promise<AiChatSession>;
  getAiChatSession(id: string): Promise<AiChatSession | undefined>;
  getAiChatSessionsByUser(userId: string): Promise<AiChatSession[]>;
  updateAiChatSession(id: string, messages: any[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReplitId(replitUserId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitUserId, replitUserId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password ?? null,
      avatar: insertUser.avatar ?? null,
      phone: insertUser.phone ?? null,
      bio: insertUser.bio ?? null,
      locationId: insertUser.locationId ?? null,
      institutionId: insertUser.institutionId ?? null,
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async upsertUser(userData: UpsertUserData): Promise<User> {
    const existingUser = await this.getUserByReplitId(userData.replitUserId);
    
    if (existingUser) {
      const [updated] = await db.update(users).set({
        name: userData.name,
        avatar: userData.avatar ?? existingUser.avatar,
      }).where(eq(users.replitUserId, userData.replitUserId)).returning();
      return updated;
    }
    
    const [user] = await db.insert(users).values({
      replitUserId: userData.replitUserId,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar ?? null,
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
  }

  async getFollowers(userId: string): Promise<string[]> {
    const result = await db.select({ followerId: follows.followerId })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return result.map(r => r.followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    const result = await db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return result.map(r => r.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
    return !!result;
  }

  async createProduct(productData: InsertProduct & { sellerId: string }): Promise<Product> {
    const [product] = await db.insert(products).values({
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
      locationId: productData.locationId || null,
      institutionId: productData.institutionId || null,
    }).returning();
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  async getProductsByLocation(locationId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.locationId, locationId));
  }

  async getProductsByInstitution(institutionId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.institutionId, institutionId));
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async incrementProductViews(id: string): Promise<void> {
    const product = await this.getProduct(id);
    if (product) {
      await db.update(products).set({ viewCount: product.viewCount + 1 }).where(eq(products.id, id));
    }
  }

  async searchProducts(filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    locationId?: string;
    institutionId?: string;
  }): Promise<Product[]> {
    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters.condition) {
      conditions.push(eq(products.condition, filters.condition));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(products.title, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      );
    }
    if (filters.locationId) {
      conditions.push(eq(products.locationId, filters.locationId));
    }
    if (filters.institutionId) {
      conditions.push(eq(products.institutionId, filters.institutionId));
    }

    if (conditions.length === 0) {
      return this.getAllProducts();
    }

    return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async createChat(productId: string | null, participantIds: string[]): Promise<Chat> {
    const [chat] = await db.insert(chats).values({ productId }).returning();
    
    for (const userId of participantIds) {
      await this.addChatParticipant(chat.id, userId);
    }
    
    return chat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async getChatsByUser(userId: string): Promise<Chat[]> {
    const participations = await db.select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId));
    
    if (participations.length === 0) return [];
    
    const chatIds = participations.map(p => p.chatId);
    return db.select().from(chats).where(inArray(chats.id, chatIds));
  }

  async addChatParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
    const [participant] = await db.insert(chatParticipants).values({ chatId, userId }).returning();
    return participant;
  }

  async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    return db.select().from(chatParticipants).where(eq(chatParticipants.chatId, chatId));
  }

  async createMessage(messageData: InsertMessage & { senderId: string }): Promise<Message> {
    const [message] = await db.insert(messages).values({
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      content: messageData.content,
    }).returning();
    return message;
  }

  async getMessagesByChat(chatId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ readAt: new Date() }).where(eq(messages.id, id));
  }

  async createOffer(offerData: InsertOffer & { buyerId: string }): Promise<Offer> {
    const [offer] = await db.insert(offers).values({
      productId: offerData.productId,
      buyerId: offerData.buyerId,
      amount: offerData.amount,
    }).returning();
    return offer;
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async getOffersByProduct(productId: string): Promise<Offer[]> {
    return db.select().from(offers).where(eq(offers.productId, productId));
  }

  async getOffersByBuyer(buyerId: string): Promise<Offer[]> {
    return db.select().from(offers).where(eq(offers.buyerId, buyerId));
  }

  async updateOffer(id: string, data: Partial<Offer>): Promise<Offer | undefined> {
    const [updated] = await db.update(offers).set(data).where(eq(offers.id, id)).returning();
    return updated;
  }

  async updateOfferStatus(id: string, status: string): Promise<Offer | undefined> {
    return this.updateOffer(id, { status });
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      userId: notificationData.userId,
      type: notificationData.type,
      content: notificationData.content,
      link: notificationData.link || null,
    }).returning();
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async createCommunityPost(postData: InsertCommunityPost & { authorId: string }): Promise<CommunityPost> {
    const [post] = await db.insert(communityPosts).values({
      authorId: postData.authorId,
      content: postData.content,
      type: postData.type || "general",
      attachments: postData.attachments || [],
    }).returning();
    return post;
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
  }

  async updateCommunityPostLikes(id: string, likes: number): Promise<void> {
    await db.update(communityPosts).set({ likes }).where(eq(communityPosts.id, id));
  }

  async deleteCommunityPost(id: string): Promise<void> {
    await db.delete(communityPosts).where(eq(communityPosts.id, id));
  }

  async updateCommunityPostCommentCount(id: string, count: number): Promise<void> {
    await db.update(communityPosts).set({ comments: count }).where(eq(communityPosts.id, id));
  }

  async createPostComment(commentData: InsertPostComment & { authorId: string }): Promise<PostComment> {
    const [comment] = await db.insert(postComments).values({
      postId: commentData.postId,
      authorId: commentData.authorId,
      content: commentData.content,
    }).returning();
    return comment;
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    return db.select().from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  async deletePostComment(id: string): Promise<void> {
    await db.delete(postComments).where(eq(postComments.id, id));
  }

  async createPostLike(postId: string, userId: string): Promise<PostLike> {
    const [like] = await db.insert(postLikes).values({ postId, userId }).returning();
    return like;
  }

  async getPostLike(postId: string, userId: string): Promise<PostLike | undefined> {
    const [like] = await db.select().from(postLikes).where(
      and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))
    );
    return like;
  }

  async deletePostLike(postId: string, userId: string): Promise<void> {
    await db.delete(postLikes).where(
      and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))
    );
  }

  async getPostLikesCount(postId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    return Number(result[0]?.count || 0);
  }

  async createUpload(uploadData: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(uploadData).returning();
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getUploadsByUser(userId: string): Promise<Upload[]> {
    return db.select().from(uploads).where(eq(uploads.userId, userId));
  }

  async deleteUpload(id: string): Promise<void> {
    await db.delete(uploads).where(eq(uploads.id, id));
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [loc] = await db.insert(locations).values(location).returning();
    return loc;
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [loc] = await db.select().from(locations).where(eq(locations.id, id));
    return loc;
  }

  async getLocationByDetails(country: string, state: string, city: string, pincode: string): Promise<Location | undefined> {
    const [loc] = await db.select().from(locations).where(
      and(
        eq(locations.country, country),
        eq(locations.state, state),
        eq(locations.city, city),
        eq(locations.pincode, pincode)
      )
    );
    return loc;
  }

  async getAllLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }

  async getCountries(): Promise<string[]> {
    const result = await db.selectDistinct({ country: locations.country }).from(locations);
    return result.map(r => r.country);
  }

  async getStates(country: string): Promise<string[]> {
    const result = await db.selectDistinct({ state: locations.state })
      .from(locations)
      .where(eq(locations.country, country));
    return result.map(r => r.state);
  }

  async getCities(country: string, state: string): Promise<string[]> {
    const result = await db.selectDistinct({ city: locations.city })
      .from(locations)
      .where(and(eq(locations.country, country), eq(locations.state, state)));
    return result.map(r => r.city);
  }

  async getPincodes(country: string, state: string, city: string): Promise<string[]> {
    const result = await db.selectDistinct({ pincode: locations.pincode })
      .from(locations)
      .where(and(
        eq(locations.country, country),
        eq(locations.state, state),
        eq(locations.city, city)
      ));
    return result.map(r => r.pincode);
  }

  async createInstitution(institution: InsertInstitution): Promise<Institution> {
    const [inst] = await db.insert(institutions).values(institution).returning();
    return inst;
  }

  async getInstitution(id: string): Promise<Institution | undefined> {
    const [inst] = await db.select().from(institutions).where(eq(institutions.id, id));
    return inst;
  }

  async getInstitutionsByLocation(locationId: string): Promise<Institution[]> {
    return db.select().from(institutions).where(eq(institutions.locationId, locationId));
  }

  async getAllInstitutions(): Promise<Institution[]> {
    return db.select().from(institutions);
  }

  async searchInstitutions(query: string, locationId?: string): Promise<Institution[]> {
    const conditions = [ilike(institutions.name, `%${query}%`)];
    if (locationId) {
      conditions.push(eq(institutions.locationId, locationId));
    }
    return db.select().from(institutions).where(and(...conditions));
  }

  async createPhoneVerification(userId: string, phone: string, codeHash: string, expiresAt: Date): Promise<PhoneVerification> {
    const [verification] = await db.insert(phoneVerifications).values({
      userId,
      phone,
      codeHash,
      expiresAt,
    }).returning();
    return verification;
  }

  async getPhoneVerification(userId: string, phone: string): Promise<PhoneVerification | undefined> {
    const [verification] = await db.select().from(phoneVerifications).where(
      and(eq(phoneVerifications.userId, userId), eq(phoneVerifications.phone, phone))
    );
    return verification;
  }

  async updatePhoneVerification(id: string, data: Partial<PhoneVerification>): Promise<void> {
    await db.update(phoneVerifications).set(data).where(eq(phoneVerifications.id, id));
  }

  async deletePhoneVerification(id: string): Promise<void> {
    await db.delete(phoneVerifications).where(eq(phoneVerifications.id, id));
  }

  async createAiChatSession(userId: string): Promise<AiChatSession> {
    const [session] = await db.insert(aiChatSessions).values({
      userId,
      messages: [],
    }).returning();
    return session;
  }

  async getAiChatSession(id: string): Promise<AiChatSession | undefined> {
    const [session] = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, id));
    return session;
  }

  async getAiChatSessionsByUser(userId: string): Promise<AiChatSession[]> {
    return db.select().from(aiChatSessions)
      .where(eq(aiChatSessions.userId, userId))
      .orderBy(desc(aiChatSessions.updatedAt));
  }

  async updateAiChatSession(id: string, sessionMessages: any[]): Promise<void> {
    await db.update(aiChatSessions).set({ 
      messages: sessionMessages,
      updatedAt: new Date(),
    }).where(eq(aiChatSessions.id, id));
  }
}

export const storage = new DatabaseStorage();
