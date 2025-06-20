/**
 * src/App.tsx: Tombala uygulamasının kök bileşeni. Router ve context sağlayıcılarını içerir.
 * Uygulamanın kökünde router ve context provider'ları sarmalar.
 * Kimlik doğrulama, bildirim, ses ve tema yönetimi için context sağlar.
 * Rota koruması için PrivateRoute kullanılır. Çoklu dil desteği içerir.
 * Mobile platform özelliklerini entegre eder.
 *
 * @returns {JSX.Element} Uygulamanın kök bileşeni.
 */
// Router: sayfa ve URL tabanlı gezinmeyi sağlar
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
// Context sağlayıcıları: kimlik, bildirim, ses ve tema modlarını sağlar
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SoundProvider } from './contexts/SoundContext';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MainLobby from './components/Lobby/MainLobby';
import GameScreen from './components/Game/GameScreen';
// Mobile özellikler hook'u
import { useMobileFeatures } from './hooks/useMobileFeatures';
// Remove import for non-existent ResetPassword component
// import ResetPassword from './components/Auth/ResetPassword';
import { Toaster } from 'react-hot-toast';

// App bileşeni: Router ve tüm Context sağlayıcılarını saran kök uygulama bileşeni
function App() {
  const { isNative, addBackButtonListener, addAppStateListener, networkStatus } = useMobileFeatures();

  useEffect(() => {
    // Android back button handler
    const removeBackButtonListener = addBackButtonListener(() => {
      // Back button'a basıldığında uygulamayı background'a gönder
      return false; // false döndürerek default davranışı kullan
    });

    // App state değişikliklerini dinle
    const removeAppStateListener = addAppStateListener((isActive) => {
      console.log('App is', isActive ? 'active' : 'background');
      // Uygulama background'a giderse ses efektlerini durdur
      if (!isActive) {
        // Burada gerekirse ses efektlerini durdurabilirsiniz
      }
    });

    return () => {
      removeBackButtonListener();
      removeAppStateListener();
    };
  }, [addBackButtonListener, addAppStateListener]);

  // Network durumu kontrolü
  useEffect(() => {
    if (!networkStatus.connected) {
      console.warn('Network connection lost');
      // Burada network kaybı durumunda kullanıcıyı bilgilendirebilirsiniz
    }
  }, [networkStatus.connected]);

  return (
    <Router>
      {/* AuthProvider: kimlik doğrulama durumunu yönetir */}
      <AuthProvider>
        {/* NotificationProvider: uygulama içi bildirimleri yönetir */}
        <NotificationProvider>
          {/* SoundProvider: ses efektleri ve mute durumunu sağlar */}
          <SoundProvider>
            {/* ThemeModeProvider: koyu/açık tema modunu kontrol eder */}
            <ThemeModeProvider>
              {/* Toaster: global toast bildirimi bileşeni */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: '8px',
                    background: '#333',
                    color: '#fff',
                  },
                  duration: 3000
                }}
              />
              {/* Network durumu uyarısı */}
              {isNative && !networkStatus.connected && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '8px',
                  textAlign: 'center',
                  zIndex: 9999,
                  fontSize: '14px'
                }}>
                  İnternet bağlantısı yok
                </div>
              )}
              {/* Uygulama rotaları: giriş, kayıt, lobi ve oyun ekranları */}
              <Routes>
                {/* Giriş ekranı */}
                <Route path="/giris" element={<Login />} />
                {/* Kayıt ekranı */}
                <Route path="/kayit" element={<Signup />} />
                {/* Ana lobi, sadece giriş yapan kullanıcılar erişebilir */}
                <Route 
                  path="/lobby" 
                  element={
                    <PrivateRoute>
                      <MainLobby />
                    </PrivateRoute>
                  } 
                />
                {/* Oyun ekranı, sadece giriş yapan kullanıcılar erişebilir */}
                <Route 
                  path="/game/:roomId" 
                  element={
                    <PrivateRoute>
                      <GameScreen />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Login />} />
              </Routes>
            </ThemeModeProvider>
          </SoundProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

// Varsayılan olarak App bileşenini dışa aktarır
export default App;