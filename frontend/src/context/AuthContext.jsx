/**
 * AuthContext — JWT authentication state management.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!tokens?.access;

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (tokens) localStorage.setItem('tokens', JSON.stringify(tokens));
    else localStorage.removeItem('tokens');
  }, [tokens]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      setTokens({ access: data.access, refresh: data.refresh });
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const data = await authService.register(formData);
      setTokens(data.tokens);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const errors = error.response?.data || {};
      const msg = Object.values(errors).flat().join(' ') || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (tokens?.refresh) {
      await authService.logout(tokens.refresh);
    }
    setUser(null);
    setTokens(null);
  }, [tokens]);

  const value = {
    user,
    tokens,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
