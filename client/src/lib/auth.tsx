import { createContext, useContext, ReactNode } from "react";
import { useMarketStore, User } from "./mockData";

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useMarketStore((state) => state.currentUser);
  const login = useMarketStore((state) => state.login);
  const logout = useMarketStore((state) => state.logout);

  // Mock loading state for realism
  const isLoading = false; 

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
