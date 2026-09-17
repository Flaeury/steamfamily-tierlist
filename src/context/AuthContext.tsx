"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, refresh: async () => { } });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);