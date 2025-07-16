import { useState } from 'react';
import { Home, BookOpen, User, MessageCircle, Trophy, LogIn, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { icon: Home, label: 'Ana Sayfa', href: '/' },
    { icon: BookOpen, label: 'Notlar', href: '/notes', protected: true },
    { icon: User, label: 'Profil', href: '/profile', protected: true },
    { icon: MessageCircle, label: 'Sohbet', href: '/chat', protected: true },
    { icon: Trophy, label: 'Yarışma', href: '/quiz', protected: true },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const filteredNavItems = navItems.filter(item => !item.protected || isAuthenticated);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-purple-600">📚 Notarium</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {filteredNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Auth Button / User Menu */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <span className="text-lg">{user?.avatar || '👤'}</span>
                  <span>{user?.name || 'Kullanıcı'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </a>
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ayarlar
                    </a>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/auth/login"
                className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span>Giriş / Üye Ol</span>
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {filteredNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            ))}
            
            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <span className="text-lg">{user?.avatar || '👤'}</span>
                  <span className="font-medium text-gray-900">{user?.name || 'Kullanıcı'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/auth/login"
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Giriş / Üye Ol</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 