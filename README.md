# 🎯 QuickBingo - Güvenli ve Optimizeli Mobil Oyun

## 🚀 Özellikler

### 🔐 Güvenlik
- **ProGuard/R8 Obfuscation**: Kod karıştırma ve tersine mühendislik koruması
- **Firebase SHA-1 Key Kısıtlaması**: Yalnızca onaylanmış uygulama erişimi
- **Firestore Güvenlik Kuralları**: Sıkı veri erişim kontrolü
- **Anti-tampering**: Hata ayıklama ve değişiklik koruması

### ⚡ Performans Optimizasyonu
- **Vite Bundle Optimizasyonu**: Manuel chunk splitting
- **Terser Minification**: Console log kaldırma ve kod sıkıştırma
- **Source Map Devre Dışı**: Production güvenliği
- **Tree Shaking**: Kullanılmayan kod temizliği

### 🎨 Modern UI/UX
- **Material-UI**: Modern ve responsive tasarım
- **Dark/Light Theme**: Kullanıcı tercihi
- **Framer Motion**: Akıcı animasyonlar
- **Progressive Web App**: PWA desteği

## 🛠️ Kurulum

### 1. Proje Klonlama
```bash
git clone [repo-url]
cd bingo_game_mobil
npm install
```

### 2. Firebase Kurulumu

#### A. Firebase Console'da Proje Oluşturma
1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Yeni proje oluşturun: `quickbingo-[unique-id]`
3. Google Analytics ekleyin (isteğe bağlı)

#### B. Android App Ekleme
1. Firebase Console > Project Settings > Your apps
2. Android uygulaması ekleyin
3. Package name: `com.mtgsoftworks.quickbingo`

#### C. SHA-1 Key Oluşturma ve Entegrasyonu
```bash
# Keystore klasörüne gidin
cd android/app/keystores

# PowerShell script'ini çalıştırın
.\create-keystore.ps1
```

**Script çıktısındaki SHA-1 fingerprint'i kopyalayın ve Firebase'e ekleyin:**
1. Firebase Console > Project Settings > Your apps > Android app
2. SHA certificate fingerprints bölümüne SHA-1'i ekleyin
3. `google-services.json` dosyasını indirin
4. Dosyayı `android/app/` klasörüne koyun

#### D. Firebase Authentication
1. Firebase Console > Authentication > Sign-in method
2. Google provider'ı aktif edin
3. Proje destek e-postasını ayarlayın

#### E. Firestore Database
1. Firebase Console > Firestore Database
2. Database oluşturun (production mode)
3. Güvenlik kurallarını deploy edin:
```bash
firebase deploy --only firestore:rules
```

### 3. Build ve Deploy

#### Development
```bash
npm run dev        # Web geliştirme sunucusu
npm run build      # Production build
```

#### Android APK
```bash
# Optimize build
npm run build

# Capacitor sync
npx cap sync android

# Android Studio'da açın
npx cap open android

# Veya direkt build (Android Studio gerekli)
npx cap build android --release
```

## 🔐 Güvenlik Özellikleri

### 1. ProGuard/R8 Obfuscation
- **Kod Karıştırma**: Sınıf ve metod adları karıştırılır
- **String Şifreleme**: Hassas string'ler şifrelenir
- **Dead Code Elimination**: Kullanılmayan kodlar kaldırılır
- **Reflection Koruması**: Reflection tabanlı saldırıları zorlaştırır

### 2. Firebase Güvenlik
- **SHA-1 Kısıtlaması**: Yalnızca onaylanmış uygulama erişimi
- **Firestore Rules**: Kullanıcı tabanlı veri erişim kontrolü
- **Rate Limiting**: İstek limitlemesi
- **Real-time Monitoring**: Şüpheli aktivite tespiti

### 3. Android Güvenlik
- **Release Signing**: Üretim keystore ile imzalama
- **Debug Devre Dışı**: Production'da debug özellikleri kapalı
- **Anti-debugging**: Runtime debugging engellemesi

## 📱 Platform Desteği

### Android
- **Minimum SDK**: API 22 (Android 5.1)
- **Target SDK**: API 34 (Android 14)
- **Architecture**: ARM64, ARM, x86_64

### Web (PWA)
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Offline Support**: Service Worker ile cache
- **Install Prompt**: Add to Home Screen

## 🧩 Kullanılan Teknolojiler

### Frontend
- **React 18**: Modern React hooks ve Concurrent Features
- **TypeScript**: Type safety ve geliştirici deneyimi
- **Material-UI v5**: Kapsamlı UI component kütüphanesi
- **Framer Motion**: Profesyonel animasyonlar
- **React i18next**: Çoklu dil desteği

### Backend
- **Firebase Auth**: Kullanıcı kimlik doğrulama
- **Firestore**: NoSQL veritabanı
- **Firebase Functions**: Sunucu tarafı işlemler (isteğe bağlı)

### Build & Tools
- **Vite**: Hızlı build tool
- **Capacitor**: Cross-platform native runtime
- **ESLint + Prettier**: Kod kalitesi
- **Terser**: Minification ve obfuscation

## 🎮 Oyun Özellikleri

### Çok Oyunculu
- **Real-time**: WebSocket tabanlı gerçek zamanlı oyun
- **2-4 Oyuncu**: Esneklik ve varyasyon
- **Room System**: Oda oluşturma ve katılma

### Güvenlik
- **Anti-cheat**: Hile koruması algoritmaları
- **Fair Play**: Adil oyun mekanizmaları
- **Verified Sessions**: Doğrulanmış oyun oturumları

### UX/UI
- **Responsive Design**: Tüm ekran boyutları
- **Haptic Feedback**: Dokunsal geri bildirim
- **Sound Effects**: İmmersive ses deneyimi
- **Accessibility**: Erişilebilirlik desteği

## 📊 Performans Metrikleri

### Build Optimizasyonu
- **Bundle Size**: ~440KB gzipped
- **Chunk Splitting**: Verimli code splitting
- **Tree Shaking**: %30 kod azaltımı
- **Minification**: %60 boyut azaltımı

### Runtime Performance
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Memory Usage**: <50MB average
- **Battery Efficiency**: Optimize edilmiş

## 🚨 Sorun Giderme

### Common Issues

#### 1. Keystore Oluşturma Hatası
```bash
# Java JDK kontrolü
java -version
javac -version

# PATH environment variable kontrolü
echo $JAVA_HOME
```

#### 2. Firebase Connection Hatası
- SHA-1 fingerprint'in doğru olduğunu kontrol edin
- `google-services.json` dosyasının doğru konumda olduğunu kontrol edin
- Internet bağlantısı ve Firebase kota limitlerini kontrol edin

#### 3. Build Hatası
```bash
# Node modules temizleme
rm -rf node_modules package-lock.json
npm install

# Cache temizleme
npm run clean
npx cap clean android
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

- **Developer**: MTG SoftWorks
- **Email**: [email]
- **Website**: [website]

---

**🔐 Güvenli, ⚡ Hızlı ve 🎮 Eğlenceli QuickBingo deneyimi!**
