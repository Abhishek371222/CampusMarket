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
  sellerName: string; // Denormalized for ease
  sellerAvatar: string;
  createdAt: string;
  status: "available" | "sold" | "pending";
};

export type Chat = {
  id: string;
  participants: string[]; // User IDs
  lastMessage: string;
  lastMessageTime: string;
  productId?: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
};

// --- Mock Data ---

const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    email: "alex@university.edu",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "student",
  },
  {
    id: "user-2",
    name: "Sarah Chen",
    email: "sarah@university.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "student",
  },
  {
    id: "admin-1",
    name: "Campus Admin",
    email: "admin@university.edu",
    avatar: "https://github.com/shadcn.png",
    role: "admin",
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
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status: "available",
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
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    status: "available",
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
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    status: "available",
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
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: "available",
  },
];

const MOCK_CHATS: Chat[] = [
  {
    id: "chat-1",
    participants: ["user-1", "user-2"],
    lastMessage: "Is the calculator still available?",
    lastMessageTime: new Date().toISOString(),
    productId: "prod-4",
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-2",
    content: "Hi Alex, Is the calculator still available?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// --- Store (Zustand) ---

interface MarketStore {
  currentUser: User | null;
  users: User[];
  products: Product[];
  chats: Chat[];
  messages: Message[];
  wishlist: string[]; // Product IDs

  // Actions
  login: (email: string) => void;
  logout: () => void;
  addProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "sellerAvatar" | "createdAt" | "status">) => void;
  toggleWishlist: (productId: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChat: (productId: string, sellerId: string) => string; // Returns chatId
}

export const useMarketStore = create<MarketStore>()(
  persist(
    (set, get) => ({
      currentUser: null, // Start logged out
      users: MOCK_USERS,
      products: MOCK_PRODUCTS,
      chats: MOCK_CHATS,
      messages: MOCK_MESSAGES,
      wishlist: [],

      login: (email) => {
        // Simple mock login - if email matches a user, log them in. 
        // If not, create a new student user.
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
        };

        set((state) => ({ products: [newProduct, ...state.products] }));
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

        // Check if chat exists
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
        };

        set((state) => ({ chats: [...state.chats, newChat] }));
        return newChat.id;
      },
    }),
    {
      name: "campus-market-storage", // LocalStorage key
    }
  )
);
