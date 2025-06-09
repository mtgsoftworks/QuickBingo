/**
 * src/components/Game/BingoCard.tsx: Kullanıcıya ait QuickBingo kartını gösteren bileşen.
 * Kart üzerindeki numaraları 5x5 ızgara şeklinde düzenler ve kullanıcının etkileşimlerini yönetir.
 * Çekilen numaraları vurgular, işaretlenen numaraları takip eder.
 * Duyarlı tasarım ve erişilebilirlik özellikleri içerir.
 *
 * @param {object} props - Kart bilgisi ve işaretli numaralar.
 * @returns {JSX.Element} QuickBingo kartı arayüzü.
 */

// React ve hook'lar: component, state yönetimi, yan etki ve ref kullanımı
import React, { useState, useEffect, useRef } from 'react';
// Box, Paper: Material UI düzen ve yüzey bileşenleri
import { Box, Paper } from '@mui/material';

// BingoCardProps: kart numaraları ve işaretli hücrelerin tiplerini tanımlar
interface BingoCardProps {
  numbers: number[]; // Kart üzerindeki tüm numaralar
  drawnNumbers: Set<number>; // Çekilmiş numaralar
  initialMarkedNumbers?: Set<number>; // Başlangıçta işaretli olan numaralar
  isPlayerCard?: boolean; // Oyuncu kartı mı?
  onMarkNumber?: (number: number, isMarking: boolean) => void; // Numara işaretleme callback'i
}

// BingoCard: QuickBingo kartını render eden, işaretleme ve vurgulamayı yöneten bileşen
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
  }, [drawnNumbers]);

  // Bileşen unmount olduğunda tüm zamanlayıcıları temizler
  useEffect(() => () => {
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
  }, []);

  // handleNumberClick: hücre tıklandığında işaretleme callback'ini tetikler
  const handleNumberClick = (number: number) => {
    if (!isPlayerCard || !onMarkNumber) return; // Sadece oyuncu kartı için tıklatma izni ver

    const isCurrentlyMarked = markedNumbers.has(number);
    onMarkNumber(number, !isCurrentlyMarked);
  };

  // getCellStyle: numaraya göre hücre stilini seçer (işaretli, vurgulu, normal)
  const getCellStyle = (number: number) => {
    const isPending = pendingNumbers.has(number);
    const isMarked = markedNumbers.has(number);
    
    return {
      cursor: isPlayerCard ? 'pointer' : 'default',
      backgroundColor: isMarked ? '#4caf50' : isPending ? '#bbdefb' : 'white',
      color: isMarked ? 'white' : 'black',
      fontWeight: isPending ? 'bold' : 'normal',
      borderRadius: '8px', // Daha yuvarlak köşeler mobile için
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      aspectRatio: '1/1',
      boxShadow: isPending ? '0 0 0 2px #2196f3 inset' : 'none',
      transition: 'all 0.2s ease',
      minHeight: '44px', // Touch target minimum boyutu
      minWidth: '44px',
      touchAction: 'manipulation', // Better touch handling
      userSelect: 'none', // Prevent text selection
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent', // Remove blue highlight on mobile
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }, // Responsive font size
      '&:hover': {
        opacity: isPlayerCard ? 0.9 : 1,
        transform: isPlayerCard ? 'scale(1.05)' : 'none',
      },
      '&:active': isPlayerCard ? {
        transform: 'scale(0.95)', // Touch feedback
        transition: 'transform 0.1s ease',
      } : {}
    };
  };

  // Kart hücrelerini grid şeklinde render eder
  return (
    <Paper 
      sx={{ 
        p: { xs: 1, sm: 2 }, // Responsive padding
        height: '100%',
        maxWidth: '100%',
        overflow: 'hidden' // Prevent overflow on small screens
      }}
    >
      <Box
        className="bingo-grid" // Add class for potential CSS targeting
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: { xs: 0.5, sm: 1 }, // Responsive gap
          width: '100%',
          height: '100%',
          maxWidth: '400px', // Limit max size for large screens
          margin: '0 auto', // Center the grid
          aspectRatio: '1/1' // Keep grid square
        }}
      >
        {numbers.map((number, index) => (
          <Box
            key={`${number}-${index}`}
            className="bingo-cell" // Add class for CSS targeting
            sx={getCellStyle(number)}
            onClick={() => handleNumberClick(number)}
            // Add touch event handlers for better mobile experience
            onTouchStart={(e) => {
              if (isPlayerCard) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onTouchEnd={(e) => {
              if (isPlayerCard) {
                e.currentTarget.style.transform = '';
              }
            }}
            // Accessibility improvements
            role="button"
            tabIndex={isPlayerCard ? 0 : -1}
            aria-label={`Number ${number}${isMarked ? ', marked' : ''}${drawnNumbers.has(number) ? ', drawn' : ''}`}
          >
            {number}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default BingoCard; 