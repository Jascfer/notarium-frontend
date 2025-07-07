import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GoogleCallback() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // URL'den authorization code'u al
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError('Google ile giriş yapılırken bir hata oluştu.');
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('Authorization code bulunamadı.');
          setIsProcessing(false);
          return;
        }

        // Simüle edilmiş Google kullanıcı verisi (gerçek OAuth için değiştirilecek)
        const googleUserData = {
          id: Math.floor(Math.random() * 10000),
          name: 'Google Kullanıcı',
          email: 'googleuser@gmail.com',
          avatar: '👨‍💻',
          provider: 'google',
          joinDate: new Date().toISOString()
        };

        // Ana sayfaya başarı mesajı gönder
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: googleUserData
          }, window.location.origin);
          window.close();
        } else {
          // Popup kapandıysa localStorage'a kaydet
          localStorage.setItem('googleUserData', JSON.stringify(googleUserData));
          router.push('/profile');
        }

      } catch (error) {
        console.error('Google callback error:', error);
        setError('Google ile giriş yapılırken bir hata oluştu.');
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text="Google ile giriş yapılıyor..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Hatası</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 