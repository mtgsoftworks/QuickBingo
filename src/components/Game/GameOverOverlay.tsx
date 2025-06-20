/**
 * src/components/Game/GameOverOverlay.tsx: Oyun bittiğinde ekrana gelen sonuç ve bildirim arayüzü bileşeni.
 * Kazananı, kaybedeni ve oyun sonu seçeneklerini gösterir.
 *
 * @param {object} props - Oyun sonucu, kazanan ve kullanıcıya özel mesajlar.
 * @returns {JSX.Element} Oyun sonu arayüzü.
 */

import React from 'react'; // React: JSX desteği için
import { Typography } from '@mui/material'; // Typography: metin göstermek için UI bileşeni
import { motion } from 'framer-motion'; // motion: animasyonlu elementler için
import { useTranslation } from 'react-i18next'; // useTranslation: çoklu dil desteği için Hook

// GameOverOverlayProps: oyun sonucu, kazanan ve geri sayım süresi için prop tipleri
interface GameOverOverlayProps {
  winnerName: string | null | undefined;
  isWinner: boolean;
  countdownSeconds: number;
};

// Modern mobile game over overlay
const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ winnerName, isWinner, countdownSeconds }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex-center z-50 safe-area-inset"
    >
      {/* Confetti Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 ${isWinner ? 'bg-yellow-400' : 'bg-gray-400'} rounded-full`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -10,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: window.innerHeight + 10,
              rotate: 360,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.5, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        className="container-mobile text-center relative z-10"
      >
        <div className="card-modern p-8 bg-white bg-opacity-95 backdrop-blur-sm">
          {/* Winner/Loser Icon */}
          <div className="text-8xl mb-6">
            {isWinner ? '🏆' : '😔'}
          </div>

          {/* Main Message */}
          <h1 className={`text-4xl font-bold mb-4 ${
            isWinner ? 'text-success-600' : 'text-error-600'
          }`}>
            {isWinner ? t('youWon') : t('youLost')}
          </h1>

          {/* Winner Info */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">{t('winnerIs')}:</p>
            <p className="text-2xl font-bold text-primary-600">
              {winnerName || 'N/A'}
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-gray-700">
                {`${t('redirecting')} ${countdownSeconds}s...`}
              </p>
            </div>
          </div>

          {/* Achievement-style Badge */}
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring', stiffness: 300 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold"
            >
              <span>⭐</span>
              <span>Kazanan!</span>
              <span>⭐</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverOverlay;