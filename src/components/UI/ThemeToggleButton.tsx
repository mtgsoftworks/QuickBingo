import React, { useState } from 'react';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import { useTranslation } from 'react-i18next';

// Modern Theme Toggle Button Component
const ThemeToggleButton: React.FC = () => {
  const { mode, toggleThemeMode } = useThemeMode();
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleThemeMode();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 flex-center group"
      title={t(mode === 'dark' ? 'switchToLight' : 'switchToDark')}
    >
      {/* Icon Container with Animation */}
      <div className={`relative transition-transform duration-300 ${isAnimating ? 'scale-0' : 'scale-100'}`}>
        {mode === 'dark' ? (
          // Sun Icon for Light Mode
          <div className="relative">
            <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
            {/* Sun rays */}
            <div className="absolute inset-0">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute w-0.5 h-2 bg-yellow-400 rounded-full"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-8px)`,
                    transformOrigin: 'center 8px'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Moon Icon for Dark Mode
          <div className="relative w-5 h-5">
            <div className="w-5 h-5 bg-white rounded-full"></div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-gray-800 rounded-full transform translate-x-0.5 -translate-y-0.5"></div>
          </div>
        )}
      </div>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transform scale-0 group-active:scale-100 transition-all duration-150"></div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {t(mode === 'dark' ? 'switchToLight' : 'switchToDark')}
      </div>
    </button>
  );
};

export default ThemeToggleButton;