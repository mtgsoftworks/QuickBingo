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

  // getCellStyle: numaraya göre hücre stilini seçer (işaretli, vurgulu, normal)
  const getCellStyle = (number: number) => {
    const isPending = pendingNumbers.has(number);
    const isMarked = markedNumbers.has(number);
    
    return {
      cursor: isPlayerCard ? 'pointer' : 'default',
      backgroundColor: isMarked ? '#4caf50' : isPending ? '#bbdefb' : 'white',
      color: isMarked ? 'white' : 'black',
      fontWeight: isPending ? 'bold' : 'normal',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      aspectRatio: '1/1', // Kare hücreler oluşturur
      boxShadow: isPending ? '0 0 0 2px #2196f3 inset' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        opacity: isPlayerCard ? 0.9 : 1,
        transform: isPlayerCard ? 'scale(1.05)' : 'none',
      }
    };
  };

  // Kart hücrelerini grid şeklinde render eder
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)', // 5 eşit sütun oluştur
          gap: 1,
          width: '100%',
          height: '100%'
        }}
      >
        {numbers.map((number, index) => (
          <Box
            key={`${number}-${index}`}
            sx={getCellStyle(number)}
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default BingoCard; 