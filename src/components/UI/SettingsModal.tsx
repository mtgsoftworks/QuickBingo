import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'audio' | 'appearance' | 'game' | 'notifications' | 'account' | 'other';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');
  const [importText, setImportText] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'audio', label: 'Ses & Müzik', icon: '🔊' },
    { id: 'appearance', label: 'Görünüm', icon: '🎨' },
    { id: 'game', label: 'Oyun', icon: '🎲' },
    { id: 'notifications', label: 'Bildirimler', icon: '🔔' },
    { id: 'account', label: 'Hesap', icon: '👤' },
    { id: 'other', label: 'Diğer', icon: '⚙️' },
  ];

  const handleExport = () => {
    const settingsJson = exportSettings();
    navigator.clipboard.writeText(settingsJson);
    // TODO: Show toast notification
  };

  const handleImport = () => {
    const success = importSettings(importText);
    if (success) {
      setImportText('');
      setShowImportExport(false);
      // TODO: Show success toast
    } else {
      // TODO: Show error toast
    }
  };

  const SliderInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value}%
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );

  const ToggleSwitch: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audio':
        return (
          <div className="space-y-6">
            <SliderInput
              label="Ana Ses Seviyesi"
              value={settings.masterVolume}
              onChange={(value) => updateSetting('masterVolume', value)}
            />
            <SliderInput
              label="Müzik Seviyesi"
              value={settings.musicVolume}
              onChange={(value) => updateSetting('musicVolume', value)}
            />
            <ToggleSwitch
              label="Ses Efektleri"
              description="Oyun içi ses efektlerini açar/kapatır"
              checked={settings.soundEffects}
              onChange={(checked) => updateSetting('soundEffects', checked)}
            />
            <ToggleSwitch
              label="Arka Plan Müziği"
              description="Oyun müziğini açar/kapatır"
              checked={settings.musicEnabled}
              onChange={(checked) => updateSetting('musicEnabled', checked)}
            />
            <ToggleSwitch
              label="Konuşmacı Sesi"
              description="Sayı çekilirken sesli anons"
              checked={settings.announcerVoice}
              onChange={(checked) => updateSetting('announcerVoice', checked)}
            />
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <SelectInput
              label="Tema"
              value={settings.theme}
              options={[
                { value: 'light', label: 'Açık Tema' },
                { value: 'dark', label: 'Koyu Tema' },
                { value: 'auto', label: 'Sistem Ayarı' },
              ]}
              onChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'auto')}
            />
            <SelectInput
              label="Dil"
              value={settings.language}
              options={[
                { value: 'tr', label: 'Türkçe' },
                { value: 'en', label: 'English' },
              ]}
              onChange={(value) => updateSetting('language', value as 'tr' | 'en')}
            />
            <SelectInput
              label="Yazı Boyutu"
              value={settings.fontSize}
              options={[
                { value: 'small', label: 'Küçük' },
                { value: 'medium', label: 'Orta' },
                { value: 'large', label: 'Büyük' },
              ]}
              onChange={(value) => updateSetting('fontSize', value as 'small' | 'medium' | 'large')}
            />
            <ToggleSwitch
              label="Animasyonlar"
              description="Görsel animasyonları açar/kapatır"
              checked={settings.animations}
              onChange={(checked) => updateSetting('animations', checked)}
            />
            <ToggleSwitch
              label="Azaltılmış Hareket"
              description="Hareket hassasiyeti olan kullanıcılar için"
              checked={settings.reducedMotion}
              onChange={(checked) => updateSetting('reducedMotion', checked)}
            />
          </div>
        );

      case 'game':
        return (
          <div className="space-y-6">
            <ToggleSwitch
              label="Otomatik Sayı İşaretleme"
              description="Çekilen sayıları otomatik olarak işaretle"
              checked={settings.autoMarkNumbers}
              onChange={(checked) => updateSetting('autoMarkNumbers', checked)}
            />
            <ToggleSwitch
              label="Rakip İlerlemesini Göster"
              description="Diğer oyuncuların ilerlemesini görüntüle"
              checked={settings.showOpponentProgress}
              onChange={(checked) => updateSetting('showOpponentProgress', checked)}
            />
            <ToggleSwitch
              label="Oyun Bildirimleri"
              description="Oyun durumu ile ilgili bildirimler"
              checked={settings.gameNotifications}
              onChange={(checked) => updateSetting('gameNotifications', checked)}
            />
            <ToggleSwitch
              label="Hızlı Oyun"
              description="Bekleme sürelerini azalt"
              checked={settings.quickPlay}
              onChange={(checked) => updateSetting('quickPlay', checked)}
            />
            <ToggleSwitch
              label="Eylem Onayları"
              description="Önemli eylemleri onaylamak için sor"
              checked={settings.confirmActions}
              onChange={(checked) => updateSetting('confirmActions', checked)}
            />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <ToggleSwitch
              label="Push Bildirimleri"
              description="Tarayıcı bildirimleri"
              checked={settings.pushNotifications}
              onChange={(checked) => updateSetting('pushNotifications', checked)}
            />
            <ToggleSwitch
              label="Oyun Davetleri"
              description="Oyun davet bildirimlerini al"
              checked={settings.gameInvites}
              onChange={(checked) => updateSetting('gameInvites', checked)}
            />
            <ToggleSwitch
              label="Başarım Uyarıları"
              description="Yeni başarımlar için bildirim"
              checked={settings.achievementAlerts}
              onChange={(checked) => updateSetting('achievementAlerts', checked)}
            />
            <ToggleSwitch
              label="Chat Bahsetmeleri"
              description="Sohbette bahsedildiğinde bildir"
              checked={settings.chatMentions}
              onChange={(checked) => updateSetting('chatMentions', checked)}
            />
            <ToggleSwitch
              label="E-posta Bildirimleri"
              description="Önemli güncellemeler için e-posta"
              checked={settings.emailNotifications}
              onChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <ToggleSwitch
              label="Profil Görünürlüğü"
              description="Profilini diğer oyunculara göster"
              checked={settings.profileVisible}
              onChange={(checked) => updateSetting('profileVisible', checked)}
            />
            <ToggleSwitch
              label="Çevrimiçi Durumu"
              description="Çevrimiçi olduğunu göster"
              checked={settings.showOnlineStatus}
              onChange={(checked) => updateSetting('showOnlineStatus', checked)}
            />
            <ToggleSwitch
              label="Arkadaşlık İstekleri"
              description="Arkadaşlık isteklerini kabul et"
              checked={settings.allowFriendRequests}
              onChange={(checked) => updateSetting('allowFriendRequests', checked)}
            />
            <ToggleSwitch
              label="İstatistikler Herkese Açık"
              description="Oyun istatistiklerini herkes görebilir"
              checked={settings.statisticsPublic}
              onChange={(checked) => updateSetting('statisticsPublic', checked)}
            />
          </div>
        );

      case 'other':
        return (
          <div className="space-y-6">
            <ToggleSwitch
              label="Titreşim"
              description="Mobil cihazlarda titreşim geri bildirimi"
              checked={settings.vibration}
              onChange={(checked) => updateSetting('vibration', checked)}
            />
            <ToggleSwitch
              label="Otomatik Yeniden Bağlanma"
              description="Bağlantı kesildiğinde otomatik bağlan"
              checked={settings.autoReconnect}
              onChange={(checked) => updateSetting('autoReconnect', checked)}
            />
            <ToggleSwitch
              label="Veri Sıkıştırma"
              description="Daha az veri kullanımı için"
              checked={settings.dataCompression}
              onChange={(checked) => updateSetting('dataCompression', checked)}
            />
            <ToggleSwitch
              label="Çevrimdışı Mod"
              description="Çevrimdışı oynanabilir özellikler"
              checked={settings.offlineMode}
              onChange={(checked) => updateSetting('offlineMode', checked)}
            />
            
            <div className="border-t pt-6 dark:border-gray-700">
              <div className="space-y-4">
                <button
                  onClick={() => setShowImportExport(!showImportExport)}
                  className="btn-secondary w-full"
                >
                  İçe/Dışa Aktarma
                </button>
                
                {showImportExport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <button
                      onClick={handleExport}
                      className="btn-secondary w-full text-sm"
                    >
                      Ayarları Panoya Kopyala
                    </button>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Ayarları buraya yapıştırın..."
                      className="w-full h-20 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      className="btn-primary w-full text-sm disabled:opacity-50"
                    >
                      Ayarları İçe Aktar
                    </button>
                  </motion.div>
                )}
                
                <button
                  onClick={() => {
                    if (confirm('Tüm ayarları sıfırlamak istediğinizden emin misiniz?')) {
                      resetSettings();
                    }
                  }}
                  className="btn-danger w-full"
                >
                  Tüm Ayarları Sıfırla
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h2 className="text-xl font-bold text-white">
                Ayarlar
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto">
                <div className="p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 