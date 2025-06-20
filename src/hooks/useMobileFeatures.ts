import { useEffect, useState } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

export interface DeviceInfo {
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  model: string;
  isVirtual: boolean;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const useMobileFeatures = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ connected: true, connectionType: 'unknown' });
  const [isNative] = useState(Capacitor.isNativePlatform());

  useEffect(() => {
    const initializeMobileFeatures = async () => {
      if (!isNative) return;

      try {
        // Device bilgilerini al
        const info = await Device.getInfo();
        setDeviceInfo({
          platform: info.platform,
          operatingSystem: info.operatingSystem,
          osVersion: info.osVersion,
          manufacturer: info.manufacturer,
          model: info.model,
          isVirtual: info.isVirtual
        });

        // Network durumunu al
        const status = await Network.getStatus();
        setNetworkStatus({
          connected: status.connected,
          connectionType: status.connectionType
        });

        // Status bar'ı ayarla
        await StatusBar.setStyle({ style: Style.Dark });
        
        // Splash screen'i gizle
        await SplashScreen.hide();

        // Local notification permission iste
        await LocalNotifications.requestPermissions();

      } catch (error) {
        console.error('Mobile features initialization error:', error);
      }
    };

    initializeMobileFeatures();

    // Network listener cleanup için
    let cleanupFunction: (() => void) | null = null;

    if (isNative) {
      Network.addListener('networkStatusChange', status => {
        setNetworkStatus({
          connected: status.connected,
          connectionType: status.connectionType
        });
      }).then(listener => {
        cleanupFunction = () => {
          if (listener && typeof listener.remove === 'function') {
            listener.remove();
          }
        };
      }).catch(error => {
        console.error('Error setting up network listener:', error);
      });
    }

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [isNative]);

  // Haptic feedback functions
  const hapticFeedback = {
    light: async () => {
      if (isNative) {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
          console.log('Haptic not available:', error);
        }
      }
    },
    medium: async () => {
      if (isNative) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
          console.log('Haptic not available:', error);
        }
      }
    },
    heavy: async () => {
      if (isNative) {
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (error) {
          console.log('Haptic not available:', error);
        }
      }
    }
  };

  // Local notifications
  const scheduleNotification = async (title: string, body: string, delayInSeconds: number = 0) => {
    if (!isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: delayInSeconds > 0 ? { at: new Date(Date.now() + delayInSeconds * 1000) } : undefined,
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: undefined
          }
        ]
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  // App state listeners
  const addAppStateListener = (callback: (isActive: boolean) => void) => {
    if (!isNative) return () => {};

    let listener: PluginListenerHandle | null = null;

    const setupListener = async () => {
      try {
        listener = await App.addListener('appStateChange', ({ isActive }) => {
          callback(isActive);
        });
      } catch (error) {
        console.error('Error setting up app state listener:', error);
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  };

  // Back button handler (Android)
  const addBackButtonListener = (callback: () => boolean) => {
    if (!isNative) return () => {};

    let listener: PluginListenerHandle | null = null;

    const setupListener = async () => {
      try {
        listener = await App.addListener('backButton', () => {
          if (callback()) {
            // Eğer callback true döndürürse, default back button davranışını engelle
            return;
          }
          // False döndürürse veya callback yoksa, uygulamayı minimize et
          App.minimizeApp();
        });
      } catch (error) {
        console.error('Error setting up back button listener:', error);
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  };

  return {
    isNative,
    deviceInfo,
    networkStatus,
    hapticFeedback,
    scheduleNotification,
    addAppStateListener,
    addBackButtonListener
  };
}; 