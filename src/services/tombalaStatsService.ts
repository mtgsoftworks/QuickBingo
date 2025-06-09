import { collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * QuickBingo oyunu için istatistik gönder
 */
export async function postQuickBingoStats({ userId, score, cardsMatched = 0, duration = 0, success = false }: { userId: string; score: number; cardsMatched?: number; duration?: number; success?: boolean }) {
  try {
    const colRef = collection(db, 'quickbingoStats');
    await addDoc(colRef, {
      userId,
      score,
      cardsMatched,
      duration,
      success,
      timestamp: new Date(),
      gameType: 'quickbingo'
    });
    console.log('QuickBingo stats posted successfully');
  } catch (error) {
    console.error('Error posting QuickBingo stats:', error);
    throw error;
  }
}

/**
 * QuickBingo leaderboard (en yüksek skor) getirir
 */
export async function getQuickBingoLeaderboard() {
  const q = query(
    collection(db, 'quickbingoStats'),
    orderBy('score', 'desc'),
    limit(10)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      score: data.score,
      cardsMatched: data.cardsMatched || 0,
      duration: data.duration || 0,
      success: data.success || false,
      timestamp: data.timestamp,
      gameType: data.gameType || 'quickbingo'
    };
  });
}

/**
 * QuickBingo achievements: kullanıcıya ait kazanılan başarımları hesaplar
 */
export async function getQuickBingoAchievements(userId: string) {
  const achievements = [];
  const stats = await getQuickBingoStats(userId);
  
  const gamesPlayed = stats.length;
  const scores = stats.map(s => s.score || 0);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  
  if (gamesPlayed >= 1) {
    const now = new Date();
    achievements.push({ id: 'first_game', title: 'İlk QuickBingo Oyunu', description: 'İlk oyunu tamamla', unlockedAt: now });
  }
  if (gamesPlayed >= 5) {
    const now = new Date();
    achievements.push({ id: 'five_games', title: '5 QuickBingo Oyunu', description: '5 oyunu tamamla', unlockedAt: now });
  }
  if (gamesPlayed >= 10) {
    const now = new Date();
    achievements.push({ id: 'ten_games', title: '10 QuickBingo Oyunu', description: '10 oyunu tamamla', unlockedAt: now });
  }
  if (maxScore >= 100) {
    const now = new Date();
    achievements.push({ id: 'score_100', title: '100+ Skor', description: '100 veya daha yüksek skor al', unlockedAt: now });
  }
  if (maxScore >= 200) {
    const now = new Date();
    achievements.push({ id: 'score_200', title: '200+ Skor', description: '200 veya daha yüksek skor al', unlockedAt: now });
  }
  
  return achievements;
}

/**
 * Kullanıcıya ait QuickBingo istatistiklerini getirir
 */
export async function getQuickBingoStats(userId: string): Promise<Array<any>> {
  const q = query(
    collection(db, 'quickbingoStats'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Geriye uyumluluk için eski fonksiyon adlarını tutuyoruz
export const postTombalaStats = postQuickBingoStats;
export const getTombalaLeaderboard = getQuickBingoLeaderboard;
export const getTombalaAchievements = getQuickBingoAchievements;
export const getTombalaStats = getQuickBingoStats; 