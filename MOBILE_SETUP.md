# Tombala Game - Mobile Setup Guide

Bu rehber, Tombala oyununu mobile platformlarda çalıştırmak için gerekli adımları içerir.

## Gereksinimler

### Android Development
- Android Studio (en son sürüm)
- Android SDK (API level 24 ve üzeri)
- Java Development Kit (JDK) 8 veya üzeri

### iOS Development (Mac gereklidir)
- Xcode (en son sürüm)
- iOS Simulator
- Apple Developer hesabı (device'da test için)

## Kurulum

### 1. Dependencies Kurulumu
```bash
npm install
```

### 2. Web App Build
```bash
npm run build
```

### 3. Platform Sync
```bash
npm run sync
```

## Firebase Entegrasyonu

### Firebase Configuration
Proje Firebase ile tam entegre edilmiştir:

**Android Firebase Setup:**
- `google-services.json` dosyası `android/app/` klasöründe bulunur
- Firebase Authentication ve Firestore plugin'leri yüklü
- Google Services plugin otomatik uygulanır

**Firebase Plugin'leri:**
```bash
# Yüklü olan Firebase plugin'leri
@capacitor-firebase/authentication@7.2.0
@capacitor-firebase/firestore@7.2.0
```

**Firebase Services:**
- Authentication (Email, Google Auth)
- Firestore Database
- Real-time updates

### Environment Variables
`.env` dosyasında Firebase configuration tanımlı:
```
VITE_FIREBASE_API_KEY=AIzaSyCmtAh3hwOgQhxWYE9d2cSkm9-p2-MeITc
VITE_FIREBASE_PROJECT_ID=testing-app-42cde
VITE_FIREBASE_APP_ID=1:917232911690:android:fefe758bdfd8656f69adb3
# ... diğer Firebase ayarları
```

## Release Signing

### Android Release Configuration
Release build için signing configuration yapılandırılmıştır:

**Keystore Bilgileri:**
- Dosya: `android/app/quickbingo-release.keystore`
- Alias: `quickbingo`
- Passwords: `quickbingo2024`

**Build Configuration:**
```gradle
signingConfigs {
    release {
        keyAlias 'quickbingo'
        keyPassword 'quickbingo2024'
        storeFile file('quickbingo-release.keystore')
        storePassword 'quickbingo2024'
    }
}
```

## Icon ve Splash Screen

### Otomatik Icon Generation (Önerilen)
Proje `@capacitor/assets` tool ile yapılandırılmıştır:

```bash
# Assets tool'unu yükle
npm install @capacitor/assets --save-dev

# Icon ve splash screen oluştur
npx capacitor-assets generate --android
```

**Assets Klasör Yapısı:**
```
assets/
├── icon-only.png (1024x1024 - Ana icon)
├── splash.png (2732x2732 - Splash screen)
└── quickbingo_feature_graphic_1024x500.png (Google Play için)
```

### Manuel Icon Ekleme
Eğer manuel eklemek isterseniz [Enappd rehberini](https://enappd.com/blog/icon-splash-in-ionic-react-capacitor-apps/114/) takip edebilirsiniz.

### Google Play Store Assets
Feature graphic `android/app/src/main/play_store_assets/` klasöründe bulunur.

## Development Scripts

### Web Development
```bash
npm run dev          # Development server başlat
npm run build        # Production build
npm run preview      # Build preview
```

### Mobile Development
```bash
npm run build:mobile    # Build + tüm platformlara copy
npm run build:android   # Build + Android'e copy
npm run build:ios       # Build + iOS'a copy
npm run build:release   # Production release build

npm run open:android    # Android Studio aç
npm run open:ios        # Xcode aç

npm run run:android     # Build + Android'de çalıştır
npm run run:ios         # Build + iOS'da çalıştır

npm run sync           # Tüm değişiklikleri sync et
```

## Mobile Özellikler

### Haptic Feedback
- Number işaretleme/kaldırma: Medium/Light titreşim
- Yeni numara çekildiğinde: Light titreşim
- Game events: Heavy titreşim

### Push Notifications
- Local notifications için permission otomatik istenir
- Game events için notification gönderilir

### Network Status
- Otomatik network durumu takibi
- Connection kaybında kullanıcı bilgilendirilir

### App Lifecycle
- Background/foreground geçişleri takip edilir
- Android back button handled

### Firebase Integration
- Real-time database sync
- User authentication
- Cross-platform data sync

## Build & Deploy

### Debug Build (Development)
```bash
npm run build:android
# Android Studio'da debug APK build
```

### Release Build (Production)
```bash
npm run build:release
# Android Studio'da:
# 1. Build > Generate Signed Bundle / APK
# 2. Android App Bundle seç
# 3. Existing keystore: android/app/quickbingo-release.keystore
# 4. Alias: quickbingo, Password: quickbingo2024
```

### Android AAB Build (Google Play için)
1. Android Studio'yu aç: `npm run open:android`
2. Build > Generate Signed Bundle / APK
3. Android App Bundle seç
4. Keystore path: `android/app/quickbingo-release.keystore`
5. Key alias: `quickbingo`
6. Passwords: `quickbingo2024`

### iOS Build
1. Xcode'u aç: `npm run open:ios`
2. Product > Archive
3. Distribute App seçenekleriyle devam et

## Troubleshooting

### Firebase Issues
- **google-services.json not found**: Dosyanın `android/app/` klasöründe olduğundan emin olun
- **Firebase plugin errors**: `npx cap sync android` komutunu çalıştırın
- **Authentication errors**: Firebase Console'da authentication methods aktif olduğundan emin olun

### Signing Issues
- **Keystore not found**: `quickbingo-release.keystore` dosyasının `android/app/` klasöründe olduğundan emin olun
- **Wrong password**: Password'lerin `quickbingo2024` olduğundan emin olun
- **Key alias error**: Alias'ın `quickbingo` olduğundan emin olun

### Android
- **Gradle sync failed**: Android Studio'da "Sync Project with Gradle Files" deneyin
- **APK install error**: USB debugging aktif olduğundan emin olun
- **Network permission**: `android/app/src/main/AndroidManifest.xml` dosyasında INTERNET permission kontrol edin

### iOS
- **Code signing error**: Apple Developer hesabı ve certificates gerekli
- **Simulator not found**: Xcode Simulator yüklendiğinden emin olun
- **Pod install error**: `cd ios && pod install` komutunu çalıştırın

### Genel
- **Build errors**: `rm -rf node_modules && npm install` ile clean install deneyin
- **Capacitor sync issues**: `npx cap clean && npx cap sync` komutunu çalıştırın
- **Plugin errors**: Tüm @capacitor/* paketlerinin aynı versiyonda olduğundan emin olun

## Capacitor Configuration

`capacitor.config.ts` dosyasında aşağıdaki özellikler konfigüre edilmiştir:

- **App ID**: com.mtgsoftworks.quickbingo
- **App Name**: Quick Bingo
- **Web Directory**: dist
- **Splash Screen**: Mor tema (#7c3aed), 3 saniye süre
- **Local Notifications**: Mor icon rengi
- **Android Scheme**: HTTPS

## Önemli Notlar

1. **Firebase Configuration**: Firebase config'i web ve mobile platformlarda aynı
2. **Asset Paths**: Tüm asset path'ler relative olmalı
3. **PWA Features**: Mobile'da da PWA özellikleri aktif
4. **Responsive Design**: Mevcut Tailwind responsive design mobile'da da çalışır
5. **Icon Assets**: Capacitor assets tool ile otomatik generate edilir
6. **Release Signing**: Production build için keystore otomatik kullanılır
7. **Firebase Real-time**: Firestore real-time updates aktif

## Test

### Web Test
```bash
npm run dev
```
Browser'da localhost:5173'te test edin

### Mobile Test
```bash
npm run run:android    # Android device/emulator
npm run run:ios        # iOS device/simulator
```

### Firebase Test
- Authentication: Google/Email login test edin
- Firestore: Real-time data sync test edin
- Network: Online/offline durumları test edin

## Production Deploy

### Google Play Store
1. Release AAB build alın (`npm run build:release`)
2. Google Play Console'da yeni release oluşturun
3. AAB dosyasını upload edin
4. Store listing bilgilerini doldurun
5. Feature graphic `android/app/src/main/play_store_assets/feature_graphic.png` kullanın
6. Firebase projesi production environment'a ayarlayın

### Apple App Store
1. Xcode'da archive alın
2. App Store Connect'e upload edin
3. App Store review için submit edin

---

**Asset References:**
- [Capacitor Splash Screens and Icons](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
- [Enappd Icon/Splash Tutorial](https://enappd.com/blog/icon-splash-in-ionic-react-capacitor-apps/114/)
- [Firebase Setup Gist](https://gist.github.com/reyco1/1c9adbaae614e02dfb5efc63da470992)
- [Ionic Forum Firebase Issues](https://forum.ionicframework.com/t/firebase-connect-file-google-services-json-is-missing/196836)

Daha fazla bilgi için [Capacitor Documentation](https://capacitorjs.com/docs) bakabilirsiniz. 