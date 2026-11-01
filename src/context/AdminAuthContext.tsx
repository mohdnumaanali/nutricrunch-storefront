import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCredentials: (data: {
    newEmail?: string;
    currentPassword: string;
    newPassword?: string;
    confirmPassword?: string;
    name?: string;
  }) => Promise<{ success: boolean; message?: string; error?: string; user?: AdminUser }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nutricrunch_admin_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setAdmin(data.user);
        } else {
          // Token invalid or expired
          localStorage.removeItem('nutricrunch_admin_token');
          setToken(null);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      let clientFallbackCreds = null;
      try {
        const stored = localStorage.getItem('nutricrunch_custom_admin_creds');
        if (stored) {
          clientFallbackCreds = JSON.parse(stored);
        }
      } catch {}

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, clientFallbackCreds })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('nutricrunch_admin_token', data.token);
      if (data.backupCreds && data.backupCreds.isCustom) {
        localStorage.setItem('nutricrunch_custom_admin_creds', JSON.stringify(data.backupCreds));
      }
      setToken(data.token);
      setAdmin(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error connecting to auth server' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }
    localStorage.removeItem('nutricrunch_admin_token');
    setToken(null);
    setAdmin(null);
  };

  const updateCredentials = async (data: {
    newEmail?: string;
    currentPassword: string;
    newPassword?: string;
    confirmPassword?: string;
    name?: string;
  }) => {
    if (!token) {
      return { success: false, error: 'Authentication token not found. Please log in again.' };
    }

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update credentials' };
      }

      if (resData.user) {
        setAdmin(resData.user);
      }

      // Persist backup credentials permanently in client localStorage
      if (resData.backupCreds) {
        localStorage.setItem(
          'nutricrunch_custom_admin_creds',
          JSON.stringify(resData.backupCreds)
        );
      }

      return {
        success: true,
        message: resData.message || 'Credentials updated successfully!',
        user: resData.user
      };
    } catch (err) {
      return { success: false, error: 'Network error communicating with auth server' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        updateCredentials,
        isLoading,
        isAuthenticated: !!admin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
