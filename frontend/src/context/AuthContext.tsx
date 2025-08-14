// src/context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { AuthResponse, User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('med_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthResponse;
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {}
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    async login(email, password) {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('med_auth', JSON.stringify(res));
      return res;
    },
    async register(name, email, password, role) {
      const maybe = await api.register(name, email, password, role);
      const res = maybe ?? (await api.login(email, password));
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('med_auth', JSON.stringify(res));
      return res;
    },
    logout() {
      setUser(null);
      setToken(null);
      localStorage.removeItem('med_auth');
    },
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
