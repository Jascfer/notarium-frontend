import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'https://notarium.tr';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // localStorage'dan session ID'yi al
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    
    async function fetchUser() {
      try {
        console.log('AuthContext: Fetching user data...');
        // Session ID varsa URL parametresi olarak gönder
        const url = storedSessionId 
          ? `${API_URL}/auth/me?sessionId=${storedSessionId}`
          : `${API_URL}/auth/me`;
          
        console.log('AuthContext: Fetching from URL:', url);
        
        const res = await fetch(url, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('AuthContext: Response status:', res.status);
        console.log('AuthContext: Response headers:', Object.fromEntries(res.headers.entries()));
        
        if (res.ok) {
          const data = await res.json();
          console.log('AuthContext: User data received:', data);
          setUser(data.user);
        } else {
          console.log('AuthContext: Authentication failed, status:', res.status);
          setUser(null);
          // Session ID geçersizse localStorage'dan sil
          localStorage.removeItem('sessionId');
          setSessionId(null);
        }
      } catch (error) {
        console.error('AuthContext: Error fetching user:', error);
        setUser(null);
        localStorage.removeItem('sessionId');
        setSessionId(null);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  // Session ID'yi manuel olarak ekle (test için)
  const addSessionId = (sessionId) => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      setSessionId(sessionId);
    }
  };

  const registerUser = async (userData) => {
    try {
      console.log('AuthContext: Registering user:', userData);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      console.log('AuthContext: Register response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Kayıt başarısız');
      }
      
      const data = await res.json();
      console.log('AuthContext: Register success, user:', data.user);
      setUser(data.user);
      
      // Session ID'yi localStorage'a kaydet
      if (data.sessionId) {
        console.log('AuthContext: Storing session ID from register:', data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
        setSessionId(data.sessionId);
      }
      
      return { success: true };
    } catch (err) {
      console.error('AuthContext: Register error:', err);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Logging in with email:', email);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      console.log('AuthContext: Login response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Giriş başarısız');
      }
      
      const data = await res.json();
      console.log('AuthContext: Login success, user:', data.user);
      setUser(data.user);
      
      // Session ID'yi localStorage'a kaydet
      if (data.sessionId) {
        console.log('AuthContext: Session ID received:', data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
        setSessionId(data.sessionId);
      } else {
        console.log('AuthContext: No session ID in response');
      }
      
      return { success: true };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logout called, sessionId:', sessionId);
      // Session ID varsa URL parametresi olarak gönder
      const url = sessionId 
        ? `${API_URL}/auth/logout?sessionId=${sessionId}`
        : `${API_URL}/auth/logout`;
      
      console.log('AuthContext: Logout URL:', url);
        
      const res = await fetch(url, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('AuthContext: Logout response status:', res.status);
      
      if (!res.ok) {
        console.log('Logout error:', res.status, res.statusText);
      } else {
        const data = await res.json();
        console.log('AuthContext: Logout response:', data);
      }
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      console.log('AuthContext: Clearing user state and localStorage');
      setUser(null);
      localStorage.removeItem('sessionId');
      setSessionId(null);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const setUserRole = (role) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isLoading,
      login,
      logout,
      registerUser,
      isAuthenticated,
      setUserRole,
      sessionId,
      addSessionId
    }}>
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