import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';
import { getAdminApiBaseUrl } from '../services/adminApi';
interface AuthContextType {
  isAuthenticated: boolean; user: AdminUser | null; isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clearSession = useCallback(() => {
    localStorage.removeItem('design_forge_admin_token');
    localStorage.removeItem('design_forge_admin_user');
    setUser(null);
  }, []);
  useEffect(() => {
    let active = true;
    const validate = async () => {
      try {
        const res = await fetch(getAdminApiBaseUrl() + '/api/auth/session', { credentials: 'include', signal: AbortSignal.timeout(5000) });
        const json = await res.json();
        if (active) { if (res.ok) setUser(json.data); else clearSession(); }
      } catch { if (active) clearSession(); }
      finally { if (active) setIsLoading(false); }
    };
    localStorage.removeItem('design_forge_admin_token');
    localStorage.removeItem('design_forge_admin_user');
    validate();
    const timer = window.setInterval(validate, 60000);
    window.addEventListener('focus', validate);
    window.addEventListener('studio:unauthorized', clearSession);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', validate); window.removeEventListener('studio:unauthorized', clearSession); };
  }, [clearSession]);
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(getAdminApiBaseUrl() + '/api/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }), signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.message || 'Invalid credentials.' };
      setUser(json.user);
      return { success: true };
    } catch { return { success: false, error: 'Unable to connect to the studio API. Please try again.' }; }
  };
  const logout = async () => {
    try {
      const res = await fetch(getAdminApiBaseUrl() + '/api/auth/logout', { method: 'POST', credentials: 'include', signal: AbortSignal.timeout(5000) });
      if (!res.ok && res.status !== 401) throw new Error('Unable to sign out.');
      clearSession();
    } catch { window.alert('Unable to sign out. Please retry when the API is available.'); }
  };
  return <AuthContext.Provider value={{ isAuthenticated: Boolean(user), user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within an AuthProvider'); return value; };
