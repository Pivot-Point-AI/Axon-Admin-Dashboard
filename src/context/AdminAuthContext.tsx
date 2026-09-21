"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { adminLogin, adminRefresh } from "@/lib/api/adminAuth";

const STORAGE_KEY = "admin.auth";

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  role: string;
  accessExpiresAt: number;
}

type AdminAuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  userId: string | null;
  username: string | null;
  role: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

function readStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function writeStorage(auth: StoredAuth | null) {
  try {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore (private browsing, storage disabled, etc.)
  }
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearRefreshTimer();
    setAuth(null);
    writeStorage(null);
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback(
    (current: StoredAuth) => {
      clearRefreshTimer();
      const delay = Math.max(current.accessExpiresAt - Date.now() - 30_000, 5_000);
      refreshTimer.current = setTimeout(async () => {
        try {
          const response = await adminRefresh(current.refreshToken);
          const next: StoredAuth = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            userId: response.user_id,
            // The refresh response doesn't carry the username — keep the one
            // captured at login.
            username: current.username,
            role: response.role,
            accessExpiresAt: Date.now() + response.access_expires_in * 1000,
          };
          writeStorage(next);
          setAuth(next);
          scheduleRefresh(next);
        } catch {
          logout();
        }
      }, delay);
    },
    [clearRefreshTimer, logout],
  );

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      if (stored.accessExpiresAt > Date.now()) {
        setAuth(stored);
        scheduleRefresh(stored);
      } else {
        writeStorage(null);
      }
    }
    setIsLoading(false);
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await adminLogin({ username, password });
      const next: StoredAuth = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        // The login response doesn't echo back a username — the backend
        // only returns user_id/role — so we keep what the user typed in.
        username,
        role: response.role,
        accessExpiresAt: Date.now() + response.access_expires_in * 1000,
      };
      writeStorage(next);
      setAuth(next);
      scheduleRefresh(next);
    },
    [scheduleRefresh],
  );

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!auth,
        isLoading,
        accessToken: auth?.accessToken ?? null,
        userId: auth?.userId ?? null,
        username: auth?.username ?? null,
        role: auth?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
