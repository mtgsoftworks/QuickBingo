/**
 * src/components/Game/GameScreen.tsx: Tombala oyun ekranı ana bileşeni.
 * Oyun odasına ait Firestore verisini dinler ve oyunun akışını yönetir.
 * Kart oluşturma, çekilen numaralar, oyuncu bağlantı durumu ve kazanan kontrolünü içerir.
 * Gerçek zamanlı güncellemeler ve çoklu oyuncu desteği sunar.
 * Kullanıcıya bildirim, ses efektleri ve çoklu dil desteği sağlar.
 *
 * @returns {JSX.Element} Tombala oyun ekranı arayüzü.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Drawer,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Stack
} from '@mui/material';
import {
  doc,
  onSnapshot,
  updateDoc,
  runTransaction,
  UpdateData,
  DocumentData,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSoundEffects } from '../../contexts/SoundContext';
import { generateBingoCardNumbers, checkBingoWin, checkForWinner } from '../../utils/gameUtils';
import BingoCard from './BingoCard';
import NumberDraw from './NumberDraw';
import GameOverOverlay from './GameOverOverlay';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Chat from './Chat';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { postTombalaStats, getTombalaAchievements, getTombalaStats } from '../../services/tombalaStatsService';
import { unlockTombalaAchievement } from '../../services/tombalaAchievementsService';
import { updateAchievementProgress } from '../../services/achievementsService';
import AchievementModal from './AchievementModal';
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import { SettingsModal } from '../UI/SettingsModal';

// Define a type for the game room data
interface GameRoomData extends DocumentData {
  creatorUid: string;
  creatorName: string;
  player2Uid: string | null;
  player2Name: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'stopping' | 'finished';
  createdAt: Timestamp; // Firestore Timestamp
  roomName?: string; // Added: User-defined room name
  player1Card?: number[]; // Added: Card numbers for player 1
  player2Card?: number[]; // Added: Card numbers for player 2
  maxPlayers?: number; // Added: Maximum players
  drawnNumbers?: number[]; // Added: Array of numbers drawn so far
  markedNumbersP1?: number[]; // Added: Numbers marked by player 1 (sync later)
  markedNumbersP2?: number[]; // Added: Numbers marked by player 2 (sync later)
  markedNumbersP3?: number[];
  markedNumbersP4?: number[];
  winner?: string | null; // Added: UID of the winner
  currentTurn?: number; // Added: Index of the current number being drawn (or timestamp)
  player1Connected?: boolean;
  player2Connected?: boolean;
  player3Connected?: boolean;
  player4Connected?: boolean;
  disconnectTimerStart?: Timestamp | null; // Timestamp when a player disconnected
  readyP1?: boolean;
  readyP2?: boolean;
  readyP3?: boolean;
  readyP4?: boolean;
  startDateTime?: Timestamp; // Added: Game start timestamp
  endDateTime?: Timestamp;   // Added: Game end timestamp
  type?: 'normal' | 'event';  // Lobby type
  password?: string;           // Lobby password
  startTime?: Timestamp;       // Event start time
  endTime?: Timestamp;         // Event end time
}

const DISCONNECT_TIMEOUT = 30000; // 30 seconds in milliseconds

const GameScreen: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const { playDrawSound, playWinSound, playClickSound } = useSoundEffects();
  const [gameRoom, setGameRoom] = useState<GameRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false); // State to disable button during draw
  const { t } = useTranslation();
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);
  const [autoDrawInterval, setAutoDrawInterval] = useState<number>(5); // saniye cinsinden otomatik çekim aralığı
  const [penaltyCountdown, setPenaltyCountdown] = useState<number | null>(null);
  const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown for auto-redirect after game end
  const [endCountdown, setEndCountdown] = useState<number | null>(null);
  const endTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to store the previous game state for comparison in useEffect
  const prevGameRoomRef = useRef<GameRoomData | null>(null);

  // Ready status tracking
  const isP3 = currentUser?.uid === gameRoom?.player3Uid;
  const isP4 = currentUser?.uid === gameRoom?.player4Uid;
  const isReady = gameRoom
    ? currentUser?.uid === gameRoom.creatorUid
      ? !!gameRoom.readyP1
      : currentUser?.uid === gameRoom.player2Uid
        ? !!gameRoom.readyP2
        : isP3
          ? !!gameRoom.readyP3
          : !!gameRoom.readyP4
    : false;
  const allReady = gameRoom
    ? Array.from({ length: gameRoom.maxPlayers || 2 }).every((_, idx) =>
        idx === 0 ? !!gameRoom.readyP1 :
        idx === 1 ? !!gameRoom.readyP2 :
        idx === 2 ? !!gameRoom.readyP3 :
        !!gameRoom.readyP4
      )
    : false;

  const [openChat, setOpenChat] = useState(false);
  // Count current players for waiting UI
  const currentPlayersCount = gameRoom
    ? [gameRoom.creatorUid, gameRoom.player2Uid, gameRoom.player3Uid, gameRoom.player4Uid].filter(Boolean).length
    : 0;

  const [lastErrorAction, setLastErrorAction] = useState<(() => void) | null>(null);

  const [achEvaluated, setAchEvaluated] = useState(false);

  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string }>>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleReady = async () => {
    if (!currentUser || !roomId || !gameRoom) return;
    const roomRef = doc(db, 'gameRooms', roomId);
    const field: string | null =
      currentUser.uid === gameRoom.creatorUid ? 'readyP1' :
      currentUser.uid === gameRoom.player2Uid ? 'readyP2' :
      isP3 ? 'readyP3' :
      isP4 ? 'readyP4' : null;
    if (!field) return;
    try {
      await updateDoc(roomRef, { [field]: true });
      showNotification(t('readySuccess'), 'success');
    } catch (err) {
      console.error('Error setting ready status:', err);
      showNotification(t('errorSettingReady'), 'error');
    }
  };

  // useEffect for Notifications and Sounds based on game state changes
  useEffect(() => {
    const prevGameRoom = prevGameRoomRef.current;
    if (!gameRoom) return;

    // Oyun bittiğinde istatistik kaydet ve modal aç
    if (gameRoom.status === 'finished' && prevGameRoom?.status !== 'finished') {
      const matched = currentUser?.uid === gameRoom.creatorUid ? gameRoom.markedNumbersP1?.length || 0
        : currentUser?.uid === gameRoom.player2Uid ? gameRoom.markedNumbersP2?.length || 0
        : currentUser?.uid === gameRoom.player3Uid ? gameRoom.markedNumbersP3?.length || 0
        : gameRoom.markedNumbersP4?.length || 0;
      const durationSec = (gameRoom.startDateTime && gameRoom.endDateTime)
        ? Math.round((gameRoom.endDateTime.toMillis() - gameRoom.startDateTime.toMillis()) / 1000)
        : 0;
      postTombalaStats({ userId: currentUser.uid, score: matched, cardsMatched: matched, duration: durationSec, success: currentUser.uid === gameRoom.winner })
        .then(async () => {
          try {
            const stats = await getTombalaStats(currentUser.uid);
            const count = stats.length;
            const scores = stats.map(s => s.score || 0);
            const maxScore = scores.length ? Math.max(...scores) : 0;
            await updateAchievementProgress(currentUser.uid, 'tombala', 'first_game', count, 1);
            await updateAchievementProgress(currentUser.uid, 'tombala', 'five_games', count, 5);
            await updateAchievementProgress(currentUser.uid, 'tombala', 'ten_games', count, 10);
            await updateAchievementProgress(currentUser.uid, 'tombala', 'score_100', maxScore, 100);
            await updateAchievementProgress(currentUser.uid, 'tombala', 'score_200', maxScore, 200);
          } catch(err) {
            console.error('Error updating achievement progress:', err);
          }
        })
        .catch(err => console.error('Error posting stats:', err));
      if (!achEvaluated) {
        getTombalaAchievements(currentUser.uid)
          .then(list => {
            setAchievements(list);
            list.forEach(a => unlockTombalaAchievement(currentUser.uid, { id: a.id, title: a.title }));
            setAchievementsOpen(true);
          })
          .catch(err => console.error('Error fetching tombala achievements:', err));
        setAchEvaluated(true);
      }
    }

    const isPlaying = gameRoom.status === 'playing';

    // --- Drawn Number Notification/Sound --- 
    if (isPlaying) {
        const prevDrawnCount = prevGameRoom?.drawnNumbers?.length ?? 0;
        const currentDrawnCount = gameRoom.drawnNumbers?.length ?? 0;
        if (currentDrawnCount > prevDrawnCount && gameRoom.drawnNumbers) {
          const lastDrawn = gameRoom.drawnNumbers[gameRoom.drawnNumbers.length - 1];
          showNotification(t('numberDrawn', { number: lastDrawn }), 'info');
          playDrawSound();
        }
    }

    // --- Winner Notification/Sound --- 
    // Check if the status *transitioned* to finished
    if (prevGameRoom?.status !== 'finished' && gameRoom.status === 'finished' && gameRoom.winner) {
        const winnerName = gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name;
        showNotification(t('bingoWinner', { name: winnerName }), 'success');
        playWinSound(); // Play win sound ONLY on transition
    }

    // Update the ref with the current state for the next render
    prevGameRoomRef.current = gameRoom; 

  // Dependencies: only run when gameRoom changes, or sounds/notifications become available
  }, [
    gameRoom?.drawnNumbers?.length,
    gameRoom?.status,
    gameRoom?.winner,
    currentUser?.uid,
    gameRoom?.creatorUid,
    gameRoom?.player2Uid,
    showNotification,
    playDrawSound,
    playWinSound,
    t
  ]); 

  // Rozetleri değerlendirme ve Firestore'a kaydetme
  useEffect(() => {
    if (gameRoom?.status === 'finished' && currentUser && !achEvaluated) {
      setAchEvaluated(true);
      getTombalaAchievements(currentUser.uid)
        .then(list => {
          list.forEach(async ach => {
            await unlockTombalaAchievement(currentUser.uid, { id: ach.id, title: ach.title });
            showNotification(`Yeni rozet kazandınız: ${ach.title}`, 'success');
          });
        })
        .catch(err => console.error('Achievement evaluation error:', err));
    }
  }, [gameRoom?.status, currentUser, achEvaluated, showNotification, t]);

  // Combined useEffect for Firestore listener AND Presence/Disconnect Logic
  useEffect(() => {
    if (!roomId || !currentUser) {
       // Handle cases where roomId or user is not available
        if(!roomId) setError(t('errorNoRoomId'));
        setLoading(false);
        if(!currentUser && !loading) navigate('/login'); // Redirect if not logged in and not loading auth
      return;
    }

    const roomRef = doc(db, 'gameRooms', roomId);
    let isInitiallyConnected = false;

    const unsubscribe = onSnapshot(
      roomRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          setError(t('errorGameRoomNotFound'));
          setGameRoom(null);
          setLoading(false);
          // Clear any running timer if room disappears
          if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
          }
          setDisconnectCountdown(null);
          return;
        }

        const roomData = docSnap.data() as GameRoomData;
        setGameRoom(roomData);
        setError(null);
        setLoading(false);

        // --- Presence Logic ---
        const isP1 = currentUser.uid === roomData.creatorUid;
        const isP2 = currentUser.uid === roomData.player2Uid;
        const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;
        const opponentConnectionField = isP1 ? 'player2Connected' : isP2 ? 'player1Connected' : null;

        // 1. Set my connection status to true (if needed, only once initially)
        if (myConnectionField && !isInitiallyConnected && roomData[myConnectionField] !== true) {
          isInitiallyConnected = true;
          console.log(`Setting ${myConnectionField} to true`);
          try {
            await updateDoc(roomRef, { [myConnectionField]: true });
          } catch(err) {
            console.error("Error setting initial connection status:", err);
          }
        }

        // --- Disconnect Timer Logic (Only applies if player 2 exists) ---
        if (roomData.player2Uid && opponentConnectionField) {
          const opponentIsConnected = roomData[opponentConnectionField];
          const timerStartTime = roomData.disconnectTimerStart; // Firestore Timestamp or null
          const currentStatus = roomData.status;

          // Case 1: Opponent disconnected WHILE PLAYING
          if (currentStatus === 'playing' && !opponentIsConnected && !timerStartTime) {
            console.log('Opponent disconnected during play, entering stopping state...');
            try {
              // Start timer and change status to stopping
              await updateDoc(roomRef, {
                status: 'stopping',
                disconnectTimerStart: serverTimestamp()
              });
              // Local countdown will update based on snapshot with timerStartTime
            } catch(err) {
              console.error("Error starting disconnect timer and setting status to stopping:", err);
            }
          }
          // Case 2: Opponent reconnected WHILE STOPPED
          else if (currentStatus === 'stopping' && opponentIsConnected && timerStartTime) {
            console.log('Opponent reconnected, returning to playing state...');
            if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
            }
            setDisconnectCountdown(null);
            try {
              // Clear timer and return to playing
              await updateDoc(roomRef, {
                status: 'playing',
                disconnectTimerStart: null
              });
            } catch(err) {
              console.error("Error clearing disconnect timer and returning to playing:", err);
            }
          }
          // Case 3: Game is STOPPED and timer is running
          else if (currentStatus === 'stopping' && timerStartTime) {
            const startTime = timerStartTime.toMillis();
            const now = Date.now();
            const elapsed = now - startTime;
            const remaining = Math.max(0, DISCONNECT_TIMEOUT - elapsed);

            setDisconnectCountdown(Math.ceil(remaining / 1000)); // Update local countdown display

            // Clear previous local timer if exists
            if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
            }

            if (remaining <= 0) {
              // Timeout reached!
              console.log('Disconnect timeout reached!');
              setDisconnectCountdown(0);
              // Determine winner (the one still connected)
              const winnerUid = roomData.player1Connected ? roomData.creatorUid : roomData.player2Uid;
              try {
                // Transaction ile kazanan atama
                await runTransaction(db, async (tx) => {
                  const snap2 = await tx.get(roomRef);
                  if (snap2.exists() && snap2.data().status === 'stopping') {
                    tx.update(roomRef, {
                      winner: winnerUid,
                      status: 'finished',
                      disconnectTimerStart: null
                    });
                  } else {
                    console.log("Game status changed before declaring winner via disconnect timeout.");
                  }
                });
                console.log("Opponent didn't return, winner declared.");
              } catch (err) {
                console.error("Error setting winner due to disconnect timeout:", err);
                setError(t('errorDeclaringWinnerDisconnect'));
              }
            } else {
              // Set a new local timer to check again near timeout
              disconnectTimerRef.current = setTimeout(() => {
                console.log('Local disconnect timer check triggered (in stopping state)');
                // Re-trigger state update to re-evaluate time remaining
                setDisconnectCountdown(prev => prev !== null ? Math.max(0, prev - 1) : null);
              }, 1000); // Check every second
            }
          }
          // Case 4: Game is PLAYING and opponent is connected (or other states)
          else if (currentStatus !== 'stopping') {
             // Ensure countdown is cleared if not in stopping state
             if (disconnectCountdown !== null) {
                  console.log('Game not in stopping state, ensuring countdown is null.');
                  setDisconnectCountdown(null);
             }
             if (disconnectTimerRef.current) {
                 clearTimeout(disconnectTimerRef.current);
                 disconnectTimerRef.current = null;
             }
          }
        }
         else { // Game hasn't started, finished, or no player 2 / opponent field
            // Ensure countdown is cleared if state doesn't warrant it
            if (disconnectCountdown !== null) {
                console.log('Game state doesnt warrant countdown, clearing.');
                setDisconnectCountdown(null);
            }
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
                disconnectTimerRef.current = null;
            }
         }

      },
      (err) => {
         // ... (error handling) ...
          console.error('Error fetching game room:', err);
          setError(t('errorLoadGame'));
          setLoading(false);
          showNotification(t('errorLoadGame'), 'error');
      },
    );

    // --- Cleanup Logic --- 
    return () => {
      console.log("GameScreen unmounting or roomId/currentUser changed.");
      unsubscribe(); // Unsubscribe from Firestore listener
        // Clear local timer on unmount
        if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
             disconnectTimerRef.current = null;
        }
        
       // Attempt to set connection status to false on unmount/disconnect
       // This is unreliable, especially on browser close/crash. Firebase Presence is better.
        if (roomId && currentUser && isInitiallyConnected) {
            const isP1 = currentUser.uid === gameRoom?.creatorUid; // Use last known gameRoom state
            const isP2 = currentUser.uid === gameRoom?.player2Uid;
            const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;
             if (myConnectionField) {
                 const roomRefOnUnmount = doc(db, 'gameRooms', roomId);
                 console.log(`Setting ${myConnectionField} to false on unmount`);
                 // Use updateDoc directly - no need for await in cleanup usually
                 updateDoc(roomRefOnUnmount, { [myConnectionField]: false, disconnectTimerStart: null }).catch(err => {
                    console.error("Error setting disconnect status on unmount:", err);
                 });
             }
        }
    };
  // Dependencies now include currentUser to handle login/logout while viewing?
  }, [roomId, navigate, t, showNotification, currentUser, loading, gameRoom?.creatorUid, gameRoom?.player2Uid, disconnectCountdown]);

  // Trigger countdown when game finishes
  useEffect(() => {
    if (gameRoom?.status === 'finished' && gameRoom.winner && endCountdown === null) {
      setEndCountdown(10);
    }
  }, [gameRoom?.status, gameRoom?.winner, endCountdown]);

  // Countdown timer effect
  useEffect(() => {
    if (endCountdown !== null) {
      if (endCountdown <= 0) {
        if (endTimerRef.current) {
          clearTimeout(endTimerRef.current);
          endTimerRef.current = null;
        }
        navigate('/lobby');
      } else {
        endTimerRef.current = setTimeout(() => setEndCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      }
    }
    return () => {
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };
  }, [endCountdown, navigate]);

  // Penalty countdown effect
  useEffect(() => {
    if (penaltyCountdown === null) return;
    if (penaltyCountdown <= 0) {
      setPenaltyCountdown(null);
    } else {
      penaltyTimerRef.current = setTimeout(() => {
        setPenaltyCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    }
    return () => {
      if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);
    };
  }, [penaltyCountdown]);

  const handleStartGame = async () => {
    if (!currentUser || !roomId || !gameRoom || gameRoom.creatorUid !== currentUser.uid || gameRoom.status !== 'ready' || !allReady) {
      setError(t('errorOnlyCreatorCanStartGame'));
      return;
    }
    setError(null);

    try {
      const player1CardNumbers = generateBingoCardNumbers(25, 1, 90);
      const player2CardNumbers = generateBingoCardNumbers(25, 1, 90);

      // Build dynamic payload for all players
      const payload: Partial<GameRoomData> = {
        status: 'playing',
        startDateTime: serverTimestamp(),
        drawnNumbers: [],
        markedNumbersP1: [],
        markedNumbersP2: [],
        player1Card: player1CardNumbers,
        player2Card: player2CardNumbers,
        winner: null,
        currentTurn: 0,
        player1Connected: true,
        player2Connected: true,
        disconnectTimerStart: null,
      };
      if ((gameRoom.maxPlayers || 2) >= 3) {
        const player3CardNumbers = generateBingoCardNumbers(25, 1, 90);
        payload.player3Card = player3CardNumbers;
        payload.markedNumbersP3 = [];
        payload.player3Connected = true;
      }
      if ((gameRoom.maxPlayers || 2) === 4) {
        const player4CardNumbers = generateBingoCardNumbers(25, 1, 90);
        payload.player4Card = player4CardNumbers;
        payload.markedNumbersP4 = [];
        payload.player4Connected = true;
      }
      const roomRef = doc(db, 'gameRooms', roomId);
      await updateDoc(roomRef, payload);
      console.log(`Game ${roomId} started by ${currentUser.displayName}`);
      showNotification(t('gameStarted'), 'success');
      playClickSound();

    } catch (e) {
      console.error('Error starting game:', e);
      setError(t('errorStartingGame'));
      showNotification(t('errorStartingGame'), 'error');
    }
  };

  // Function to draw the next number
  const handleDrawNumber = useCallback(async () => {
    // Guard
    if (!currentUser || !roomId || !gameRoom || isDrawing) {
      console.warn('Cannot draw number: Invalid state or already drawing.');
      setError(t('errorCannotDrawNumber'));
      return;
    }
    // Transaction ile çekim ve win detection
    setError(null);
    setIsDrawing(true);
    setLastErrorAction(() => handleDrawNumber);
    try {
      await runTransaction(db, async (tx) => {
        const roomRef = doc(db, 'gameRooms', roomId);
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('Room not found');
        const data = snap.data() as GameRoomData;
        if (data.creatorUid !== currentUser.uid || data.status !== 'playing' || data.winner) {
          throw new Error('Invalid state for drawing.');
        }
        const drawn = data.drawnNumbers || [];
        if (drawn.length >= 90) throw new Error('All numbers drawn');
        let nextNum;
        const drawnSet = new Set(drawn);
        do { nextNum = Math.floor(Math.random() * 90) + 1; } while (drawnSet.has(nextNum));
        const newDrawn = [...drawn, nextNum];
        tx.update(roomRef, {
          drawnNumbers: arrayUnion(nextNum),
          currentTurn: (data.currentTurn || 0) + 1,
        });
        // Win detection for all players
        const cardsToCheck = [
          { id: data.creatorUid, cardNumbers: data.player1Card || [] },
          { id: data.player2Uid || '', cardNumbers: data.player2Card || [] },
        ];
        if (data.player3Uid) cardsToCheck.push({ id: data.player3Uid, cardNumbers: data.player3Card || [] });
        if (data.player4Uid) cardsToCheck.push({ id: data.player4Uid, cardNumbers: data.player4Card || [] });
        const result = checkForWinner(cardsToCheck, newDrawn);
        if (result.winnerId) {
          tx.update(roomRef, { winner: result.winnerId, status: 'finished', endDateTime: serverTimestamp() });
        }
      });
    } catch (e) {
      console.error('Error drawing number:', e);
      setError(t('errorDrawingNumber'));
      showNotification(t('errorDrawingNumber'), 'error');
    } finally {
      setIsDrawing(false);
    }
  }, [currentUser, roomId, gameRoom, isDrawing, showNotification, t]);

  // Auto-draw every autoDrawInterval seconds when enabled (host only)
  useEffect(() => {
    if (!autoDrawEnabled) return;
    if (currentUser?.uid !== gameRoom?.creatorUid) return;
    if (gameRoom?.status !== 'playing' || gameRoom?.winner) return;
    const intervalSec = Math.max(autoDrawInterval, 1);
    const intervalId = setInterval(() => {
      handleDrawNumber();
    }, intervalSec * 1000);
    return () => clearInterval(intervalId);
  }, [autoDrawEnabled, autoDrawInterval, currentUser?.uid, gameRoom?.status, gameRoom?.winner, handleDrawNumber, gameRoom?.creatorUid]);

  // --- Win Check Logic (Reverted to Standard Bingo Lines) ---
  const checkForWinAfterAction = useCallback(async (
    playerFieldName: 'markedNumbersP1' | 'markedNumbersP2' | 'markedNumbersP3' | 'markedNumbersP4',
    roomRef: DocumentReference<DocumentData>,
    updatedRoomData?: GameRoomData
  ) => {
    const currentRoomState = updatedRoomData || gameRoom;
    // Only check if playing and no winner yet
    if (!currentRoomState || currentRoomState.status !== 'playing' || currentRoomState.winner) {
        return;
    }
    // Kart ve işaretli sayılarını al
    let cardNumbers: number[] | undefined;
    let markedNumbersSet: Set<number>;
    if (playerFieldName === 'markedNumbersP1') {
      cardNumbers = currentRoomState.player1Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP1 || []);
    } else if (playerFieldName === 'markedNumbersP2') {
      cardNumbers = currentRoomState.player2Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP2 || []);
    } else if (playerFieldName === 'markedNumbersP3') {
      cardNumbers = currentRoomState.player3Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP3 || []);
    } else {
      cardNumbers = currentRoomState.player4Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP4 || []);
    }

    if (!cardNumbers || cardNumbers.length !== 25) return; // Card not ready or invalid

    // Check for standard Bingo win using the utility function
    const hasWon = checkBingoWin(cardNumbers, markedNumbersSet);

    console.log(`Checking Standard Bingo Win for ${playerFieldName}. Won: ${hasWon}`);

    if (hasWon) {
        // Kazanan UID'si alan adına göre belirle
        let winnerUid: string | null = null;
        if (playerFieldName === 'markedNumbersP1') winnerUid = currentRoomState.creatorUid;
        else if (playerFieldName === 'markedNumbersP2') winnerUid = currentRoomState.player2Uid;
        else if (playerFieldName === 'markedNumbersP3') winnerUid = currentRoomState.player3Uid || null;
        else if (playerFieldName === 'markedNumbersP4') winnerUid = currentRoomState.player4Uid || null;
        console.log(`Standard Bingo Winner detected: ${winnerUid} (${playerFieldName})`);
        try {
            // Check again briefly if someone else won in the meantime
            const currentSnap = await getDoc(roomRef);
            if (currentSnap.exists()) {
                const gameData = currentSnap.data() as GameRoomData;
                if (gameData.winner) {
                    console.log("Another player already won.");
                    return; // Avoid overwriting winner
                }
            }

            await updateDoc(roomRef, {
                winner: winnerUid,
                status: 'finished'
            });
            console.log("Game status updated to finished (Standard Bingo Win).");
            // Sound/Notification is handled by the main useEffect watching gameRoom status change
        } catch (e) {
            console.error("Error updating winner status (Standard Bingo Win):", e);
            setError(t("errorDeclaringWinner"));
            showNotification(t('errorDeclaringWinner'), 'error');
        }
    }
  }, [gameRoom, showNotification, t]);

  const handleMarkNumber = async (number: number, isMarking: boolean) => {
    if (!currentUser || !roomId || !gameRoom || gameRoom.status !== 'playing' || gameRoom.winner) {
      console.warn('Cannot mark number: Invalid state or game not active.');
      return;
    }

    if (penaltyCountdown !== null) return;
    if (!gameRoom?.drawnNumbers?.includes(number)) {
      setPenaltyCountdown(30);
      // use i18n penalty message
      showNotification(t('penaltyMessage', { seconds: 30 }), 'error');
      return;
    }

    const isPlayer1 = currentUser.uid === gameRoom.creatorUid;
    const isPlayer2 = currentUser.uid === gameRoom.player2Uid;
    const isPlayer3 = currentUser.uid === gameRoom.player3Uid;
    const isPlayer4 = currentUser.uid === gameRoom.player4Uid;
    const playerFieldName = isPlayer1 ? 'markedNumbersP1'
      : isPlayer2 ? 'markedNumbersP2'
      : isPlayer3 ? 'markedNumbersP3'
      : isPlayer4 ? 'markedNumbersP4'
      : null;

    if (!playerFieldName) {
      console.error('Current user is neither player 1 nor player 2.');
      return;
    }

    try {
      // Transaction ile işaretleme ve win check
      setLastErrorAction(() => () => handleMarkNumber(number, isMarking));
      await runTransaction(db, async (tx) => {
        const roomRef = doc(db, 'gameRooms', roomId);
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('Room not found');
        const updatePayload: UpdateData<GameRoomData> = {};
        if (isMarking) updatePayload[playerFieldName] = arrayUnion(number);
        else updatePayload[playerFieldName] = arrayRemove(number);
        tx.update(roomRef, updatePayload);
      });
      // Transaction tamamlandıktan sonra win check yap
      const roomRefAfter = doc(db, 'gameRooms', roomId);
      const snapAfter = await getDoc(roomRefAfter);
      if (snapAfter.exists()) {
        await checkForWinAfterAction(playerFieldName, roomRefAfter, snapAfter.data() as GameRoomData);
      }
      playClickSound();
    } catch (e) {
      console.error(`Error ${isMarking ? 'marking' : 'unmarking'} number:`, e);
      setError(t('errorMarkingNumber'));
      showNotification(t('errorMarkingNumber'), 'error');
    }
  };

  // Helper to convert drawnNumbers array to Set for BingoCard prop
  const drawnNumbersSet = new Set(gameRoom?.drawnNumbers || []);
  // Helpers to convert marked numbers arrays to Sets for BingoCard prop
  const markedNumbersP1Set = new Set(gameRoom?.markedNumbersP1 || []);
  const markedNumbersP2Set = new Set(gameRoom?.markedNumbersP2 || []);
  const markedNumbersP3Set = new Set(gameRoom?.markedNumbersP3 || []);
  const markedNumbersP4Set = new Set(gameRoom?.markedNumbersP4 || []);

  // Determine flex width for cards based on player count
  const columns = gameRoom?.maxPlayers || 2;
  const colWidth = columns === 2 ? '50%' : columns === 3 ? '33.33%' : '25%';

  // Function to handle leaving the game
  const handleLeaveGame = async () => {
    if (!currentUser || !roomId || !gameRoom) return;

    const isP1 = currentUser.uid === gameRoom.creatorUid;
    const isP2 = currentUser.uid === gameRoom.player2Uid;
    const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;

    if (myConnectionField) {
      const roomRef = doc(db, 'gameRooms', roomId);
      console.log(`Player leaving, setting ${myConnectionField} to false and ending game`);
      try {
        // User leaving triggers game end and cleanup
        await updateDoc(roomRef, {
          [myConnectionField]: false,
          disconnectTimerStart: null,
          status: 'finished',
          winner: isP1 ? gameRoom.player2Uid : gameRoom.creatorUid
        });
        console.log('Game ended and player marked as disconnected.');
      } catch (error) {
        console.error('Error cleaning up room on leave:', error);
      }
    }
    // Navigate back to lobby
    navigate('/lobby');
  };

  // --- Render Logic --- //

  if (loading) {
    return (
      <div className="min-h-screen min-h-dvh bg-background flex-center safe-area-inset">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Oyun yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-h-dvh bg-background safe-area-inset">
        <div className="container-mobile py-6">
          <div className="card-modern p-6 text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex-center mx-auto mb-4">
              <span className="text-error-500 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
            <p className="text-error-600 mb-6">{error}</p>
            <div className="flex gap-3">
              {lastErrorAction ? (
                <button onClick={() => { lastErrorAction(); setError(null); }} className="btn-primary flex-1">
                  {t('retry')}
                </button>
              ) : (
                <button onClick={() => navigate('/lobby')} className="btn-secondary flex-1">
                  {t('backToLobby')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameRoom) {
    return (
      <div className="min-h-screen min-h-dvh bg-background safe-area-inset">
        <div className="container-mobile py-6">
          <div className="card-modern p-6 text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex-center mx-auto mb-4">
              <span className="text-warning-500 text-2xl">🔍</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Oda Bulunamadı</h2>
            <p className="text-gray-600 mb-6">{t('errorGameRoomDataNotAvailable')}</p>
            <button onClick={() => navigate('/lobby')} className="btn-primary">
              {t('backToLobby')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if the current user is player 1 
  const isPlayer1 = currentUser?.uid === gameRoom.creatorUid;

  // Modern mobile game screen
  return (
    <div className="min-h-screen min-h-dvh bg-background safe-area-inset relative">
      {/* Penalty Overlay */}
      {penaltyCountdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex-center flex-col text-white">
          <div className="text-center p-6">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">{t('penaltyMessage', { seconds: penaltyCountdown })}</h2>
            <p className="text-gray-300">Lütfen bekleyin...</p>
          </div>
        </div>
      )}
      
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="container-mobile py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('gameTitleBasic')}</h1>
                <p className="text-primary-200 text-sm">Canlı Oyun</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isPlayer1 && (
                <>
                  <div className="hidden sm:block text-right text-sm">
                    <p className="text-primary-200">Oda Kodu</p>
                    <p className="font-mono font-bold">{roomId}</p>
                  </div>
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(roomId!); 
                      showNotification(t('common.copySuccess'), 'success'); 
                    }}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex-center hover:bg-opacity-30 transition-all"
                  >
                    <span className="text-white">📋</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex-center hover:bg-opacity-30 transition-all"
              >
                <SettingsIcon className="text-white w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modern Lobby Details */}
      {isPlayer1 && gameRoom.status === 'waiting' && (
        <div className="container-mobile">
          <div className="card-modern p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {gameRoom.password && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <span>🔒</span>
                  <span>{t('lobby.passwordLabel')}: {gameRoom.password}</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                gameRoom.type === 'event' ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-700'
              }`}>
                <span>{gameRoom.type === 'event' ? '📅' : '🎮'}</span>
                <span>{gameRoom.type === 'event' ? t('lobby.event') : t('lobby.normal')}</span>
              </div>
              {gameRoom.type === 'event' && gameRoom.startTime && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  <span>🕐</span>
                  <span>{gameRoom.startTime.toDate().toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="container-mobile">
        {/* Disconnect Warning */}
        {gameRoom!.status === 'stopping' && disconnectCountdown !== null && (
          <div className="bg-warning-100 border border-warning-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-warning-500 text-xl">⚠️</span>
              <div>
                <h4 className="font-medium text-warning-800">Oyuncu Bağlantı Sorunu</h4>
                <p className="text-warning-700 text-sm">{t('opponentDisconnected', { seconds: disconnectCountdown })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Player 1 */}
          <div className="card-modern p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex-center">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{gameRoom.creatorName}</h4>
                <p className="text-sm text-gray-500">{t('creator')}</p>
                {gameRoom.status === 'finished' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    gameRoom.winner === gameRoom.creatorUid 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-error-100 text-error-700'
                  }`}>
                    {gameRoom.winner === gameRoom.creatorUid ? t('lobby.winnerLabel') : t('lobby.loserLabel')}
                  </span>
                )}
              </div>
              {gameRoom.player1Connected && (
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className="card-modern p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex-center">
                <span className="text-secondary-600 font-bold">2</span>
              </div>
              <div className="flex-1">
                {gameRoom.player2Name ? (
                  <>
                    <h4 className="font-medium text-gray-900">{gameRoom.player2Name}</h4>
                    <p className="text-sm text-gray-500">Oyuncu</p>
                    {gameRoom.status === 'finished' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        gameRoom.winner === gameRoom.player2Uid 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {gameRoom.winner === gameRoom.player2Uid ? t('lobby.winnerLabel') : t('lobby.loserLabel')}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-gray-400">{t('waitingPlayer')}</h4>
                    <p className="text-sm text-gray-400">Bekleniyor...</p>
                  </>
                )}
              </div>
              {gameRoom.player2Connected && (
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Player 3 & 4 for 3-4 player games */}
          {(gameRoom.maxPlayers || 0) >= 3 && (
            <div className="card-modern p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex-center">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  {gameRoom.player3Name ? (
                    <>
                      <h4 className="font-medium text-gray-900">{gameRoom.player3Name}</h4>
                      <p className="text-sm text-gray-500">Oyuncu</p>
                      {gameRoom.status === 'finished' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          gameRoom.winner === gameRoom.player3Uid 
                            ? 'bg-success-100 text-success-700' 
                            : 'bg-error-100 text-error-700'
                        }`}>
                          {gameRoom.winner === gameRoom.player3Uid ? t('lobby.winnerLabel') : t('lobby.loserLabel')}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-gray-400">{t('waitingPlayer')}</h4>
                      <p className="text-sm text-gray-400">Bekleniyor...</p>
                    </>
                  )}
                </div>
                {gameRoom.player3Connected && (
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                )}
              </div>
            </div>
          )}

          {(gameRoom.maxPlayers || 0) === 4 && (
            <div className="card-modern p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex-center">
                  <span className="text-purple-600 font-bold">4</span>
                </div>
                <div className="flex-1">
                  {gameRoom.player4Name ? (
                    <>
                      <h4 className="font-medium text-gray-900">{gameRoom.player4Name}</h4>
                      <p className="text-sm text-gray-500">Oyuncu</p>
                      {gameRoom.status === 'finished' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          gameRoom.winner === gameRoom.player4Uid 
                            ? 'bg-success-100 text-success-700' 
                            : 'bg-error-100 text-error-700'
                        }`}>
                          {gameRoom.winner === gameRoom.player4Uid ? t('lobby.winnerLabel') : t('lobby.loserLabel')}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-gray-400">{t('waitingPlayer')}</h4>
                      <p className="text-sm text-gray-400">Bekleniyor...</p>
                    </>
                  )}
                </div>
                {gameRoom.player4Connected && (
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modern Game Status and Controls */}
        <div className="card-modern p-4 mb-6">
          {/* Status Header */}
          <div className="flex-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                gameRoom.status === 'playing' ? 'bg-success-500 animate-pulse' :
                gameRoom.status === 'ready' ? 'bg-warning-500' :
                gameRoom.status === 'waiting' ? 'bg-gray-400' :
                gameRoom.status === 'stopping' ? 'bg-error-500 animate-pulse' :
                'bg-primary-500'
              }`}></div>
              <h3 className="text-lg font-bold text-gray-900">
                {t('status')}: {
                  gameRoom.status === 'stopping' 
                    ? `${gameRoom.status.toUpperCase()} (${t('waitingForPlayer')})` 
                    : gameRoom.status.toUpperCase()
                }
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Waiting State */}
            {gameRoom.status === 'waiting' && isPlayer1 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-blue-500">ℹ️</span>
                <span className="text-blue-700 text-sm font-medium">{t('waitingToJoin')}</span>
              </div>
            )}

            {/* Ready State - Host */}
            {gameRoom.status === 'ready' && isPlayer1 && (
              <button 
                onClick={handleStartGame} 
                disabled={!allReady}
                className={`btn-primary ${!allReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>🚀</span>
                {t('startGame')}
              </button>
            )}

            {/* Ready State - Player */}
            {gameRoom.status === 'ready' && !isPlayer1 && (
              <button 
                onClick={handleReady} 
                disabled={isReady}
                className={`${isReady ? 'btn-secondary' : 'btn-primary'} ${isReady ? 'opacity-75' : ''}`}
              >
                <span>{isReady ? '✅' : '⏳'}</span>
                {isReady ? t('ready') : t('clickToReady')}
              </button>
            )}

            {/* Game Controls - Host Only */}
            {gameRoom.status === 'playing' && isPlayer1 && !gameRoom.winner && (
              <>
                {/* Auto-draw Toggle */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoDrawEnabled}
                      onChange={() => setAutoDrawEnabled(prev => !prev)}
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {autoDrawEnabled ? 'Otomatik Çekim Açık' : 'Otomatik Çekim Kapalı'}
                    </span>
                  </label>
                  
                  {autoDrawEnabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={autoDrawInterval}
                        onChange={(e) => setAutoDrawInterval(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-500">sn</span>
                    </div>
                  )}
                </div>

                {/* Manual Draw Button */}
                <button
                  onClick={handleDrawNumber}
                  disabled={isDrawing || ((gameRoom.drawnNumbers?.length ?? 0) >= 90) || !!gameRoom.winner}
                  className="btn-primary flex items-center gap-2"
                >
                  {isDrawing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>🎱</span>
                  )}
                  {isDrawing ? 'Çekiliyor...' : 
                   ((gameRoom.drawnNumbers?.length ?? 0) >= 90) ? t('allDrawn') : t('drawNextNumber')}
                </button>
              </>
            )}
          </div>

          {/* Winner Announcement */}
          {gameRoom! && gameRoom!.winner && gameRoom!.status === 'finished' && (
            <div className="mt-4 p-4 bg-success-100 border border-success-500 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-success-500 text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-success-800">Oyun Bitti!</h4>
                  <p className="text-success-700">
                    {t('winner')}: {gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Content Area */}
        {(gameRoom!.status === 'playing' || gameRoom!.status === 'stopping' || gameRoom!.status === 'finished') ? (
          <>
            {/* Number Draw Section */}
            <div className="mb-6">
              <NumberDraw drawnNumbers={gameRoom.drawnNumbers} />
            </div>
            
            {/* Bingo Cards Grid */}
            <div className="grid gap-4 mb-6" style={{
              gridTemplateColumns: `repeat(${Math.min(gameRoom.maxPlayers || 2, 2)}, 1fr)`
            }}>
              {Array.from({ length: gameRoom.maxPlayers || 2 }).map((_, idx) => {
                const slot =
                  idx === 0
                    ? { uid: gameRoom.creatorUid, name: gameRoom.creatorName, cardNumbers: gameRoom.player1Card || [], marks: markedNumbersP1Set }
                  : idx === 1
                    ? { uid: gameRoom.player2Uid, name: gameRoom.player2Name || '', cardNumbers: gameRoom.player2Card || [], marks: markedNumbersP2Set }
                  : idx === 2
                    ? { uid: gameRoom.player3Uid, name: gameRoom.player3Name || '', cardNumbers: gameRoom.player3Card || [], marks: markedNumbersP3Set }
                  : { uid: gameRoom.player4Uid, name: gameRoom.player4Name || '', cardNumbers: gameRoom.player4Card || [], marks: markedNumbersP4Set };
                
                return (
                  <div key={idx} className="flex flex-col">
                    <div className="text-center mb-3">
                      <h4 className="font-bold text-gray-900">
                        {slot.name || t('waitingPlayer')}
                        {gameRoom.status === 'finished' && slot.uid && (
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            gameRoom.winner === slot.uid
                              ? 'bg-success-100 text-success-700'
                              : 'bg-error-100 text-error-700'
                          }`}>
                            {gameRoom.winner === slot.uid ? t('lobby.winnerLabel') : t('lobby.loserLabel')}
                          </span>
                        )}
                      </h4>
                    </div>
                    
                    {slot.cardNumbers.length === 25 ? (
                      <BingoCard
                        numbers={slot.cardNumbers}
                        drawnNumbers={drawnNumbersSet}
                        initialMarkedNumbers={slot.marks}
                        isPlayerCard={currentUser?.uid === slot.uid && gameRoom.status === 'playing'}
                        onMarkNumber={handleMarkNumber}
                      />
                    ) : (
                      <div className="card-modern p-8 flex-center h-64 border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-400">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex-center">
                            <span className="text-gray-400">👤</span>
                          </div>
                          <p className="font-medium">{t('waitingPlayer')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : gameRoom!.status === 'waiting' || gameRoom!.status === 'ready' ? (
          <div className="card-modern p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {gameRoom.status === 'waiting' ? 'Oyuncular Bekleniyor' : 'Oyun Başlatılıyor'}
            </h3>
            <p className="text-gray-600">
              {gameRoom.status === 'waiting'
                ? t('waitingToJoin')
                : t('game.waiting', { current: currentPlayersCount, required: gameRoom.maxPlayers || 2 })}
            </p>
          </div>
        ) : (
          <div className="card-modern p-6 text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex-center mx-auto mb-4">
              <span className="text-error-500 text-2xl">⚠️</span>
            </div>
            <p className="text-error-600 font-medium">{t('Error: Game in unexpected state or card data missing.')}</p>
          </div>
        )}

        {/* Back to Lobby Button */}
        <div className="text-center mt-8">
          <button onClick={handleLeaveGame} className="btn-secondary">
            <span>🏠</span>
            {t('backToLobby')}
          </button>
        </div>
      </div>

      {/* Game Over Overlay - Rendered conditionally with animation */}
      <AnimatePresence>
        {gameRoom.status === 'finished' && gameRoom.winner && (
          <GameOverOverlay
            winnerName={gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name}
            isWinner={currentUser?.uid === gameRoom.winner}
            countdownSeconds={endCountdown ?? 0}
          />
        )}
      </AnimatePresence>

      <AchievementModal open={achievementsOpen} achievements={achievements} onClose={() => setAchievementsOpen(false)} />

      {/* Modern Chat Toggle Button */}
      <button
        onClick={() => setOpenChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex-center z-50"
      >
        <span className="text-xl">💬</span>
      </button>
      
      {/* Modern Chat Drawer */}
      {openChat && (
        <div className="fixed inset-0 z-50 lg:inset-auto lg:right-0 lg:top-0 lg:h-full lg:w-96">
          <div className="absolute inset-0 bg-black bg-opacity-50 lg:hidden" onClick={() => setOpenChat(false)}></div>
          <div className="relative h-full w-full bg-white lg:w-96 lg:shadow-xl">
            <div className="flex-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">💬 Sohbet</h3>
              <button 
                onClick={() => setOpenChat(false)}
                className="w-8 h-8 flex-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="h-full pb-20">
              <Chat roomId={roomId!} />
            </div>
          </div>
        </div>
      )}

      {/* Game Timestamps Footer */}
      {(gameRoom?.startDateTime || gameRoom?.endDateTime) && (
        <div className="container-mobile mt-8 pb-6">
          <div className="card-modern p-3">
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
              {gameRoom.startDateTime && (
                <div className="flex items-center gap-2">
                  <span>🎮</span>
                  <span>{t('lobby.startDateTime')}: {gameRoom.startDateTime.toDate().toLocaleString()}</span>
                </div>
              )}
              {gameRoom.endDateTime && (
                <div className="flex items-center gap-2">
                  <span>🏁</span>
                  <span>{t('lobby.endDateTime')}: {gameRoom.endDateTime.toDate().toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </div>
  );
};

export default GameScreen; 