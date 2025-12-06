import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import heroImage from "@assets/stock_images/university_campus_st_950cd798.jpg";
import booksImage from "@assets/stock_images/university_textbooks_ba0b423a.jpg";
import electronicsImage from "@assets/stock_images/modern_laptop_and_he_de4fdd1e.jpg";

// --- Types ---

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "student" | "admin";
  isVerified: boolean;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  followers: string[];
  following: string[];
  isOnline?: boolean; // Mock status
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Like New" | "Good" | "Fair";
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  createdAt: string;
  status: "available" | "sold" | "pending";
  aiEstimatedPrice?: { min: number; max: number };
  isPromoted?: boolean;
  viewCount: number;
};

export type Chat = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  productId?: string;
  typing?: string[]; // User IDs typing
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readAt?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: "message" | "offer" | "system" | "follow";
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
};

export type Offer = {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  type: "request" | "general" | "alert";
};

// --- Mock Data ---

const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    email: "alex@university.edu",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "student",
    isVerified: true,
    verificationStatus: "verified",
    followers: ["user-2"],
    following: [],
    isOnline: true,
  },
  {
    id: "user-2",
    name: "Sarah Chen",
    email: "sarah@university.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "student",
    isVerified: true,
    verificationStatus: "verified",
    followers: [],
    following: ["user-1"],
    isOnline: false,
  },
  {
    id: "admin-1",
    name: "Campus Admin",
    email: "admin@university.edu",
    avatar: "https://github.com/shadcn.png",
    role: "admin",
    isVerified: true,
    verificationStatus: "verified",
    followers: [],
    following: [],
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Calculus: Early Transcendentals (8th Ed)",
    description: "Used for MATH101. Good condition, some highlighting on early chapters.",
    price: 45,
    category: "Textbooks",
    condition: "Good",
    images: [booksImage],
    sellerId: "user-2",
    sellerName: "Sarah Chen",
    sellerAvatar: MOCK_USERS[1].avatar,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "available",
    aiEstimatedPrice: { min: 40, max: 55 },
    viewCount: 124,
  },
  {
    id: "prod-2",
    title: "Sony WH-1000XM4 Noise Cancelling Headphones",
    description: "Barely used, upgraded to XM5. Comes with original case and cables.",
    price: 180,
    category: "Electronics",
    condition: "Like New",
    images: [electronicsImage],
    sellerId: "user-1",
    sellerName: "Alex Rivera",
    sellerAvatar: MOCK_USERS[0].avatar,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "available",
    aiEstimatedPrice: { min: 170, max: 200 },
    viewCount: 89,
  },
  {
    id: "prod-3",
    title: "Dorm Mini Fridge - Black",
    description: "Moving out, need gone ASAP. Works perfectly. Must pick up from Hall A.",
    price: 60,
    category: "Furniture",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80"],
    sellerId: "user-2",
    sellerName: "Sarah Chen",
    sellerAvatar: MOCK_USERS[1].avatar,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "available",
    aiEstimatedPrice: { min: 50, max: 75 },
    viewCount: 203,
  },
  {
    id: "prod-4",
    title: "Graphing Calculator TI-84 Plus CE",
    description: "Essential for engineering stats. Color screen model. Includes charging cable.",
    price: 90,
    category: "Electronics",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80"],
    sellerId: "user-1",
    sellerName: "Alex Rivera",
    sellerAvatar: MOCK_USERS[0].avatar,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "available",
    aiEstimatedPrice: { min: 85, max: 100 },
    viewCount: 45,
  },
];

const MOCK_CHATS: Chat[] = [
  {
    id: "chat-1",
    participants: ["user-1", "user-2"],
    lastMessage: "Is the calculator still available?",
    lastMessageTime: new Date().toISOString(),
    productId: "prod-4",
    typing: [],
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-2",
    content: "Hi Alex, Is the calculator still available?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    readAt: new Date(Date.now() - 3500000).toISOString(),
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "system",
    content: "Welcome to Campus Market! Verify your ID to start selling.",
    isRead: false,
    createdAt: new Date().toISOString(),
    link: "/profile",
  },
];

const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "user-2",
    authorName: "Sarah Chen",
    authorAvatar: MOCK_USERS[1].avatar,
    content: "Does anyone have a spare moving cart I could borrow for an hour this weekend? Moving out of Hall A!",
    likes: 5,
    comments: 2,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    type: "request",
  },
  {
    id: "post-2",
    authorId: "user-1",
    authorName: "Alex Rivera",
    authorAvatar: MOCK_USERS[0].avatar,
    content: "Lost a blue hydroflask in the library 3rd floor. Has a sticker of a cat on it. Please DM if found!",
    likes: 12,
    comments: 0,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    type: "alert",
  },
];

// --- Store (Zustand) ---

interface MarketStore {
  currentUser: User | null;
  users: User[];
  products: Product[];
  chats: Chat[];
  messages: Message[];
  wishlist: string[];
  notifications: Notification[];
  offers: Offer[];
  communityPosts: CommunityPost[];
  recentActivity: string[]; // Admin logs

  // Actions
  login: (email: string) => void;
  logout: () => void;
  addProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "sellerAvatar" | "createdAt" | "status" | "viewCount">) => void;
  toggleWishlist: (productId: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChat: (productId: string, sellerId: string) => string;
  
  // New Actions
  submitVerification: () => void; // Mock
  approveVerification: (userId: string) => void;
  makeOffer: (productId: string, amount: number) => void;
  acceptOffer: (offerId: string) => void;
  followUser: (userId: string) => void;
  addCommunityPost: (content: string, type: CommunityPost["type"]) => void;
  addNotification: (userId: string, type: Notification["type"], content: string) => void;
  markNotificationsRead: () => void;
}

export const useMarketStore = create<MarketStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: MOCK_USERS,
      products: MOCK_PRODUCTS,
      chats: MOCK_CHATS,
      messages: MOCK_MESSAGES,
      wishlist: [],
      notifications: MOCK_NOTIFICATIONS,
      offers: [],
      communityPosts: MOCK_COMMUNITY_POSTS,
      recentActivity: ["System initialized"],

      login: (email) => {
        const existingUser = get().users.find((u) => u.email === email);
        if (existingUser) {
          set({ currentUser: existingUser });
        } else {
          const newUser: User = {
            id: `user-${nanoid()}`,
            name: email.split("@")[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: "student",
            isVerified: false,
            verificationStatus: "unverified",
            followers: [],
            following: [],
            isOnline: true,
          };
          set((state) => ({
            users: [...state.users, newUser],
            currentUser: newUser,
          }));
        }
      },

      logout: () => set({ currentUser: null }),

      addProduct: (productData) => {
        const user = get().currentUser;
        if (!user) return;

        const newProduct: Product = {
          id: `prod-${nanoid()}`,
          ...productData,
          sellerId: user.id,
          sellerName: user.name,
          sellerAvatar: user.avatar,
          createdAt: new Date().toISOString(),
          status: "available",
          viewCount: 0,
          aiEstimatedPrice: { min: productData.price * 0.9, max: productData.price * 1.1 },
        };

        set((state) => ({ 
          products: [newProduct, ...state.products],
          recentActivity: [`New product listed: ${newProduct.title}`, ...state.recentActivity]
        }));
      },

      toggleWishlist: (productId) => {
        set((state) => {
          const inWishlist = state.wishlist.includes(productId);
          return {
            wishlist: inWishlist
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          };
        });
      },

      sendMessage: (chatId, content) => {
        const user = get().currentUser;
        if (!user) return;

        const newMessage: Message = {
          id: `msg-${nanoid()}`,
          chatId,
          senderId: user.id,
          content,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, lastMessage: content, lastMessageTime: newMessage.timestamp }
              : c
          ),
        }));
      },

      createChat: (productId, sellerId) => {
        const user = get().currentUser;
        if (!user) return "";

        const existingChat = get().chats.find(
          (c) =>
            c.productId === productId &&
            c.participants.includes(user.id) &&
            c.participants.includes(sellerId)
        );

        if (existingChat) return existingChat.id;

        const newChat: Chat = {
          id: `chat-${nanoid()}`,
          participants: [user.id, sellerId],
          lastMessage: "Chat started",
          lastMessageTime: new Date().toISOString(),
          productId,
          typing: [],
        };

        set((state) => ({ chats: [...state.chats, newChat] }));
        return newChat.id;
      },

      submitVerification: () => {
        set((state) => {
          if (!state.currentUser) return {};
          const updatedUser = { ...state.currentUser, verificationStatus: "pending" as const };
          return {
            currentUser: updatedUser,
            users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
            recentActivity: [`User ${updatedUser.name} requested verification`, ...state.recentActivity]
          };
        });
      },

      approveVerification: (userId) => {
        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, verificationStatus: "verified", isVerified: true } : u),
          notifications: [...state.notifications, {
            id: nanoid(),
            userId,
            type: "system",
            content: "Your student ID has been verified! You can now sell items.",
            isRead: false,
            createdAt: new Date().toISOString(),
          }],
          recentActivity: [`Admin approved user ${userId}`, ...state.recentActivity]
        }));
      },

      makeOffer: (productId, amount) => {
        const user = get().currentUser;
        if (!user) return;
        
        const product = get().products.find(p => p.id === productId);
        if (!product) return;

        const newOffer: Offer = {
          id: nanoid(),
          productId,
          buyerId: user.id,
          buyerName: user.name,
          amount,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          offers: [...state.offers, newOffer],
          notifications: [...state.notifications, {
            id: nanoid(),
            userId: product.sellerId,
            type: "offer",
            content: `${user.name} offered $${amount} for ${product.title}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/product/${productId}`,
          }]
        }));
      },

      acceptOffer: (offerId) => {
        set((state) => {
          const offer = state.offers.find(o => o.id === offerId);
          if (!offer) return {};
          
          return {
            offers: state.offers.map(o => o.id === offerId ? { ...o, status: "accepted" } : o),
            products: state.products.map(p => p.id === offer.productId ? { ...p, status: "sold" } : p),
            notifications: [...state.notifications, {
              id: nanoid(),
              userId: offer.buyerId,
              type: "offer",
              content: "Your offer was accepted! Proceed to payment.",
              isRead: false,
              createdAt: new Date().toISOString(),
              link: `/product/${offer.productId}`,
            }]
          };
        });
      },

      followUser: (userId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        set((state) => {
          const isFollowing = currentUser.following.includes(userId);
          const updatedCurrentUser = {
            ...currentUser,
            following: isFollowing 
              ? currentUser.following.filter(id => id !== userId)
              : [...currentUser.following, userId]
          };

          return {
            currentUser: updatedCurrentUser,
            users: state.users.map(u => u.id === currentUser.id ? updatedCurrentUser : u)
          };
        });
      },

      addCommunityPost: (content, type) => {
        const user = get().currentUser;
        if (!user) return;

        const newPost: CommunityPost = {
          id: nanoid(),
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          content,
          type,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ communityPosts: [newPost, ...state.communityPosts] }));
      },

      addNotification: (userId, type, content) => {
        set((state) => ({
          notifications: [...state.notifications, {
            id: nanoid(),
            userId,
            type,
            content,
            isRead: false,
            createdAt: new Date().toISOString(),
          }]
        }));
      },

      markNotificationsRead: () => {
        set((state) => {
          if (!state.currentUser) return {};
          return {
            notifications: state.notifications.map(n => n.userId === state.currentUser!.id ? { ...n, isRead: true } : n)
          };
        });
      },
    }),
    {
      name: "campus-market-storage-v2",
    }
  )
);

