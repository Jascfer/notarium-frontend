import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://notarium-backend-production.up.railway.app';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user on mount (JWT)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsLoading(false);
    } else {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setError('No token');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        setError('Authentication failed');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
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
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    registerUser,
    refreshUser,
    isAuthenticated: !!user && !!token,
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