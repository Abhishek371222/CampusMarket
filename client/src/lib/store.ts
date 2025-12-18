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

interface AuthState {
  user: User | null;
  login: (username: string) => Promise<void>;
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
  logout: () => set({ user: null, isAuthenticated: false }),
}));
