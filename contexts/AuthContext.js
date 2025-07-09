import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
// Tüm fetch isteklerinde sadece path kullan:
// fetch(`${API_URL}/auth/login`, ...) yerine:
// fetch('/auth/login', ...)
//
// Google ile girişle ilgili kodları ve fonksiyonları kaldır.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Oturum bilgisini backend'den kontrol et (isteğe bağlı, örn. /auth/me)
    async function fetchUser() {
      try {
        const res = await fetch(`/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  // Kayıt
  const registerUser = async (userData) => {
    try {
      const res = await fetch(`/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Kayıt başarısız');
      const data = await res.json();
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Giriş
  const login = async (email, password) => {
    try {
      const res = await fetch(`/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Giriş başarısız');
      const data = await res.json();
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Çıkış
  const logout = async () => {
    await fetch(`/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  // Kullanıcı güncelleme (isteğe bağlı, backend endpointine göre)
  const updateUser = async (updatedUserData) => {
    try {
      const res = await fetch(`/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      const data = await res.json();
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Admin yetkisi verme/geri alma (isteğe bağlı, backend endpointine göre)
  const setUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/auth/set-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Rol güncellenemedi');
      const data = await res.json();
      if (user && user._id === userId) setUser({ ...user, role: newRole });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    registerUser,
    setUserRole,
    isAuthenticated: !!user
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