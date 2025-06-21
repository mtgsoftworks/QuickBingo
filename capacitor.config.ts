import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mtgsoftworks.quickbingo',
  appName: 'QuickBingo™ Online',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#7c3aed",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7c3aed",
      sound: "beep.wav"
    },
    AdMob: {
      appId: "ca-app-pub-2923372871861852~1234567890", // Your AdMob App ID
      testingDevices: ["YOUR_DEVICE_ID"], // Add your device ID for testing
      initializeForTesting: false // Set to true for development
    }
  }
};

export default config;
