/**
 * src/components/Game/BingoCard.tsx: Kullanıcıya ait tombala kartını gösteren bileşen.
 * Kart üzerindeki numaraları ve işaretlenmiş haneleri yönetir ve gösterir.
 * Mobile platformlarda haptic feedback sağlar.
 *
 * @param {object} props - Kart bilgisi ve işaretli numaralar.
 * @returns {JSX.Element} Tombala kartı arayüzü.
 */

// React ve hook'lar: component, state yönetimi, yan etki ve ref kullanımı
import React, { useState, useEffect, useRef } from 'react';
// Box, Paper: Material UI düzen ve yüzey bileşenleri
import { Box, Paper } from '@mui/material';
// Mobile özellikler hook'u
import { useMobileFeatures } from '../../hooks/useMobileFeatures';

// BingoCardProps: kart numaraları ve işaretli hücrelerin tiplerini tanımlar
interface BingoCardProps {
  numbers: number[]; // Kart üzerindeki tüm numaralar
  drawnNumbers: Set<number>; // Çekilmiş numaralar
  initialMarkedNumbers?: Set<number>; // Başlangıçta işaretli olan numaralar
  isPlayerCard?: boolean; // Oyuncu kartı mı?
  onMarkNumber?: (number: number, isMarking: boolean) => void; // Numara işaretleme callback'i
}

// BingoCard: tombala kartını render eden, işaretleme ve vurgulamayı yöneten bileşen
const BingoCard: React.FC<BingoCardProps> = ({ 
  numbers, 
  drawnNumbers, 
  initialMarkedNumbers = new Set(), 
  isPlayerCard = false,
  onMarkNumber
}) => {
  // markedNumbers: kullanıcının işaretlediği numaraların set'i
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(initialMarkedNumbers);

  // pendingNumbers: yeni çekilen numaraları geçici vurgulamak için set
  const [pendingNumbers, setPendingNumbers] = useState<Set<number>>(new Set());
  // previousDrawnRef: önceki drawnNumbers set'ini saklar
  const previousDrawnRef = useRef<Set<number>>(new Set());
  // pendingTimersRef: her numara için vurgulama zamanlayıcılarını saklar
  const pendingTimersRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Mobile features hook
  const { hapticFeedback } = useMobileFeatures();

  // initialMarkedNumbers değiştiğinde markedNumbers state'ini günceller
  useEffect(() => {
    setMarkedNumbers(initialMarkedNumbers);
  }, [initialMarkedNumbers]);

  // numbers prop değiştiğinde pending highlight ve timerları sıfırla
  useEffect(() => {
    // Clear pending highlights
    setPendingNumbers(new Set());
    // Clear all pending timers
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
    pendingTimersRef.current = {};
    // Reset previous drawn ref to avoid stale comparison
    previousDrawnRef.current = new Set();
  }, [numbers]);

  // drawnNumbers değiştiğinde yeni eklenen numaraları 5 saniye vurgular
  useEffect(() => {
    const newSet = new Set(drawnNumbers);
    const added = Array.from(newSet).filter(n => !previousDrawnRef.current.has(n));
    
    if (added.length > 0) {
      // Yeni numara çekildiğinde haptic feedback
      hapticFeedback.light();
    }
    
    added.forEach(n => {
      setPendingNumbers(prev => new Set(prev).add(n));
      pendingTimersRef.current[n] = setTimeout(() => {
        setPendingNumbers(prev => {
          const copy = new Set(prev);
          copy.delete(n);
          return copy;
        });
        delete pendingTimersRef.current[n];
      }, 5000);
    });
    previousDrawnRef.current = newSet;
  }, [drawnNumbers, hapticFeedback]);

  // Bileşen unmount olduğunda tüm zamanlayıcıları temizler
  useEffect(() => () => {
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
  }, []);

  // handleNumberClick: hücre tıklandığında işaretleme callback'ini tetikler
  const handleNumberClick = (number: number) => {
    if (!isPlayerCard || !onMarkNumber) return; // Sadece oyuncu kartı için tıklatma izni ver

    const isCurrentlyMarked = markedNumbers.has(number);
    
    // Haptic feedback - işaretleme/kaldırma için farklı intensiteler
    if (isCurrentlyMarked) {
      hapticFeedback.light(); // İşaret kaldırma için hafif titreşim
    } else {
      hapticFeedback.medium(); // İşaretleme için orta titreşim
    }
    
    onMarkNumber(number, !isCurrentlyMarked);
  };

  // getCellClass: numaraya göre hücre CSS sınıfını seçer (işaretli, vurgulu, normal)
  const getCellClass = (number: number) => {
    const isPending = pendingNumbers.has(number);
    const isMarked = markedNumbers.has(number);
    
    let baseClass = "aspect-square flex-center rounded-lg font-semibold text-lg transition-all duration-200 border-2 touch-target";
    
    if (isMarked) {
      baseClass += " bg-success-500 text-white border-success-600 shadow-md";
    } else if (isPending) {
      baseClass += " bg-primary-100 text-primary-700 border-primary-300 font-bold animate-pulse shadow-lg ring-2 ring-primary-500 ring-opacity-50";
    } else {
      baseClass += " bg-white text-gray-800 border-gray-200 hover:border-gray-300";
    }
    
    if (isPlayerCard) {
      baseClass += " cursor-pointer hover:scale-105 hover:shadow-md active:scale-95";
    }
    
    return baseClass;
  };

  // Modern mobile-optimized bingo card
  return (
    <div className="card-modern p-4 h-full bg-gradient-to-br from-white to-gray-50">
      {/* Card Header */}
      <div className="flex-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-600">
            {isPlayerCard ? 'Kartınız' : 'Rakip Kartı'}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {Array.from(markedNumbers).length}/25
        </div>
      </div>
      
      {/* Numbers Grid */}
      <div className="grid grid-cols-5 gap-2 w-full h-full">
        {numbers.map((number, index) => (
          <button
            key={`${number}-${index}`}
            className={getCellClass(number)}
            onClick={() => handleNumberClick(number)}
            disabled={!isPlayerCard}
            style={{
              minHeight: 'var(--touch-target-min)',
              fontSize: 'clamp(14px, 4vw, 18px)' // Responsive font size
            }}
          >
            {number}
          </button>
        ))}
      </div>
      
      {/* Card Footer - Progress Indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-300 rounded-full"
            style={{ width: `${(Array.from(markedNumbers).length / 25) * 100}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {Math.round((Array.from(markedNumbers).length / 25) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default BingoCard; 