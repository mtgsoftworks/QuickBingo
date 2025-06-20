/**
 * src/components/Game/AudioControls.tsx: Oyun sırasında ses efektlerini ve müziği yönetmek için kontrolleri sunan bileşen.
 * Kullanıcı sesi açıp kapatabilir, ses seviyesini ayarlayabilir.
 *
 * @returns {JSX.Element} Ses kontrol arayüzü.
 */
import React, { useState } from 'react';
// React: JSX desteği, useState: bileşen durumu yönetmek için hook
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
// Volume* ikonları: ses durumuna göre gösterilecek ikonlar

interface AudioControlsProps {
  isMuted: boolean;
  onToggle: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ 
  isMuted, 
  onToggle,
  volume = 0.5,
  onVolumeChange
}) => {
  // showVolumeControl: ses kontrol kaydırıcısını göster/gizle durumu
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // handleVolumeClick: ses kontrolleri arayüzünü aç/kapa
  const handleVolumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeControl(!showVolumeControl);
  };

  // handleVolumeChange: kaydırıcı değeri değiştiğinde sesi güncelle
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  // getVolumeIcon: sessiz/mute ve ses seviyesine göre uygun ikon seçimi
  const getVolumeIcon = () => {
    if (isMuted) return <VolumeX className="w-6 h-6 text-gray-600" />;
    if (volume < 0.5) return <Volume1 className="w-6 h-6 text-indigo-600" />;
    return <Volume2 className="w-6 h-6 text-indigo-600" />;
  };

  return (
    // Modern mobile audio controls
    <div className="fixed bottom-20 right-6 flex flex-col items-end z-40">
      {showVolumeControl && (
        <div className="card-modern p-4 mb-3 bg-white shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Ses</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary-500) 0%, var(--color-primary-500) ${volume * 100}%, var(--color-gray-300) ${volume * 100}%, var(--color-gray-300) 100%)`
              }}
            />
            <span className="text-xs text-gray-500 min-w-[3ch]">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
      
      <button
        onClick={(e) => {
          if (onVolumeChange) {
            handleVolumeClick(e);
          } else {
            onToggle();
          }
        }}
        onDoubleClick={onToggle}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex-center ${
          isMuted 
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
            : 'bg-white text-primary-600 hover:bg-primary-50 hover:scale-105'
        }`}
        title={isMuted ? "Sessiz mod kaldır" : "Ses ayarla veya çift tıkla sessize al"}
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};

export default AudioControls;