# QuickBingo™ Online - Mobile-First Multiplayer Bingo Game

Modern, real-time multiplayer Bingo game. Built with **React 18**, **TypeScript**, **Firebase**, **Capacitor** and modern UI design. Perfect experience on every device with 100% mobile-compatible interface.

**📱 Download from Google Play Store:** [https://play.google.com/store/apps/details?id=com.mtgsoftworks.quickbingo](https://play.google.com/store/apps/details?id=com.mtgsoftworks.quickbingo)

## ✨ Features

### 🎮 Game Features
- **Real-time multiplayer**: 2-4 player support
- **Smooth gameplay**: Instant number drawing and automatic synchronization
- **Achievement system**: Player statistics and badges
- **Event system**: Scheduled tournaments and events
- **Chat**: Live in-game chat

### 📱 Modern Mobile Experience
- **Mobile-first design**: Touch-optimized interface
- **PWA support**: Installable like a native app
- **Offline mode**: Continues when internet is disconnected
- **Native features**: Vibration, notifications, sound effects
- **Safe area support**: Optimized for modern devices

### 🎨 Modern UI/UX
- **Glass morphism**: Transparent blur effects
- **Gradient backgrounds**: Colorful themes
- **Smooth animations**: Fluid transitions with Framer Motion
- **Dark/Light mode**: Automatic theme switching
- **Responsive grid**: Optimized for every screen size

### ⚙️ Comprehensive Settings
- **Audio control**: Master volume, music, effects
- **Appearance**: Theme, language, font size, animations
- **Game settings**: Auto-marking, opponent tracking
- **Notifications**: Push, game invites, achievements
- **Account**: Profile visibility, privacy
- **Import/Export**: Settings backup

## 🛠 Technology Stack

### Frontend
- **React 18.3.1** - Modern React hooks and Suspense
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

## 🚀 Quick Start

### Requirements
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

```bash
# Clone the project
git clone https://github.com/mtgsoftworks/quick-bingo-mobil.git
cd quick-bingo-mobil

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add Firebase settings to .env file
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# (other Firebase config values)

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Mobile Build

```bash
# Build for Capacitor
npm run build

# For iOS
npx cap add ios
npx cap sync ios
npx cap open ios

# For Android
npx cap add android
npx cap sync android
npx cap open android
```

## 🎯 Game Rules

1. **Card**: Each player receives a 5×5 numerical Bingo card
2. **Number Drawing**: Host draws random numbers at specified intervals
3. **Marking**: Drawn numbers are marked automatically/manually on your card
4. **Winning**: 
   - **Line Bingo**: Complete a horizontal, vertical, or diagonal line
   - **Full House**: Complete the entire card (game end)
5. **Ranking**: First player to complete wins

## 📱 Mobile Features

### PWA Features
- Offline playability
- Add to home screen
- Push notifications
- Background sync

### Native Mobile (Capacitor)
- Haptic feedback
- Device notifications
- Network status monitoring
- File system access

## 🏗 Project Structure

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

## 🌍 Multi-Language Support

- **Turkish** (tr) - Primary language
- **English** (en) - Secondary language
- Dynamic language switching
- RTL support ready

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
- **Grid**: CSS Grid and Flexbox
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

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**MTG SoftWorks**
- 🌐 Website: [mtgsoftworks.com](https://mtgsoftworks.com)
- 📧 Email: info@mtgsoftworks.com
- 🐙 GitHub: [@mtgsoftworks](https://github.com/mtgsoftworks)

---

*QuickBingo™ Online - Modern multiplayer gaming experience* 🎯🎮
