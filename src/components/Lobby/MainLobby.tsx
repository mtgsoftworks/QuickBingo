/**
 * src/components/Lobby/MainLobby.tsx: Oyun lobisi ana bileşeni.
 * Kullanıcıların yeni oyun odası oluşturmasını, mevcut odalara katılmasını ve odaları yönetmesini sağlar.
 * Firestore üzerinden gerçek zamanlı oda verisi dinler. Kullanıcıya bildirim ve hata yönetimi sunar.
 * Çoklu dil desteği ve Material UI ile modern arayüz sağlar.
 *
 * @returns {JSX.Element} Oyun lobisi arayüzü.
 */
import React, { useState, useEffect } from 'react'; // React: JSX desteği, useState: state yönetimi, useEffect: yan etkileri yönetmek için Hook'lar
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider
} from '@mui/material'; // Material UI bileşenleri: arayüz öğeleri için
import { useAuth } from '../../contexts/AuthContext'; // useAuth: kimlik doğrulama durumunu almak için özel Hook
import { useNotification } from '../../contexts/NotificationContext'; // useNotification: bildirim göstermek için Hook
import { useNavigate } from 'react-router-dom'; // useNavigate: sayfa yönlendirmeleri için React Router Hook
import { auth, db } from '../../services/firebase'; // auth, db: Firebase Authentication ve Firestore veritabanı nesneleri
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  Timestamp,
  DocumentData,
  UpdateData
} from 'firebase/firestore'; // Firebase Firestore işlemleri: veri okuma/yazma için fonksiyonlar
import { useTranslation } from 'react-i18next'; // useTranslation: çoklu dil desteği için çeviri Hook
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useWaitingRooms } from '../../hooks/useWaitingRooms';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete'; // DeleteIcon: silme iconu
import EditIcon from '@mui/icons-material/Edit'; // EditIcon: düzenleme iconu
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // ContentCopyIcon: kopyalama iconu
import FacebookIcon from '@mui/icons-material/Facebook'; // Facebook paylaşım
import TwitterIcon from '@mui/icons-material/Twitter'; // Twitter paylaşım
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // WhatsApp paylaşım
import TelegramIcon from '@mui/icons-material/Telegram'; // Telegram paylaşım
import SettingsIcon from '@mui/icons-material/Settings'; // Settings icon
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import { SettingsModal } from '../UI/SettingsModal';
import Footer from '../UI/Footer';
import GameRules from '../Game/GameRules';
import { useAdMob } from '../../hooks/useAdMob';
import LanguageSwitcher from '../UI/LanguageSwitcher';

// Interface for Room data
interface WaitingRoom extends DocumentData {
  // WaitingRoom: lobide bekleyen oyun odası bilgilerini tutan veri yapısı
  id: string;
  creatorName: string;
  creatorUid: string;
  createdAt: Timestamp;
  roomName?: string;
  maxPlayers?: number;
  type?: 'normal' | 'event';
  password?: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
  creatorLeftAt?: Timestamp;
  status: 'waiting' | 'closed';
}

const MainLobby: React.FC = () => {
  // useTranslation ile UI metinlerini çevir
  const { t } = useTranslation();
  // useAuth ile mevcut kullanıcı bilgilerini al
  const { currentUser } = useAuth();
  // useNotification ile kullanıcıya bildirim göster
  const { showNotification } = useNotification();
  // useNavigate ile sayfa yönlendirmeleri yap
  const navigate = useNavigate();
  // State: bekleyen odalar listesini ve yüklenme durumunu tutar
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  const [joinPassword, setJoinPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [newMaxPlayers, setNewMaxPlayers] = useState<number>(2);
  // Yeni eklenen lobi özellikleri
  const [newRoomType, setNewRoomType] = useState<'normal' | 'event'>('normal');
  const [newStartDateTime, setNewStartDateTime] = useState<string>('');
  const [newEndDateTime, setNewEndDateTime] = useState<string>('');
  const [newRoomPassword, setNewRoomPassword] = useState<string>('');
  // Snackbar için state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [now, setNow] = useState<number>(Date.now());
  // Firestore'dan bekleyen odalar
  const { rooms: waitingRooms, loading: loadingRooms, error: roomsError } = useWaitingRooms();
  useEffect(() => {
    if (roomsError) {
      showNotification(t('errorLoadRooms'), 'error');
    }
  }, [roomsError, showNotification, t]);
  // Kullanıcının zaten bir lobisi var mı?
  const hasOwnRoom = currentUser ? waitingRooms.some(room => room.creatorUid === currentUser.uid) : false;
  // Oluşturulan lobi kodunu sakla ve onay dialog'u için kontrol et
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [showCreatedDialog, setShowCreatedDialog] = useState<boolean>(false);
  // Düzenleme dialogu için state
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  // State for join dialog selected room
  const [selectedRoomForJoin, setSelectedRoomForJoin] = useState<WaitingRoom | null>(null);
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameRulesOpen, setIsGameRulesOpen] = useState(false);
  
  // AdMob integration
  const { showBanner, hideBanner, showInterstitial, isNative } = useAdMob();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show banner ad on mount
  useEffect(() => {
    if (isNative) {
      showBanner();
    }
    return () => {
      if (isNative) {
        hideBanner();
      }
    };
  }, [isNative]);
  // Etkinlik lobisi detayını hesaplama
  const getEventDetail = (room: WaitingRoom): string => {
    const startMs = room.startTime?.toMillis() ?? 0;
    const endMs = room.endTime?.toMillis() ?? 0;
    if (now < startMs) {
      const diff = startMs - now;
      if (diff > 24 * 3600 * 1000) {
        return `Başlangıç: ${new Date(startMs).toLocaleString()}`;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `Başlayacak: ${h}h ${m}m ${s}s`;
    }
    if (now < endMs) {
      const diff = endMs - now;
      if (diff > 24 * 3600 * 1000) {
        return `Bitiş: ${new Date(endMs).toLocaleString()}`;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `Kalan: ${h}h ${m}m ${s}s`;
    }
    return 'Etkinlik sona erdi';
  };

  // Room status helper
  const getRoomStatusInfo = (room: WaitingRoom) => {
    const playerCount = [room.creatorUid, room.player2Uid, room.player3Uid, room.player4Uid].filter(Boolean).length;
    const maxPlayers = room.maxPlayers || 2;
    return { playerCount, maxPlayers };
  };

  const handleLogout = async () => {
    // Kullanıcı çıkış işlemi
    try {
      await auth.signOut();
      showNotification(t('loggedOut'), 'info');
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      setError(t('errorFailedLogout'));
      showNotification(t('errorFailedLogout'), 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setNewRoomName('');
    setCreateError(null);
    setNewMaxPlayers(2);
    setOpenCreateDialog(true);
    setError(null);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleConfirmCreateGame = async () => {
    // Yeni oyun odası oluşturma
    if (!currentUser) return setCreateError(t('You must be logged in to create a game.'));
    if (!newRoomName.trim()) return setCreateError(t('lobby.errorRoomNameEmpty'));
    setCreateError(null);
    // Form validasyonları
    if (newRoomType === 'event') {
      if (!newStartDateTime || !newEndDateTime) {
        return setCreateError(t('lobby.errorDateRequired'));
      }
      if (new Date(newStartDateTime) >= new Date(newEndDateTime)) {
        return setCreateError(t('lobby.errorDateRange'));
      }
    }
    if (newRoomPassword && newRoomPassword.length < 4) {
      return setCreateError(t('lobby.errorPasswordLength'));
    }

    try {
      const createPayload: Partial<WaitingRoom> = {
        creatorUid: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous Creator',
        roomName: newRoomName.trim(),
        maxPlayers: newMaxPlayers,
        status: 'waiting',
        createdAt: Timestamp.fromDate(new Date()),
        readyP1: true,
        readyP2: false,
        readyP3: false,
        readyP4: false,
        type: newRoomType,
        password: newRoomPassword
      };
      if (newRoomType === 'event') {
        createPayload.startTime = Timestamp.fromDate(new Date(newStartDateTime));
        createPayload.endTime = Timestamp.fromDate(new Date(newEndDateTime));
      }
      const docRef = await addDoc(collection(db, 'gameRooms'), createPayload);
      console.log('Game room created with ID:', docRef.id);
      showNotification(t('roomCreated', { id: docRef.id }), 'success');
      handleCloseCreateDialog();
      setCreatedRoomCode(docRef.id);
      setShowCreatedDialog(true);
      
      // Show interstitial ad after room creation
      if (isNative) {
        setTimeout(() => showInterstitial(), 1000);
      }
    } catch (e) {
      console.error('Error creating game room:', e);
      setCreateError(t('errorFailedToCreate'));
      showNotification(t('errorFailedToCreate'), 'error');
    }
  };

  /**
   * Join dialog'u açar. Eğer room parametresi varsa oda kodunu ve şifresini (varsa) doldurur.
   */
  const handleOpenJoinDialog = (room?: WaitingRoom) => {
    if (room) {
      setSelectedRoomForJoin(room);
      setRoomCodeToJoin(room.id);
      setJoinPassword('');
    } else {
      setSelectedRoomForJoin(null);
      setRoomCodeToJoin('');
      setJoinPassword('');
    }
    setError(null);
    setOpenJoinDialog(true);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
  };

  const handleConfirmJoinGame = async () => {
    // Koda göre mevcut oyuna katılma işlemi
    if (!currentUser) return setError(t('You must be logged in to join a game.'));
    if (!roomCodeToJoin.trim()) return setError(t('Please enter a room code.'));
    setError(null);
    const roomId = roomCodeToJoin.trim();
    const roomRef = doc(db, 'gameRooms', roomId);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        setError(t('roomNotFound'));
        return;
      }
      const roomData = roomSnap.data() as WaitingRoom;
      // Şifre korumalı lobi için kontrol
      if (roomData.password) {
        if (roomData.password !== joinPassword) {
          setError(t('lobby.errorWrongPassword'));
          return;
        }
      }
      if (roomData.status !== 'waiting') {
        setError(t('roomNotAvailable'));
        return;
      }
      if (roomData.creatorUid === currentUser.uid) {
        setError(t('cannotJoinOwnGame'));
        setTimeout(() => navigate(`/game/${roomId}`), 2000);
        return;
      }
      // Dynamic join for 2-4 players
      const { maxPlayers = 2, player2Uid, player3Uid, player4Uid } = roomData;
      let slotsCount = 1;
      if (player2Uid) slotsCount++;
      if (player3Uid) slotsCount++;
      if (player4Uid) slotsCount++;
      if (slotsCount >= maxPlayers) {
        setError(t('roomFull'));
        return;
      }
      const nextSlot = !player2Uid ? 2 : !player3Uid ? 3 : 4;
      const uidField = `player${nextSlot}Uid`;
      const nameField = `player${nextSlot}Name`;
      const updatePayload: Record<string, string | boolean> = {
        [uidField]: currentUser.uid,
        [nameField]: currentUser.displayName || `Anonymous Player ${nextSlot}`
      };
      if (slotsCount + 1 === maxPlayers) {
        updatePayload.status = 'ready';
      }
      await updateDoc(roomRef, updatePayload);
      console.log(`Player ${currentUser.displayName} joined room: ${roomId} as Player ${nextSlot}`);
      showNotification(t('joinedRoom', { id: roomId }), 'success');
      handleCloseJoinDialog();
      navigate(`/game/${roomId}`);
    } catch (e) {
      console.error('Error joining game room:', e);
      setError(t('errorFailedToJoin'));
      showNotification(t('errorFailedToJoin'), 'error');
    }
  };

  // Function to delete a room
  const handleDeleteRoom = async (roomIdToDelete: string) => {
    // Kullanıcı çıkış işlemi
    if (!currentUser) return;
    // Optional: Add a confirmation dialog here
    const roomToDelete = waitingRooms.find(room => room.id === roomIdToDelete);
    if (roomToDelete?.creatorUid !== currentUser.uid) {
      showNotification(t("deleteRoomConfirm"), "warning");
      return;
    }

    const roomRef = doc(db, 'gameRooms', roomIdToDelete);
    try {
      await deleteDoc(roomRef);
      showNotification(t('roomDeleted', { id: roomIdToDelete }), 'info');
      // The onSnapshot listener will automatically update the list
    } catch (error) {
      console.error("Error deleting room:", error);
      showNotification(t("errorFailedToDelete"), "error");
    }
  };

  // Lobileri filtrele ve sırala: süresi geçmişleri gizle, etkinlik önde
  const displayRooms = waitingRooms
    .filter(room => {
      if (room.type === 'normal') {
        if (room.creatorLeftAt) {
          return now < room.creatorLeftAt.toMillis() + 8 * 3600 * 1000;
        }
        return true;
      }
      if (room.type === 'event') {
        return room.endTime ? now < room.endTime.toMillis() : false;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (a.type !== 'event' && b.type === 'event') return 1;
      if (a.type === 'event' && b.type === 'event') {
        const aStart = a.startTime?.toMillis() ?? 0;
        const bStart = b.startTime?.toMillis() ?? 0;
        return aStart - bStart;
      }
      const aCreated = a.createdAt?.toMillis() ?? 0;
      const bCreated = b.createdAt?.toMillis() ?? 0;
      return bCreated - aCreated;
    });

  // Düzenleme dialogunu aç
  const handleOpenEditDialog = (room: WaitingRoom) => {
    setEditRoomId(room.id);
    setNewRoomName(room.roomName ?? '');
    setNewMaxPlayers(room.maxPlayers ?? 2);
    setNewRoomType(room.type ?? 'normal');
    setNewStartDateTime(room.startTime ? room.startTime.toDate().toISOString() : '');
    setNewEndDateTime(room.endTime ? room.endTime.toDate().toISOString() : '');
    setNewRoomPassword(room.password ?? '');
    setOpenEditDialog(true);
    setCreateError(null);
    setError(null);
  };

  // Düzenleme dialogunu kapat
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditRoomId(null);
  };

  // Düzenlenen lobi verilerini kaydet
  const handleConfirmEditGame = async () => {
    if (!currentUser || !editRoomId) return;
    if (!newRoomName.trim()) return setCreateError(t('lobby.errorRoomNameEmpty'));
    const roomRef = doc(db, 'gameRooms', editRoomId);
    const updatePayload: UpdateData<WaitingRoom> = {
      roomName: newRoomName.trim(),
      maxPlayers: newMaxPlayers,
      type: newRoomType,
      password: newRoomPassword
    };
    if (newRoomType === 'event') {
      updatePayload.startTime = Timestamp.fromDate(new Date(newStartDateTime));
      updatePayload.endTime = Timestamp.fromDate(new Date(newEndDateTime));
    } else {
      updatePayload.startTime = deleteField();
      updatePayload.endTime = deleteField();
    }
    // Form validasyonları
    if (newRoomType === 'event') {
      if (!newStartDateTime || !newEndDateTime) {
        setCreateError(t('lobby.errorDateRequired'));
        return;
      }
      if (new Date(newStartDateTime) >= new Date(newEndDateTime)) {
        setCreateError(t('lobby.errorDateRange'));
        return;
      }
    }
    if (newRoomPassword && newRoomPassword.length < 4) {
      setCreateError(t('lobby.errorPasswordLength'));
      return;
    }
    try {
      await updateDoc(roomRef, updatePayload);
      showNotification(t('lobby.updateSuccess'), 'success');
      handleCloseEditDialog();
    } catch (e) {
      console.error('Error updating game room:', e);
      showNotification(t('errorFailedToUpdate'), 'error');
    }
  };

  // Modern mobile-first lobby interface
  return (
    <div className="min-h-screen min-h-dvh bg-background safe-area-inset">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 safe-area-top">
        <div className="container-mobile py-6">
          <div className="flex-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex-center backdrop-blur-sm">
                <AddCircleIcon className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('lobbyTitle')}</h1>
                <p className="text-white/80 text-sm">QuickBingo™ Online</p>
              </div>
            </div>
                          <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={() => setIsGameRulesOpen(true)}
                  className="w-10 h-10 flex-center rounded-lg hover:bg-white/10 text-white transition-colors"
                  title="Oyun Kuralları"
                >
                  <span className="text-lg">📖</span>
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-10 h-10 flex-center rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
              <button
                onClick={handleLogout}
                className="btn-ghost text-white hover:bg-white/10 border-white/20"
              >
                Çıkış
              </button>
            </div>
          </div>
          
          {/* Welcome Message */}
          {currentUser && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white font-medium">
                {t('welcome', { name: currentUser.displayName || 'User' })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container-mobile py-6">
        {/* Error Message */}
        {error && !openJoinDialog && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl animate-slide-up">
            <p className="text-error-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid gap-4 mb-8">
          <button
            onClick={handleOpenCreateDialog}
            disabled={hasOwnRoom}
            className={`btn-primary w-full btn-lg ripple ${hasOwnRoom ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <AddCircleIcon className="w-5 h-5" />
            <span>{t('createNewGame')}</span>
          </button>
          
          {hasOwnRoom && (
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-warning-700 text-sm font-medium text-center">
                {t('lobby.oneLobbyRule')}
              </p>
            </div>
          )}
          
          <button
            onClick={() => handleOpenJoinDialog()}
            className="btn-secondary w-full btn-lg ripple"
          >
            <LoginIcon className="w-5 h-5" />
            <span>{t('joinGameCode')}</span>
          </button>
        </div>

        {/* Rooms Section */}
        <div className="space-y-4">
          <div className="flex-between">
            <h2 className="text-xl font-bold text-gray-900">{t('availableGames')}</h2>
            <div className="text-sm text-gray-500">
              {displayRooms.length} oda
            </div>
          </div>
          
          {loadingRooms ? (
            <div className="flex-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex-center mx-auto mb-4">
                <AddCircleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">{t('noWaitingRooms')}</p>
              <p className="text-gray-400 text-sm mt-1">İlk odayı sen oluştur!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayRooms.map((room, index) => {
                const { playerCount, maxPlayers } = getRoomStatusInfo(room);
                const isOwner = currentUser && room.creatorUid === currentUser.uid;
                
                return (
                  <div
                    key={room.id}
                    className="card-modern p-4 hover:shadow-md transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => handleOpenJoinDialog(room)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-start gap-3">
                          {/* Room Type Icon */}
                          <div className={`w-10 h-10 rounded-lg flex-center ${
                            room.type === 'event' 
                              ? 'bg-secondary-100 text-secondary-600' 
                              : 'bg-primary-100 text-primary-600'
                          }`}>
                            {room.type === 'event' ? (
                              <EventIcon className="w-5 h-5" />
                            ) : (
                              <AddCircleIcon className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Room Name */}
                            <h3 className="font-semibold text-gray-900 truncate">
                              {room.roomName || `Oda #${room.id}`}
                            </h3>
                            
                            {/* Creator */}
                            <p className="text-sm text-gray-500 mt-1">
                              {t('createdBy', { name: room.creatorName })}
                            </p>
                            
                            {/* Event Details */}
                            {room.type === 'event' && (
                              <p className="text-xs text-secondary-600 font-medium mt-1">
                                {getEventDetail(room)}
                              </p>
                            )}
                            
                            {/* Player Count & Status */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">
                                  {playerCount}/{maxPlayers} oyuncu
                                </span>
                              </div>
                              
                              {room.password && (
                                <div className="flex items-center gap-1">
                                  <LockIcon className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">Şifreli</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {/* Owner Actions */}
                      {isOwner && (
                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(room); }}
                            className="w-8 h-8 flex-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(room.id);
                              showNotification(t('lobby.copied'), 'success');
                            }}
                            className="w-8 h-8 flex-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ContentCopyIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                            className="w-8 h-8 flex-center rounded-lg hover:bg-error-50 text-gray-400 hover:text-error-600 transition-colors"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

        {/* Modern Join Room Modal */}
        {openJoinDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
            <div className="card-modern max-w-md w-full p-6 animate-scale-in">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('joinRoomTitle')}</h2>
              <p className="text-gray-600 text-sm mb-6">{t('joinRoomPrompt')}</p>
              
              {error && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-error-600 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('roomCodeLabel')}
                  value={roomCodeToJoin}
                  onChange={(e) => setRoomCodeToJoin(e.target.value)}
                  className="input-modern"
                  autoFocus
                />
                
                {selectedRoomForJoin?.password && (
                  <input
                    type="password"
                    placeholder={t('lobby.passwordLabel')}
                    value={joinPassword}
                    onChange={e => setJoinPassword(e.target.value)}
                    className="input-modern"
                  />
                )}
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCloseJoinDialog}
                    className="btn-secondary flex-1"
                  >
                    <CancelIcon className="w-4 h-4" />
                    <span>{t('cancelButton')}</span>
                  </button>
                  <button
                    onClick={handleConfirmJoinGame}
                    disabled={!roomCodeToJoin.trim()}
                    className="btn-primary flex-1"
                  >
                    <span>{t('joinButton')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Create Room Modal */}
        {openCreateDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="card-modern max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold">{t('lobby.createRoomDialogTitle')}</h2>
                <p className="text-indigo-100 text-sm mt-1">{t('lobby.enterRoomNamePlaceholder')}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Error Display */}
                {createError && (
                  <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                    <p className="text-error-600 text-sm">{createError}</p>
                  </div>
                )}
                
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lobby.roomNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Odana bir isim ver..."
                    className="input-modern"
                    autoFocus
                  />
                </div>
                
                {/* Player Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lobby.selectPlayerCount')}
                  </label>
                  <select
                    value={newMaxPlayers}
                    onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                    className="input-modern"
                  >
                    <option value={2}>2 {t('lobby.players')}</option>
                    <option value={3}>3 {t('lobby.players')}</option>
                    <option value={4}>4 {t('lobby.players')}</option>
                  </select>
                </div>
                
                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('lobby.selectType')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewRoomType('normal')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        newRoomType === 'normal'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <span className="block text-lg mb-1">🎮</span>
                        <span className="text-sm font-medium">{t('lobby.normal')}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRoomType('event')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        newRoomType === 'event'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <span className="block text-lg mb-1">📅</span>
                        <span className="text-sm font-medium">{t('lobby.event')}</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Event Date Times - Only show for event type */}
                {newRoomType === 'event' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('lobby.startDateTime')}
                      </label>
                      <input
                        type="datetime-local"
                        value={newStartDateTime ? new Date(newStartDateTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setNewStartDateTime(e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('lobby.endDateTime')}
                      </label>
                      <input
                        type="datetime-local"
                        value={newEndDateTime ? new Date(newEndDateTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setNewEndDateTime(e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="input-modern"
                      />
                    </div>
                  </div>
                )}
                
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lobby.passwordLabel')} <span className="text-gray-400">(İsteğe bağlı)</span>
                  </label>
                  <input
                    type="password"
                    value={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.value)}
                    placeholder="Oda şifresi..."
                    className="input-modern"
                  />
                  <p className="text-xs text-gray-500 mt-1">Şifre en az 3 karakter olmalıdır</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseCreateDialog}
                    className="btn-secondary flex-1"
                  >
                    <CancelIcon className="w-4 h-4" />
                    <span>{t('common.cancel')}</span>
                  </button>
                  <button
                    onClick={handleConfirmCreateGame}
                    disabled={!newRoomName.trim()}
                    className="btn-primary flex-1"
                  >
                    <AddCircleIcon className="w-4 h-4" />
                    <span>{t('lobby.createButton')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{display: 'none'}}> {/* Hidden MUI dialogs */}
        <Dialog open={false} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
          <DialogTitle>{t('lobby.createRoomDialogTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t('lobby.enterRoomNamePlaceholder')}
            </DialogContentText>
            {createError && <Typography color="error" sx={{ mb: 1 }}>{createError}</Typography>}
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="max-players-label">{t('lobby.selectPlayerCount')}</InputLabel>
                <Select
                  labelId="max-players-label"
                  value={newMaxPlayers}
                  label={t('lobby.selectPlayerCount')}
                  onChange={e => setNewMaxPlayers(Number(e.target.value))}
                >
                  <MenuItem value={2}>2 {t('lobby.players')}</MenuItem>
                  <MenuItem value={3}>3 {t('lobby.players')}</MenuItem>
                  <MenuItem value={4}>4 {t('lobby.players')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label={t('lobby.passwordLabel')}
                type="password"
                fullWidth
                variant="outlined"
                value={newRoomPassword}
                onChange={e => setNewRoomPassword(e.target.value)}
              />
              <TextField
                autoFocus
                margin="dense"
                label={t('lobby.roomNameLabel')}
                type="text"
                fullWidth
                variant="outlined"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                error={!!createError}
              />
              <FormControl component="fieldset">
                <RadioGroup row value={newRoomType} onChange={e => setNewRoomType(e.target.value as 'normal' | 'event')}>
                  <FormControlLabel value="normal" control={<Radio />} label={t('lobby.normal')} />
                  <FormControlLabel value="event" control={<Radio />} label={t('lobby.event')} />
                </RadioGroup>
              </FormControl>
              {newRoomType === 'event' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('lobby.startDateTime')}
                      value={newStartDateTime ? new Date(newStartDateTime) : null}
                      onChange={val => setNewStartDateTime(val ? val.toISOString() : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('lobby.endDateTime')}
                      value={newEndDateTime ? new Date(newEndDateTime) : null}
                      onChange={val => setNewEndDateTime(val ? val.toISOString() : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} size="large" sx={{ borderRadius: 2 }} variant="outlined">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmCreateGame} size="large" sx={{ borderRadius: 2 }} variant="contained">
              {t('lobby.createButton')}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Modern Room Created Success Modal */}
        {showCreatedDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="card-modern max-w-md w-full animate-scale-in">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t('lobby.createdTitle')}</h2>
                    <p className="text-emerald-100 text-sm">{t('lobby.createdMessage', { code: createdRoomCode })}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Room Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lobby.roomCodeLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={createdRoomCode || ''}
                      className="input-modern flex-1 font-mono text-center font-bold text-lg"
                    />
                    <button
                      onClick={() => {
                        const textToCopy = `Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : '');
                        navigator.clipboard.writeText(textToCopy);
                        setSnackbarMessage(t('common.copySuccess'));
                        setSnackbarSeverity('success');
                        setSnackbarOpen(true);
                      }}
                      className="btn-secondary !px-3"
                    >
                      <ContentCopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Password (if set) */}
                {newRoomPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('lobby.passwordLabel')}
                    </label>
                    <input
                      readOnly
                      value={newRoomPassword}
                      type="password"
                      className="input-modern font-mono text-center"
                    />
                  </div>
                )}
                
                {/* Social Share */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Arkadaşlarını davet et:</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
                        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
                      }}
                      className="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex-center transition-colors"
                    >
                      <FacebookIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
                        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                      }}
                      className="w-10 h-10 bg-blue-400 text-white rounded-lg hover:bg-blue-500 flex-center transition-colors"
                    >
                      <TwitterIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
                        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                      }}
                      className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 flex-center transition-colors"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Oda Kodu: ${createdRoomCode}` + (newRoomPassword ? `\nŞifre: ${newRoomPassword}` : ''));
                        window.open(`https://t.me/share/url?text=${text}`, '_blank');
                      }}
                      className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-center transition-colors"
                    >
                      <TelegramIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreatedDialog(false)}
                    className="btn-secondary flex-1"
                  >
                    Daha Sonra
                  </button>
                  <button
                    onClick={() => { 
                      setShowCreatedDialog(false); 
                      navigate(`/game/${createdRoomCode}`); 
                    }}
                    className="btn-primary flex-1"
                  >
                    <span>🎮</span>
                    <span>{t('lobby.enterNow')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Lobi Düzenleme Dialogu */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>{t('lobby.editRoomDialogTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t('lobby.editRoomInstruction')}</DialogContentText>
            {createError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {createError}
              </Typography>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="edit-max-players-label">{t('lobby.selectPlayerCount')}</InputLabel>
              <Select
                labelId="edit-max-players-label"
                value={newMaxPlayers}
                label={t('lobby.selectPlayerCount')}
                onChange={e => setNewMaxPlayers(Number(e.target.value))}
              >
                <MenuItem value={2}>2 {t('lobby.players')}</MenuItem>
                <MenuItem value={3}>3 {t('lobby.players')}</MenuItem>
                <MenuItem value={4}>4 {t('lobby.players')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="edit-roomName"
              label={t('lobby.roomNameLabel')}
              type="text"
              fullWidth
              variant="standard"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              error={!!createError}
            />
            {/* Oda Tipi Seçimi */}
            <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
              <Typography component="legend">{t('lobby.selectType')}</Typography>
              <RadioGroup row value={newRoomType} onChange={e => setNewRoomType(e.target.value as 'normal' | 'event')}>
                <FormControlLabel value="normal" control={<Radio />} label={t('lobby.normal')} />
                <FormControlLabel value="event" control={<Radio />} label={t('lobby.event')} />
              </RadioGroup>
            </FormControl>
            {newRoomType === 'event' && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('lobby.startDateTime')}
                  value={newStartDateTime ? new Date(newStartDateTime) : null}
                  onChange={val => setNewStartDateTime(val ? val.toISOString() : '')}
                  slotProps={{ textField: { margin: 'dense', fullWidth: true, sx: { mt: 2 } } }}
                />
                <DateTimePicker
                  label={t('lobby.endDateTime')}
                  value={newEndDateTime ? new Date(newEndDateTime) : null}
                  onChange={val => setNewEndDateTime(val ? val.toISOString() : '')}
                  slotProps={{ textField: { margin: 'dense', fullWidth: true, sx: { mt: 2 } } }}
                />
              </LocalizationProvider>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="edit-roomPassword"
              label={t('lobby.passwordLabel')}
              type="password"
              fullWidth
              variant="standard"
              value={newRoomPassword}
              onChange={e => setNewRoomPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>{t('common.cancel')}</Button>
            <Button onClick={handleConfirmEditGame}>{t('common.save')}</Button>
          </DialogActions>
        </Dialog>
        {/* Global Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        </div> {/* End hidden MUI dialogs */}
        
        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        
        {/* Game Rules Modal */}
        <GameRules 
          isOpen={isGameRulesOpen} 
          onClose={() => setIsGameRulesOpen(false)} 
        />
        
        {/* Footer */}
        <Footer />
    </div>
  );
};

export default MainLobby;