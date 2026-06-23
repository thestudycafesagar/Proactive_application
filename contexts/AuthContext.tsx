"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useGetMeQuery } from "../lib/services/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Accountant" | "Staff" | "Team Leader";
  tenant: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Read token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
    setIsInitialized(true);
  }, []);

  const { data, isLoading: isQueryLoading, isFetching, isError } = useGetMeQuery(undefined, {
    skip: !token, // Only fetch if token exists
  });

  // Loading state: we are loading if we haven't checked localStorage yet,
  // OR if we have a token and the query is still fetching.
  const isAuthLoading = !isInitialized || (!!token && (isQueryLoading || isFetching) && !data);

  let user: AuthUser | null = null;

  if (data?.user) {
    const backendUser = data.user;
    user = {
      id: backendUser._id || backendUser.id,
      name: backendUser.name || backendUser.username,
      email: backendUser.email,
      role: backendUser.roleId?.name || "Admin",
      tenant: "Workspace",
      initials: (backendUser.name?.[0] || backendUser.email?.[0] || "U").toUpperCase(),
    };
  }

  const setAuthToken = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isAuthLoading,
        setAuthToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
