/**
 * src/components/Game/NumberDraw.tsx: Tombala oyununda çekilen sayıları ve animasyonunu gösteren bileşen.
 * Son çekilen numarayı ve geçmiş çekilişleri kullanıcıya sunar.
 *
 * @param {object} props - Çekilen numaralar ve animasyon kontrolü.
 * @returns {JSX.Element} Çekiliş animasyonu ve numara arayüzü.
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// NumberDrawProps arayüzü: Çekilen numaraların tipini tanımlar
interface NumberDrawProps {
  drawnNumbers: number[] | undefined; // Çekilmiş numaralar dizisi
}

// Modern mobile-optimized NumberDraw component
const NumberDraw: React.FC<NumberDrawProps> = ({ drawnNumbers }) => {
  const { t } = useTranslation();
  const numbers = drawnNumbers || [];
  const lastDrawnNumber = numbers.length > 0 ? numbers[numbers.length - 1] : null;
  const history = numbers.join(', ');
  const count = numbers.length;
  const progressPercentage = (count / 90) * 100;

  return (
    <div className="card-modern p-6 min-h-[300px] flex flex-col items-center w-full bg-gradient-to-br from-white to-gray-50">
      {/* Header with Progress */}
      <div className="w-full mb-6">
        <div className="flex-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">{t('drawnNumbersTitle')}</h3>
          <div className="text-sm font-medium text-gray-600">
            {count}/90
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main Number Display */}
      <div className="flex-1 flex-center w-full">
        {lastDrawnNumber !== null ? (
          <motion.div
            key={lastDrawnNumber}
            initial={{ scale: 0.5, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary-500 rounded-full opacity-20 animate-pulse scale-110"></div>
            
            {/* Main Number Circle */}
            <div className="relative w-32 h-32 rounded-full border-4 border-primary-500 flex-center bg-white shadow-xl">
              <span className="text-4xl font-bold text-primary-600">
                {lastDrawnNumber}
              </span>
            </div>
            
            {/* Floating Animation Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary-300 opacity-30 animate-ping"></div>
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex-center mb-4">
              <span className="text-gray-400 text-2xl">?</span>
            </div>
            <p className="text-gray-500 font-medium">{t('noNumbersDrawn')}</p>
          </div>
        )}
      </div>

      {/* Recent Numbers Grid */}
      {numbers.length > 1 && (
        <div className="w-full mt-6">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Son Çekilen Numaralar</h4>
          <div className="flex flex-wrap gap-2 justify-center max-h-20 overflow-y-auto">
            {numbers.slice(-10).reverse().slice(1).map((num, index) => (
              <div
                key={`${num}-${index}`}
                className="w-8 h-8 rounded-lg bg-gray-100 flex-center text-sm font-medium text-gray-700 border border-gray-200"
              >
                {num}
              </div>
            ))}
            {numbers.length > 11 && (
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex-center text-xs text-gray-400 border border-gray-200">
                +{numbers.length - 11}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="w-full mt-4 pt-4 border-t border-gray-200">
        <div className="flex-between text-xs text-gray-500">
          <span>İlerleme: {Math.round(progressPercentage)}%</span>
          <span>Kalan: {90 - count}</span>
        </div>
      </div>
    </div>
  );
};

export default NumberDraw; 