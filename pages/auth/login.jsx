import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, BookOpen, X, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email' or 'code'
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  // Google OAuth işlevselliği
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Google OAuth popup'ını aç
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google-callback')}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      const popup = window.open(googleAuthUrl, 'googleAuth', 
        'width=500,height=600,scrollbars=yes,resizable=yes');
      
      // Popup mesajlarını dinle
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const userData = event.data.user;
          login(userData);
          setIsGoogleLoading(false);
          router.push('/profile');
          popup.close();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setError('Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
          setIsGoogleLoading(false);
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Popup kapandığında loading'i durdur
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setIsGoogleLoading(false);
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsGoogleLoading(false);
    }
  };

  // Simüle edilmiş Google giriş (gerçek OAuth için değiştirilecek)
  const handleGoogleLoginSimulated = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Simüle edilmiş Google kullanıcı verisi
      setTimeout(() => {
        const googleUserData = {
          id: Math.floor(Math.random() * 10000),
          name: 'Google Kullanıcı',
          email: 'googleuser@gmail.com',
          avatar: '👨‍💻',
          provider: 'google',
          joinDate: new Date().toISOString()
        };
        
        login(googleUserData);
        setIsGoogleLoading(false);
        router.push('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Gerçek kullanıcı kontrolü
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const foundUser = users.find(u => u.email === formData.email);
      if (!foundUser) {
        setError('Bu e-posta ile kayıtlı bir kullanıcı bulunamadı.');
        setIsLoading(false);
        return;
      }
      // Şifre kontrolü (demo: şifreyi user objesine kaydettiyseniz kontrol edin)
      if (foundUser.password && foundUser.password !== formData.password) {
        setError('Şifre yanlış.');
        setIsLoading(false);
        return;
      }
      // Giriş başarılı
      login(foundUser);
      setIsLoading(false);
      router.push('/profile');
    }, 1000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Hata mesajını temizle
  };

  // Şifremi unuttum - E-posta gönderme
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('E-posta adresi gereklidir');
      setIsForgotPasswordLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordError('Geçerli bir e-posta adresi giriniz');
      setIsForgotPasswordLoading(false);
      return;
    }

    try {
      // Simüle edilmiş e-posta gönderme
      setTimeout(() => {
        setForgotPasswordStep('code');
        setIsForgotPasswordLoading(false);
        setForgotPasswordSuccess('Doğrulama kodu e-posta adresinize gönderildi');
      }, 2000);
    } catch (error) {
      setForgotPasswordError('E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsForgotPasswordLoading(false);
    }
  };

  // Doğrulama kodu kontrolü ve şifre sıfırlama
  const handleVerifyCodeAndReset = async (e) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    
    if (!verificationCode.trim()) {
      setForgotPasswordError('Doğrulama kodu gereklidir');
      setIsForgotPasswordLoading(false);
      return;
    }

    if (!newPassword.trim()) {
      setForgotPasswordError('Yeni şifre gereklidir');
      setIsForgotPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('Şifre en az 6 karakter olmalıdır');
      setIsForgotPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError('Şifreler eşleşmiyor');
      setIsForgotPasswordLoading(false);
      return;
    }

    try {
      // Simüle edilmiş kod doğrulama ve şifre sıfırlama
      setTimeout(() => {
        setForgotPasswordSuccess('Şifreniz başarıyla sıfırlandı! Giriş yapabilirsiniz.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep('email');
          setForgotPasswordEmail('');
          setVerificationCode('');
          setNewPassword('');
          setConfirmNewPassword('');
          setForgotPasswordError('');
          setForgotPasswordSuccess('');
        }, 2000);
        setIsForgotPasswordLoading(false);
      }, 2000);
    } catch (error) {
      setForgotPasswordError('Kod doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsForgotPasswordLoading(false);
    }
  };

  // Şifremi unuttum modalını kapat
  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotPasswordEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl">📚</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Notarium'a Hoş Geldiniz</h2>
          <p className="text-gray-600">Hesabınıza giriş yapın ve öğrenmeye devam edin</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Beni hatırla
                </label>
              </div>
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  Şifremi unuttum
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                <div className="flex items-center">
                  Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button 
              onClick={handleGoogleLoginSimulated}
              disabled={isGoogleLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isGoogleLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Google ile giriş yapılıyor...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google ile giriş yap</span>
                </>
              )}
            </button>
            
            {/* Diğer sosyal medya butonları için hazırlık */}
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Google ile giriş yaparak hesabınızı oluşturabilirsiniz</p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <a href="/auth/register" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                Ücretsiz üye olun
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Şifremi Unuttum Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {forgotPasswordStep === 'email' ? 'Şifremi Unuttum' : 'Doğrulama Kodu'}
              </h3>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Success Message */}
            {forgotPasswordSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {forgotPasswordSuccess}
              </div>
            )}

            {/* Error Message */}
            {forgotPasswordError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {forgotPasswordError}
              </div>
            )}

            {/* Email Step */}
            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotPasswordLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isForgotPasswordLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kod gönderiliyor...
                    </div>
                  ) : (
                    'Doğrulama Kodu Gönder'
                  )}
                </button>
              </form>
            )}

            {/* Code Verification Step */}
            {forgotPasswordStep === 'code' && (
              <form onSubmit={handleVerifyCodeAndReset} className="space-y-4">
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Doğrulama Kodu
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                    placeholder="6 haneli kodu giriniz"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre Tekrar
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotPasswordLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isForgotPasswordLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Şifre sıfırlanıyor...
                    </div>
                  ) : (
                    'Şifreyi Sıfırla'
                  )}
                </button>
              </form>
            )}

            {/* Back to Email Step */}
            {forgotPasswordStep === 'code' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setForgotPasswordStep('email')}
                  className="text-sm text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  ← Farklı e-posta adresi kullan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 