# EğitimHub - Google OAuth Kurulum

## Google OAuth Kurulumu

### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projenizi seçin
3. "APIs & Services" > "Credentials" bölümüne gidin

### 2. OAuth 2.0 Client ID Oluşturma

1. "Create Credentials" > "OAuth 2.0 Client IDs" seçin
2. Application type olarak "Web application" seçin
3. Aşağıdaki bilgileri doldurun:
   - **Name**: EğitimHub OAuth Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google-callback` (development)
     - `https://yourdomain.com/auth/google-callback` (production)

### 3. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Development Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Google OAuth API'yi Etkinleştirme

1. Google Cloud Console'da "APIs & Services" > "Library" bölümüne gidin
2. "Google+ API" veya "Google Identity" API'yi arayın ve etkinleştirin

### 5. Kullanım

Google ile giriş yapma özelliği şu anda simüle edilmiş durumda. Gerçek OAuth entegrasyonu için:

1. `client/pages/auth/login.jsx` dosyasında `handleGoogleLoginSimulated` fonksiyonunu `handleGoogleLogin` ile değiştirin
2. Google OAuth callback işlemlerini gerçek API çağrıları ile değiştirin

### 6. Güvenlik Notları

- Client ID'yi public olarak kullanabilirsiniz
- Client Secret'ı asla client-side kodda kullanmayın
- Production'da HTTPS kullanın
- Redirect URI'ları tam olarak eşleştirin

## Mevcut Özellikler

- ✅ Simüle edilmiş Google giriş
- ✅ Loading states
- ✅ Hata yönetimi
- ✅ Responsive tasarım
- ✅ Tema desteği

## Gelecek Geliştirmeler

- 🔄 Gerçek Google OAuth entegrasyonu
- 🔄 Google kullanıcı profil bilgileri
- 🔄 Otomatik kayıt sistemi
- 🔄 Sosyal medya ile giriş (Facebook, Twitter) 