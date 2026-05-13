'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PaymentMethod {
  type: string;
  detail: string;
  icon: string;
  active: boolean;
}

interface NotificationSettings {
  bookingAlerts: boolean;
  priceDrops: boolean;
  offers: boolean;
  sms: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  city?: string;
  gender?: string;
  twoFactorEnabled?: boolean;
  paymentMethods?: PaymentMethod[];
  notifications?: NotificationSettings;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('railedge_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('railedge_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      localStorage.setItem('railedge_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      setUser(data.user);
      localStorage.setItem('railedge_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('railedge_user');
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('railedge_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
