import { useState, useEffect } from 'react';
import { BookOpen, Users, Trophy, TrendingUp, Star, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [noteCount, setNoteCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Simüle edilmiş loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Not sayısı
    const notes = localStorage.getItem('site_notes_v1');
    setNoteCount(notes ? JSON.parse(notes).length : 0);
    // Sohbet mesajı sayısı
    const chatMsgs = localStorage.getItem('site_chat_messages');
    setChatCount(chatMsgs ? JSON.parse(chatMsgs).length : 0);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Notarium yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Notarium
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-gray-700">Öğrenmenin Yeni Adresi</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Notlarınızı paylaşın, arkadaşlarınızla sohbet edin, bilgi yarışmalarına katılın ve 
              eğitim yolculuğunuzu daha keyifli hale getirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <a
                    href="/notes"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Notlarıma Git
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                  <a
                    href="/quiz"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
                  >
                    Yarışmaya Katıl
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/auth/register"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Hemen Başla
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                  <a
                    href="/auth/login"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
                  >
                    Giriş Yap
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message for Logged In Users */}
      {isAuthenticated && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Hoş geldin, {user?.name}!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Bugün ne öğrenmek istiyorsun? Notlarını paylaş, arkadaşlarınla sohbet et veya günlük yarışmaya katıl!
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <a
                  href="/notes"
                  className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                >
                  <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
                  <p className="text-gray-600">Ders notlarını paylaşın ve keşfet</p>
                </a>
                <a
                  href="/chat"
                  className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                >
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sohbet</h3>
                  <p className="text-gray-600">Arkadaşlarınla gerçek zamanlı sohbet</p>
                </a>
                <a
                  href="/quiz"
                  className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                >
                  <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Yarışma</h3>
                  <p className="text-gray-600">Günlük bilgi yarışmasına katıl</p>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neler Sunuyoruz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Eğitim deneyiminizi geliştirmek için tasarlanmış özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Notlar */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">📚 Notlar</h3>
              <p className="text-gray-600">Ders notlarınızı paylaşın ve diğer öğrencilerden faydalanın</p>
            </div>

            {/* Sohbet */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">💬 Sohbet</h3>
              <p className="text-gray-600">Gerçek zamanlı sohbet ile arkadaşlarınızla bağlantıda kalın</p>
            </div>

            {/* Yarışma */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🎮 Yarışma</h3>
              <p className="text-gray-600">Günlük bilgi yarışmalarına katılın ve puanlar kazanın</p>
            </div>

            {/* Seviye */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🏆 Seviye</h3>
              <p className="text-gray-600">Aktivitenize göre seviye atlayın ve rozetler kazanın</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">2543</div>
              <div className="text-purple-100">Aktif Öğrenci</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{noteCount}</div>
              <div className="text-purple-100">Paylaşılan Not</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{chatCount}</div>
              <div className="text-purple-100">Günlük Sohbet</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {isAuthenticated ? 'Hemen Başlayın ve Öğrenmeye Devam Edin!' : 'Hemen Katılın ve Öğrenmeye Başlayın!'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {isAuthenticated 
              ? 'Notlarınızı paylaşın, arkadaşlarınızla sohbet edin ve bilgi yarışmalarına katılın.'
              : 'Ücretsiz hesap oluşturun ve eğitim topluluğumuzun bir parçası olun.'
            }
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/notes"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Notlarımı Görüntüle
              </a>
              <a
                href="/profile"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Profilimi Görüntüle
              </a>
            </div>
          ) : (
            <a
              href="/auth/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Ücretsiz Üye Ol
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
