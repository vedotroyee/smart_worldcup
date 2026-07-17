"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role, User } from "@/types";

/**
 * Mock auth for the demo. In production this becomes a real session
 * (NextAuth/Auth.js, Supabase Auth, or Firebase Auth) with:
 *  - Fans: email/phone OTP or social login, ticket linked via order ID.
 *  - Volunteers/Admins: SSO (Google Workspace/Okta) + role claims from your IdP,
 *    enforced again server-side in each API route (never trust client role alone).
 */

interface AuthContextValue {
  user: User;
  setRole: (role: Role) => void;
  setLanguage: (lang: string) => void;
}

const DEFAULT_USER: User = {
  id: "demo-user",
  name: "Guest Fan",
  role: "fan",
  language: "en",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("wc26-demo-user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("wc26-demo-user", JSON.stringify(user));
  }, [user]);

  const setRole = (role: Role) =>
    setUser((u) => ({
      ...u,
      role,
      name: role === "admin" ? "Ops Manager" : role === "volunteer" ? "Volunteer" : "Guest Fan",
    }));

  const setLanguage = (language: string) => setUser((u) => ({ ...u, language }));

  return <AuthContext.Provider value={{ user, setRole, setLanguage }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function requireRole(userRole: Role, allowed: Role[]) {
  return allowed.includes(userRole);
}
