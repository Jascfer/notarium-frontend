import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Basit bir localStorage admin kontrolü (sadece kurucu admin)
function getInitialRole(userData) {
  // Sadece belirli e-posta founder olabilir
  if (userData?.email?.toLowerCase() === 'ozgurxspeaktr@gmail.com') {
    return 'founder';
  }
  return 'user';
}

function addDailyLogin(userData) {
  const today = new Date().toISOString().slice(0, 10);
  let logins = userData.dailyLogins || [];
  if (!logins.includes(today)) {
    logins = [...logins, today];
  }
  return logins;
}

function addActivity(userData, activity) {
  let acts = userData.recentActivity || [];
  acts = [{ ...activity, date: new Date().toISOString().slice(0, 10) }, ...acts].slice(0, 10);
  return acts;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');

    if (isLoggedIn === 'true' && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Kullanıcı verisi parse edilemedi:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // allUsers listesinden email ile kullanıcıyı bul
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const foundUser = users.find(u => u.email === userData.email);
    let loginUser = foundUser ? { ...foundUser } : { ...userData };
    if (!loginUser.role) {
      loginUser.role = getInitialRole(loginUser);
    }
    // Günlük giriş ve aktivite ekle
    loginUser.dailyLogins = addDailyLogin(loginUser);
    loginUser.recentActivity = addActivity(loginUser, { type: 'login', title: 'Giriş yaptınız' });
    setUser(loginUser);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(loginUser));
    // allUsers listesini de güncelle
    const idx = users.findIndex(u => u.id === loginUser.id);
    if (idx !== -1) {
      users[idx] = loginUser;
      localStorage.setItem('allUsers', JSON.stringify(users));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
    // allUsers listesini de güncelle
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const idx = users.findIndex(u => u.id === newUserData.id);
    if (idx !== -1) {
      users[idx] = newUserData;
      localStorage.setItem('allUsers', JSON.stringify(users));
    }
  };

  // Kayıt olan tüm kullanıcıları localStorage'da tut (sadece demo için)
  const registerUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    userData.id = Date.now().toString(); // Benzersiz id ata
    userData.role = getInitialRole(userData);
    userData.dailyLogins = addDailyLogin(userData);
    userData.recentActivity = addActivity(userData, { type: 'register', title: 'Kayıt oldunuz' });
    users.push(userData);
    localStorage.setItem('allUsers', JSON.stringify(users));
    login(userData);
  };

  // Admin yetkisi verme/geri alma (sadece frontend demo için)
  const setUserRole = (userId, newRole) => {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      localStorage.setItem('allUsers', JSON.stringify(users));
      // Eğer kendi rolümüz değiştiyse güncelle
      if (user && user.id === userId) {
        setUser({ ...user, role: newRole });
        localStorage.setItem('user', JSON.stringify({ ...user, role: newRole }));
      }
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