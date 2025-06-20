import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SettingsState {
  // Audio & Music
  masterVolume: number;
  musicVolume: number;
  soundEffects: boolean;
  musicEnabled: boolean;
  announcerVoice: boolean;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  language: 'tr' | 'en';
  animations: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Game Settings
  autoMarkNumbers: boolean;
  showOpponentProgress: boolean;
  gameNotifications: boolean;
  quickPlay: boolean;
  confirmActions: boolean;
  
  // Notifications
  pushNotifications: boolean;
  gameInvites: boolean;
  achievementAlerts: boolean;
  chatMentions: boolean;
  emailNotifications: boolean;
  
  // Account
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  statisticsPublic: boolean;
  
  // Other
  vibration: boolean;
  autoReconnect: boolean;
  dataCompression: boolean;
  offlineMode: boolean;
}

const defaultSettings: SettingsState = {
  // Audio & Music
  masterVolume: 70,
  musicVolume: 50,
  soundEffects: true,
  musicEnabled: true,
  announcerVoice: true,
  
  // Appearance
  theme: 'auto',
  language: 'tr',
  animations: true,
  reducedMotion: false,
  fontSize: 'medium',
  
  // Game Settings
  autoMarkNumbers: false,
  showOpponentProgress: true,
  gameNotifications: true,
  quickPlay: false,
  confirmActions: true,
  
  // Notifications
  pushNotifications: true,
  gameInvites: true,
  achievementAlerts: true,
  chatMentions: true,
  emailNotifications: false,
  
  // Account
  profileVisible: true,
  showOnlineStatus: true,
  allowFriendRequests: true,
  statisticsPublic: false,
  
  // Other
  vibration: true,
  autoReconnect: true,
  dataCompression: false,
  offlineMode: false,
};

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('quickbingo-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quickbingo-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('quickbingo-settings');
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      const validatedSettings = { ...defaultSettings, ...parsed };
      setSettings(validatedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 