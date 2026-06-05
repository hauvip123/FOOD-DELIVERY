"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, AuthUser } from "@/lib/auth";
import { login as loginRequest, logout as logoutRequest, refreshAccessToken } from "@/lib/auth";

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  updateUser: (user: AuthUser) => void;
};

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveSession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("refreshToken");
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await refreshAccessToken();
      saveSession(response.data);
      return response.data;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, saveSession]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (storedUser && storedAccessToken) {
        try {
          setUser(JSON.parse(storedUser) as AuthUser);
          setAccessToken(storedAccessToken);
        } catch {
          clearSession();
        }
      }

      refreshSession().finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [clearSession, refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    saveSession(response.data);
    return response.data;
  }, [saveSession]);


  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    login,
    logout,
    refreshSession,
    updateUser,
  }), [accessToken, isLoading, login, logout, refreshSession, updateUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
