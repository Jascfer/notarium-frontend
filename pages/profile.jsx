import { useState, useEffect } from 'react';
import { User, Trophy, Star, Download, Eye, Heart, Calendar, Settings, Edit, Award, Camera, Upload, LogIn, Copy } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const { user: authUser, updateUser } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Gerçek kullanıcı verileri
  const user = authUser || { firstName: 'Kullanıcı', lastName: '', email: 'ornek@email.com', avatar: '👨‍🎓', dailyLogins: [], recentActivity: [] };

  // Dinamik istatistikler
  const stats = {
    notesShared: user.stats?.notesShared || 0,
    notesDownloaded: user.stats?.notesDownloaded || 0,
    totalViews: user.stats?.totalViews || 0,
    totalLikes: user.stats?.totalLikes || 0,
    quizWins: user.stats?.quizWins || 0,
    streakDays: user.dailyLogins ? user.dailyLogins.length : 0
  };

  // Dinamik rozetler (örnek: 3 gün giriş yapanlara rozet)
  const badges = [
    ...(user.badges || []),
    ...(user.dailyLogins && user.dailyLogins.length >= 3 ? [{
      id: 'login3',
      name: 'Giriş Ustası',
      icon: '🔥',
      description: '3 gün üst üste giriş yaptı',
      earned: user.dailyLogins[2]
    }] : [])
  ];

  // Kalan isim değiştirme hakkı (varsayılan 2)
  const nameChangeCount = user.nameChangeCount || 0;
  const nameChangeLimit = 2;
  const nameChangeLeft = nameChangeLimit - nameChangeCount;

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getLevelProgress = () => {
    const currentExp = user.experience || stats.streakDays * 100;
    const levelExp = user.nextLevelExp || 1000;
    const progress = (currentExp / levelExp) * 100;
    return Math.min(progress, 100);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <LogIn className="h-5 w-5 text-green-600" />;
      case 'register': return <User className="h-5 w-5 text-blue-600" />;
      default: return <Star className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'login': return 'Giriş yaptınız';
      case 'register': return 'Kayıt oldunuz';
      default: return activity.title;
    }
  };

  const handleAvatarChange = async (newAvatar) => {
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar: newAvatar })
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUser({ avatar: newAvatar });
        setShowAvatarUpload(false);
        alert('Avatar başarıyla güncellendi!');
      } else {
        alert('Avatar güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Avatar güncelleme hatası:', error);
      alert('Avatar güncellenirken hata oluştu.');
    }
  };

  const avatarOptions = ['👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍🏫', '👩‍🏫', '🧑‍🏫'];

  const handleCopyId = () => {
    if (user.id) {
      navigator.clipboard.writeText(user.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setNewName(user.name);
    setNameError("");
  };
  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNameError("");
  };
  const handleSaveName = () => {
    if (!newName.trim()) {
      setNameError("İsim boş olamaz.");
      return;
    }
    if (newName.trim() === user.name) {
      setIsEditingName(false);
      return;
    }
    if (nameChangeLeft <= 0) {
      setNameError("İsim değiştirme hakkınız kalmadı.");
      return;
    }
    updateUser({ name: newName.trim(), nameChangeCount: nameChangeCount + 1 });
    setIsEditingName(false);
  };

  if (isLoading) {
    return <LoadingSpinner text="Profil yükleniyor..." />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-8 mb-8`}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start">
              <div className="flex-shrink-0 mr-8 mb-6 md:mb-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center text-6xl">
                    {user.avatar || '👨‍🎓'}
                  </div>
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                    title="Avatar Değiştir"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                {/* Seviye göstergesi */}
                {user?.level && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-yellow-600 text-2xl">⭐</span>
                      <span className="font-bold text-lg">Seviye {user.level}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {user.experience || 0} / {user.nextLevelExp || 100} XP
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${user.levelProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <span>{user.firstName} {user.lastName}</span>
                </h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <p className="text-gray-500 mb-2">Üyelik tarihi: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}</p>
                {/* Son aktiviteler veya günlük girişler */}
                {user.dailyLogins && user.dailyLogins.length > 0 && (
                  <div className="mt-2">
                    <span className="font-semibold text-gray-700">Son Girişler:</span>
                    <ul className="list-disc ml-6 text-gray-500 text-sm">
                      {user.dailyLogins.slice(-5).map((d, i) => (
                        <li key={i}>{new Date(d).toLocaleDateString('tr-TR')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Edit Button */}
            <button
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={handleEditName}
              disabled={nameChangeLeft <= 0}
            >
              <Edit className="h-4 w-4" />
              <span>Düzenle</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="lg:col-span-2">
              <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-6 mb-8`}>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  İstatistikler
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.notesShared}</div>
                    <div className="text-sm text-gray-600">Paylaşılan Not</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.notesDownloaded}</div>
                    <div className="text-sm text-gray-600">İndirilen Not</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalViews}</div>
                    <div className="text-sm text-gray-600">Toplam Görüntüleme</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Toplam Beğeni</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-3xl font-bold text-red-600 mb-2">{stats.quizWins}</div>
                    <div className="text-sm text-gray-600">Yarışma Zaferi</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.streakDays}</div>
                    <div className="text-sm text-gray-600">Günlük Giriş</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-6`}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Son Aktiviteler</h2>
                <div className="space-y-4">
                  {user.recentActivity && user.recentActivity.length > 0 ? user.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div>{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{getActivityText(activity)}</div>
                        <div className="text-sm text-gray-500">{activity.date ? new Date(activity.date).toLocaleDateString('tr-TR') : ''}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-center">Henüz aktivite yok.</div>
                  )}
                </div>
              </div>

              {/* Aydınlık/Karanlık Modu */}
              <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-6 mb-8`}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tema Modu</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {/* Toggle Switch */}
                    <button
                      onClick={toggleDarkMode}
                      aria-pressed={isDarkMode}
                      className={`relative w-14 h-8 rounded-full border-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-purple-700 border-purple-700' : 'bg-gray-300 border-gray-300'}`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 bg-white ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      />
                      <span className="sr-only">{isDarkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}</span>
                    </button>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{isDarkMode ? 'Karanlık Mod' : 'Aydınlık Mod'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{isDarkMode ? 'Koyu arka plan' : 'Açık arka plan'}</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="px-5 py-2 rounded-lg font-semibold shadow-md transition-colors duration-200 border border-purple-600 bg-purple-600 text-white hover:bg-white hover:text-purple-700 hover:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {isDarkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
                  </button>
                </div>
              </div>

              {/* Admin Yönetimi - Sadece founder ve adminler görebilir */}
              {(user?.role === 'founder' || user?.role === 'admin') && (
                <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-6 mb-8`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Yönetimi</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-yellow-600 font-semibold">⚠️ Önemli</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Yeni üyeler artık otomatik olarak admin rolü almıyor. Sadece kurucu (Özgür Dermanlı) 
                        founder rolü alıyor. Diğer kullanıcılar user rolü alıyor.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-600 font-semibold">ℹ️ Bilgi</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Admin yetkisi vermek için sohbet sayfasındaki kullanıcı listesini kullanabilirsiniz.
                      </p>
                    </div>
                    {/* Sadece founder görebilir */}
                    {user?.role === 'founder' && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-red-600 font-semibold">🔧 Sistem</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          Eğer eski kullanıcılar admin rolüne sahipse, bu butonla düzeltebilirsiniz.
                        </p>
                        <button
                          onClick={() => {
                            if (window.confirm('Tüm kullanıcıların rollerini user yapmak istediğinize emin misiniz? (Kurucu hariç)')) {
                              const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
                              const updatedUsers = users.map(u => {
                                if (u.name?.toLowerCase() === 'özgür dermanlı' || u.email?.toLowerCase() === 'ozgurdermanli@example.com') {
                                  return { ...u, role: 'founder' };
                                }
                                return { ...u, role: 'user' };
                              });
                              localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
                              alert('Kullanıcı rolleri güncellendi!');
                              window.location.reload();
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          Rolleri Düzelt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className={`bg-white text-gray-900 rounded-2xl shadow-sm p-6`}>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Rozetler ({badges.length})
              </h2>
              <div className="space-y-4">
                {badges.length > 0 ? badges.map((badge) => (
                  <div key={badge.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {badge.earned ? new Date(badge.earned).toLocaleDateString('tr-TR') : ''} tarihinde kazanıldı
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-500 text-center">Henüz rozet yok.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Seçim Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Camera className="h-6 w-6 mr-2 text-purple-600" />
                Avatar Seç
              </h2>
              <button
                onClick={() => setShowAvatarUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarChange(avatar)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-all duration-200 ${
                    user.avatar === avatar 
                      ? 'bg-purple-100 border-2 border-purple-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={`Avatar ${index + 1}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Avatar'ınızı seçtikten sonra tüm sayfalarda aynı avatar görünecektir.
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 