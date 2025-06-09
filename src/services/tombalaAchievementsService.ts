import { collection, doc, setDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Kullanıcıya ait rozet kazandırma (achievement unlock) - QuickBingo
 */
export async function unlockQuickBingoAchievement(userId: string, achievement: { id: string; title: string }) {
  const achRef = doc(db, 'users', userId, 'quickbingoAchievements', achievement.id);
  await setDoc(achRef, {
    title: achievement.title,
    unlockedAt: serverTimestamp(),
  });
}

/**
 * Kullanıcının tüm QuickBingo rozetlerini (başarımlarını) getirir
 */
export async function getUserQuickBingoAchievements(userId: string): Promise<Array<{ id: string; title: string; unlockedAt: any }>> {
  const achQ = query(collection(db, 'users', userId, 'quickbingoAchievements'));
  const snap = await getDocs(achQ);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return { id: docSnap.id, title: data.title as string, unlockedAt: data.unlockedAt };
  });
}

// Geriye uyumluluk için eski fonksiyon adlarını tutuyoruz
export const unlockTombalaAchievement = unlockQuickBingoAchievement;
export const getUserTombalaAchievements = getUserQuickBingoAchievements; 