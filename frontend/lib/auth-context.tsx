'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, SignupData, LoginData } from './types';
import { api, tokenManager } from './api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = tokenManager.getToken();

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));

          // Set auth cookie for server actions
          const { setAuthCookie } = await import('@/app/actions/auth');
          await setAuthCookie(token);

          // Validate token by fetching current user
          try {
            const currentUser = await api.auth.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch (error) {
            // Token is invalid, clear everything
            tokenManager.clearToken();
            const { clearAuthCookie } = await import('@/app/actions/auth');
            await clearAuthCookie();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        tokenManager.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    const response = await api.auth.login(data);
    tokenManager.setToken(response.access);
    localStorage.setItem('refreshToken', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Set auth cookie for server actions
    const { setAuthCookie } = await import('@/app/actions/auth');
    await setAuthCookie(response.access);

    setUser(response.user);
  };

  const signup = async (data: SignupData): Promise<void> => {
    const response = await api.auth.signup(data);
    tokenManager.setToken(response.access);
    localStorage.setItem('refreshToken', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Set auth cookie for server actions
    const { setAuthCookie } = await import('@/app/actions/auth');
    await setAuthCookie(response.access);

    setUser(response.user);
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.auth.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearToken();

      // Clear auth cookie
      const { clearAuthCookie } = await import('@/app/actions/auth');
      await clearAuthCookie();

      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      tokenManager.clearToken();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
