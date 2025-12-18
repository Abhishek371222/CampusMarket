import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, User } from '@shared/schema';
import { CURRENT_USER } from './mockData';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        ),
    }),
    {
      name: 'campus-cart-storage',
    }
  )
);

interface SignupData {
  name: string;
  username: string;
  email: string;
  phone?: string;
  campus?: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  login: (username: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (username) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // For demo, we just log them in as the mock user if they type anything
    if (username) {
      set({ user: CURRENT_USER, isAuthenticated: true });
    }
  },
  signup: async (data: SignupData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Create new user from signup data
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 100,
      username: data.username,
      password: data.password,
      name: data.name,
      campus: data.campus || "Main Campus",
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}-profile?w=100&h=100&fit=crop`,
    };
    set({ user: newUser, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
