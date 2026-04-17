"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import { silentRefresh, removeAccessToken } from "../lib/axiosInstance";
import { fetchCurrentUser, logoutApi } from "../services/auth.service";
import type { IUser } from "../types";

// ---------- Context Type ----------
export interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ---------- Context ----------
export const AuthContext = createContext<AuthContextType | null>(null);

// ---------- Full-Screen Loading Spinner ----------
function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background">
      {/* Animated Logo */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Droplets className="h-10 w-10" />
        </div>
      </div>

      {/* Brand Name */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Loading {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}...</p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Provider ----------
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: attempt silent refresh to restore session
  useEffect(() => {
    const initAuth = async () => {
      try {
        await silentRefresh();
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        // No valid refresh token cookie — user is a guest
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      removeAccessToken();
      setUser(null);
      router.push("/auth/login");
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    logout,
    refreshUser,
  };

  // Block render until auth is resolved — prevents flickering
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Internal export for direct usage if needed
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside AuthProvider");
  return ctx;
};
