import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, User } from "@shared/schema";
import { MOCK_PRODUCTS } from "./mockData";

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

export interface SignupData {
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
  password?: string;
}

interface AuthState {
  user: UserProfile | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async ({ email, password }) => {
        // Try real backend login first
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) {
            throw new Error("Invalid credentials");
          }

          const data = (await res.json()) as { user: UserProfile };
          set({ user: data.user, isAuthenticated: true });
          return;
        } catch (err) {
          // Fallback: use locally stored user if backend is unavailable
          let matched = false;
          set((state) => {
            if (
              state.user &&
              state.user.email === email &&
              state.user.password === password
            ) {
              matched = true;
              return { ...state, isAuthenticated: true };
            }
            return state;
          });

          if (!matched) {
            throw err instanceof Error ? err : new Error("Invalid credentials");
          }
        }
      },
      signup: async (data: SignupData) => {
        // Try real backend signup first
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: data.name,
              username: data.username,
              email: data.email,
              phone: data.phone,
              campus: data.campus || "Main Campus",
              password: data.password,
            }),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => null);
            throw new Error(error?.message || "Signup failed");
          }

          const user = (await res.json()) as UserProfile;
          set({ user, isAuthenticated: true });
        } catch (err) {
          // Fallback: store user only in local state (still persisted via localStorage)
          const newUser: UserProfile = {
            id: Date.now(),
            username: data.username,
            password: data.password,
            name: data.name,
            campus: data.campus || "Main Campus",
            avatar: `https://images.unsplash.com/photo-${Math.floor(
              Math.random() * 1000,
            )}-profile?w=100&h=100&fit=crop`,
            email: data.email,
            phone: data.phone,
            bio: "Welcome to Campus Market!",
            rating: "5.0",
            reviewCount: 0,
            totalListings: 0,
            role: "user",
            createdAt: new Date(),
          };
          set({ user: newUser, isAuthenticated: true });
        }
      },
      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
        }));
      },
      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore network errors on logout
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "campus-auth-storage",
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

interface CollegeFilterState {
  selectedCollege: string;
  setSelectedCollege: (college: string) => void;
}

export const useCollegeFilter = create<CollegeFilterState>()(
  persist(
    (set) => ({
      selectedCollege: "",
      setSelectedCollege: (college) => set({ selectedCollege: college }),
    }),
    {
      name: 'campus-college-filter',
    }
  )
);

// Theme Store for Dark Mode
interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (isDark) => set({ isDark }),
    }),
    {
      name: 'campus-market-theme',
    }
  )
);
