import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  first_game: '🏆',     // İlk oyun
  five_games: '🎯',     // 5 oyun tamamlandı
  ten_games: '🎮',      // 10 oyun tamamlandı
  score_100: '⭐',      // 100 puan
  score_200: '💫',      // 200 puan
  score_500: '🔥',      // 500 puan
};

const colorMap = {
  first_game: 'from-yellow-400 to-orange-500',
  five_games: 'from-blue-400 to-indigo-500',
  ten_games: 'from-green-400 to-emerald-500',
  score_100: 'from-purple-400 to-pink-500',
  score_200: 'from-indigo-400 to-purple-500',
  score_500: 'from-red-400 to-orange-500',
};

/**
 * Modern Achievement Modal Component
 */
export default function AchievementModal({ 
  open, 
  achievements, 
  onClose 
}: { 
  open: boolean; 
  achievements: Array<{ id: string; title: string; description?: string }>; 
  onClose: () => void; 
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex-center safe-area-inset">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
              <div className="flex-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <h2 className="text-xl font-bold">Başarımlarınız</h2>
                    <p className="text-primary-200 text-sm">{achievements.length} başarı elde edildi</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex-center text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">😴</div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Henüz başarı yok</h3>
                  <p className="text-gray-500">Oyun oynayarak başarılar kazanabilirsiniz!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className={`card-modern p-4 bg-gradient-to-br ${colorMap[achievement.id] || 'from-gray-400 to-gray-500'} text-white text-center transform hover:scale-105 transition-all duration-200`}>
                        {/* Achievement Icon */}
                        <div className="text-4xl mb-3">
                          {iconMap[achievement.id] || '🎖️'}
                        </div>
                        
                        {/* Achievement Title */}
                        <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                        
                        {/* Achievement Description */}
                        {achievement.description && (
                          <p className="text-sm opacity-90">{achievement.description}</p>
                        )}
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:-translate-x-full"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <button 
                onClick={onClose}
                className="btn-primary w-full"
              >
                <span>👍</span>
                Harika!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 