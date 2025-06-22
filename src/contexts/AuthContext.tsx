'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User, AuthenticationError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInitialAuth, setHasCheckedInitialAuth] = useState(false);

  const isAuthenticated = !!user;

  // Only check auth on initial app load, not after every login
  useEffect(() => {
    if (!hasCheckedInitialAuth) {
      checkAuth();
    }
  }, [hasCheckedInitialAuth]);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const response = await apiClient.getCurrentUser();
      console.log('Auth check successful:', response.user.email);
      setUser(response.user);
    } catch (error) {
      // Handle authentication errors gracefully
      if (error instanceof AuthenticationError) {
        console.log('Auth check failed - user not logged in (expected)');
      } else {
        console.log('Auth check failed - network or other error:', error);
      }
      // User is not authenticated, which is fine for initial load
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedInitialAuth(true);
    }
  };

  const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      console.log('Attempting login...');
      const response = await apiClient.login(email, password);
      console.log('Login successful:', response.user.email);
      setUser(response.user);
      
      // Mark as checked so we don't call checkAuth again
      setHasCheckedInitialAuth(true);
      setIsLoading(false);
      
      console.log('User set in context, login complete');
      
      // Return the response so the login button can access it
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setHasCheckedInitialAuth(false); // Reset so we can check auth again
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user anyway
      setUser(null);
      setHasCheckedInitialAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}