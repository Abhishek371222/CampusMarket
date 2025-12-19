import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, User } from '@shared/schema';
import { CURRENT_USER, MOCK_PRODUCTS } from './mockData';

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

interface UserProfile extends User {
  email?: string;
  phone?: string;
  bio?: string;
}

interface AuthState {
  user: UserProfile | null;
  login: (username: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (username) {
          set({ user: { ...CURRENT_USER, email: "alex@university.edu", phone: "+1 (555) 123-4567", bio: "Love buying and selling on campus!" }, isAuthenticated: true });
        }
      },
      signup: async (data: SignupData) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newUser: UserProfile = {
          id: Math.floor(Math.random() * 1000) + 100,
          username: data.username,
          password: data.password,
          name: data.name,
          campus: data.campus || "Main Campus",
          avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}-profile?w=100&h=100&fit=crop`,
          email: data.email,
          phone: data.phone,
          bio: "Welcome to Campus Market!"
        };
        set({ user: newUser, isAuthenticated: true });
      },
      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
        }));
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'campus-auth-storage',
    }
  )
);

interface FavoritesState {
  favorites: number[];
  addFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (productId) => {
        const current = get().favorites;
        if (!current.includes(productId)) {
          set({ favorites: [...current, productId] });
        }
      },
      removeFavorite: (productId) => {
        set({ favorites: get().favorites.filter(id => id !== productId) });
      },
      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      }
    }),
    {
      name: 'campus-favorites-storage',
    }
  )
);

interface UserListingsState {
  listings: Product[];
  addListing: (product: Product) => void;
}

export const useUserListings = create<UserListingsState>()(
  persist(
    (set, get) => ({
      listings: [MOCK_PRODUCTS[3], MOCK_PRODUCTS[9]],
      addListing: (product) => {
        set({ listings: [...get().listings, { ...product, id: Date.now() }] });
      }
    }),
    {
      name: 'campus-listings-storage',
    }
  )
);

interface FollowState {
  following: number[];
  addFollow: (peopleId: number) => void;
  removeFollow: (peopleId: number) => void;
  isFollowing: (peopleId: number) => boolean;
}

export const useFollow = create<FollowState>()(
  persist(
    (set, get) => ({
      following: [],
      addFollow: (peopleId) => {
        const current = get().following;
        if (!current.includes(peopleId)) {
          set({ following: [...current, peopleId] });
        }
      },
      removeFollow: (peopleId) => {
        set({ following: get().following.filter(id => id !== peopleId) });
      },
      isFollowing: (peopleId) => {
        return get().following.includes(peopleId);
      }
    }),
    {
      name: 'campus-follow-storage',
    }
  )
);
