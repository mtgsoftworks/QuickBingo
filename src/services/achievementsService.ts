import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Firestore'da achievement ilerlemesini günceller
 */
export async function updateAchievementProgress(
  userId: string,
  game: string,
  achievementId: string,
  progress: number,
  target: number
) {
  const ref = doc(db, 'achievementsProgress', `${userId}_${game}_${achievementId}`);
  const unlocked = progress >= target;
  await setDoc(
    ref,
    { userId, game, achievementId, progress, target, unlocked, updatedAt: serverTimestamp() },
    { merge: true }
  );
} 