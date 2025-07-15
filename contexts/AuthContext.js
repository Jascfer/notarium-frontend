import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://notarium-backend-production.up.railway.app';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user on mount (JWT)
  useEffect(() => {
    // Oturum cookie tabanlı, sadece user'ı state'te tut
    setUser(null);
    setIsLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        setError('Authentication failed');
      }
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }
      setUser(data.user);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }
      setUser(data.user);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    registerUser,
    refreshUser,
    isAuthenticated: !!user,
    API_URL,
    SOCKET_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 