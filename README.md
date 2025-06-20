# QuickBingo™ Online - Mobile-First Multiplayer Bingo Game

Modern, gerçek zamanlı çok oyunculu Bingo oyunu. **React 18**, **TypeScript**, **Firebase**, **Capacitor** ve modern UI tasarımı ile geliştirildi. 100% mobil uyumlu arayüz ile her cihazda mükemmel deneyim.

## ✨ Özellikler

### 🎮 Oyun Özellikleri
- **Gerçek zamanlı multiplayer**: 2-4 oyuncu desteği
- **Akıcı oynanış**: Instant sayı çekme ve otomatik senkronizasyon
- **Başarım sistemi**: Oyuncu istatistikleri ve rozetler
- **Event sistemi**: Zamanlanmış turnuvalar ve etkinlikler
- **Sohbet**: Canlı oyun içi chat

### 📱 Modern Mobil Deneyim
- **Mobile-first design**: Touch-optimized interface
- **PWA desteği**: Uygulama gibi yüklenebilir
- **Offline mod**: İnternet kesildiğinde devam eder
- **Native features**: Titreşim, bildirimler, ses efektleri
- **Safe area support**: Modern cihazlar için optimize

### 🎨 Modern UI/UX
- **Glass morphism**: Şeffaf blur efektleri
- **Gradient backgrounds**: Rengarenk tema
- **Smooth animations**: Framer Motion ile akıcı geçişler
- **Dark/Light mode**: Otomatik tema değişimi
- **Responsive grid**: Her ekran boyutu için optimize

### ⚙️ Kapsamlı Ayarlar
- **Ses kontrolü**: Ana ses, müzik, efektler
- **Görünüm**: Tema, dil, yazı boyutu, animasyonlar
- **Oyun ayarları**: Otomatik işaretleme, rakip takibi
- **Bildirimler**: Push, oyun davetleri, başarımlar
- **Hesap**: Profil görünürlüğü, gizlilik
- **Import/Export**: Ayarları yedekleme

## 🛠 Teknoloji Stack

### Frontend
- **React 18.3.1** - Modern React hooks ve Suspense
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion 11** - Smooth animations

### Backend & Database
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Auth** - Secure authentication (Email/Google)
- **Firebase Cloud Functions** - Serverless backend logic
- **Firebase Storage** - File and media storage

### Mobile
- **Capacitor 6** - Native mobile app wrapper
- **PWA** - Progressive Web App capabilities
- **Touch optimized** - Mobile-first interaction design

### UI/UX Libraries
- **Material-UI 7.0** - React component library (being phased out)
- **Custom CSS System** - Modern utility classes
- **React Hot Toast** - Beautiful notifications
- **React i18next** - Internationalization (TR/EN)

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Firebase projesi

### Kurulum

```bash
# Projeyi klonla
git clone https://github.com/mtgsoftworks/quick-bingo-mobil.git
cd quick-bingo-mobil

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Firebase ayarlarını .env dosyasına ekle
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# (diğer Firebase config değerleri)

# Development server'ı başlat
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

### Mobile Build

```bash
# Capacitor için build
npm run build

# iOS için
npx cap add ios
npx cap sync ios
npx cap open ios

# Android için
npx cap add android
npx cap sync android
npx cap open android
```

## 🎯 Oyun Kuralları

1. **Kart**: Her oyuncuya 5×5 sayısal Bingo kartı verilir
2. **Sayı Çekme**: Host belirlenen aralıklarla rastgele sayı çeker
3. **İşaretleme**: Çekilen sayılar kartınızda otomatik/manuel işaretlenir
4. **Kazanma**: 
   - **Satır Bingo**: Yatay, dikey veya çapraz bir satır tamamlama
   - **Full House**: Tüm kartı tamamlama (oyun sonu)
5. **Sıralama**: İlk tamamlayan oyuncu kazanır

## 📱 Mobile Features

### PWA Özellikleri
- Çevrimdışı oynanabilirlik
- Ana ekrana ekleme
- Push bildirimler
- Background sync

### Native Mobile (Capacitor)
- Dokunmatik geri bildirimi (haptic feedback)
- Cihaz bildirimler
- Ağ durumu takibi
- Dosya sistemi erişimi

## 🏗 Proje Yapısı

```
quick-bingo-mobil/
├── android/              # Android Capacitor files
├── public/               # Static assets
│   ├── locales/         # i18n translation files
│   └── sounds/          # Game sound effects
├── src/
│   ├── components/      # React components
│   │   ├── Auth/        # Login, Signup, Routes
│   │   ├── Game/        # Game screen, cards, controls
│   │   ├── Lobby/       # Main lobby, room management
│   │   └── UI/          # Reusable UI components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase and API services
│   ├── styles/          # Modern CSS system
│   │   ├── tokens.css   # Design tokens
│   │   └── utilities.css # Utility classes
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── capacitor.config.ts  # Capacitor configuration
├── firebase.json        # Firebase hosting config
├── tailwind.config.js   # Tailwind CSS config
└── vite.config.ts       # Vite build config
```

## 🌍 Çoklu Dil Desteği

- **Türkçe** (tr) - Ana dil
- **English** (en) - İkincil dil
- Dinamik dil değiştirme
- RTL desteği hazır

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (500-900)
- **Secondary**: Purple/Amber
- **Success**: Green (emerald)
- **Error**: Red (rose)
- **Warning**: Yellow (amber)

### Typography
- **Sans-serif**: Inter font family
- **Responsive sizes**: Mobile-first scaling
- **Custom weights**: 400, 500, 600, 700, 800

### Spacing & Layout
- **Container**: Mobile-optimized widths
- **Grid**: CSS Grid ve Flexbox
- **Touch targets**: Minimum 44px for mobile

## 🔧 Development Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run test         # Run tests
npm run cap:android  # Android sync
npm run cap:ios      # iOS sync
```

## 📈 Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Bundle size**: Optimized with tree shaking
- **Real-time latency**: < 100ms Firebase sync
- **PWA score**: 95+ Lighthouse

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### App Stores
- iOS: Xcode → Archive → Upload
- Android: Android Studio → Generate Signed APK
- Play Console: Upload AAB file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Bu proje **MIT License** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Developer

**MTG SoftWorks**
- 🌐 Website: [mtgsoftworks.com](https://mtgsoftworks.com)
- 📧 Email: info@mtgsoftworks.com
- 🐙 GitHub: [@mtgsoftworks](https://github.com/mtgsoftworks)

---

*QuickBingo™ Online - Modern multiplayer gaming experience* 🎯🎮
