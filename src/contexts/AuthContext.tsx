// ────────────────────────────────────────────────────────────
// Auth Context — JWT + protected route state
// ────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../lib/services';
import toast from 'react-hot-toast';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session from localStorage
    const stored = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        // Optionally refresh user from server
        authService.me().then((me) => {
          const updated = { ...JSON.parse(stored), ...me };
          setUser(updated);
          localStorage.setItem('admin_user', JSON.stringify(updated));
        }).catch(() => {
          // Token invalid, will be caught by API interceptor
        });
      } catch {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (!result.user) throw new Error('Invalid response from server');
    // Normalize role (backend may return object with .name)
    const rawUser: any = result.user;
    let roleName: string = '';
    if (typeof rawUser.role === 'string') {
      roleName = rawUser.role;
    } else if (rawUser.role && typeof rawUser.role === 'object') {
      roleName = rawUser.role.name || '';
    }
    const normalized = { ...rawUser, role: roleName };
    if (roleName.toUpperCase() !== 'ADMIN' && roleName.toUpperCase() !== 'SUPER_ADMIN') {
      throw new Error('Access denied. Admin privileges required.');
    }
    localStorage.setItem('admin_token', result.tokens.accessToken);
    localStorage.setItem('admin_refresh_token', result.tokens.refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(normalized));
    setUser(normalized as AdminUser);
    toast.success(`Welcome back, ${normalized.firstName || normalized.email}!`);
    return normalized as AdminUser;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // ignore
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refresh = async () => {
    try {
      const me = await authService.me();
      setUser(me);
      localStorage.setItem('admin_user', JSON.stringify(me));
    } catch {
      // interceptor handles 401
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
