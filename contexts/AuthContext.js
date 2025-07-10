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
        // Session ID varsa URL parametresi olarak gönder
        const url = storedSessionId 
          ? `${API_URL}/auth/me?sessionId=${storedSessionId}`
          : `${API_URL}/auth/me`;
          
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
          // Session ID geçersizse localStorage'dan sil
          localStorage.removeItem('sessionId');
          setSessionId(null);
        }
      } catch {
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
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Kayıt başarısız');
      const data = await res.json();
      setUser(data.user);
      
      // Session ID'yi localStorage'a kaydet
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        setSessionId(data.sessionId);
      }
      
      return { success: true };
    } catch (err) {
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
      if (!res.ok) throw new Error('Giriş başarısız');
      const data = await res.json();
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
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    localStorage.removeItem('sessionId');
    setSessionId(null);
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