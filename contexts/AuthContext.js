import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Environment configuration - Her zaman local API routes kullan
const API_URL = '/api'; // Force local API routes - ignore environment variables
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://notarium-backend-production.up.railway.app';

// Debug logging
console.log('AuthContext - API_URL:', API_URL);
console.log('AuthContext - SOCKET_URL:', SOCKET_URL);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user from:', `${API_URL}/auth/me`);
      
      const res = await fetch(`${API_URL}/auth/me`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Auth/me response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('User data received:', data);
        setUser(data.user);
        setError(null);
      } else {
        console.log('Auth/me failed:', res.status, res.statusText);
        setUser(null);
        setError('Authentication failed');
      }
    } catch (err) {
      console.error('Fetch user error:', err);
      setUser(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      console.log('Registering user:', userData.email);
      
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }
      
      console.log('Registration successful:', data);
      setUser(data.user);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Logging in user:', email);
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }
      
      console.log('Login successful:', data);
      
      // User state'ini hemen güncelle
      setUser(data.user);
      setError(null);
      
      // Session'ı localStorage'a kaydet (opsiyonel)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // User state'ini tekrar kontrol et
      setTimeout(() => {
        console.log('Current user state after login:', user);
      }, 100);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      setUser(null);
      setError(null);
      
      // LocalStorage'dan temizle
      localStorage.removeItem('user');
      
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout error:', err);
      // Hata olsa bile user'ı temizle
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async () => {
    console.log('Refreshing user data');
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