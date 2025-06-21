/**
 * src/components/Auth/Login.tsx: Kullanıcıların giriş yapmasını sağlayan bileşen.
 * Firebase Auth ile Google veya anonim kullanıcı olarak giriş yapılabilir.
 * Hatalar kullanıcıya bildirilir. Çoklu dil desteği vardır.
 *
 * @returns {JSX.Element} Giriş formu veya hata mesajı.
 */
import React, { useState } from 'react'; // React ve useState hook'unu içe aktar
import { signInWithPopup, signInAnonymously, updateProfile } from 'firebase/auth'; // signInWithPopup: Google ile giriş, signInAnonymously: anonim giriş, updateProfile: kullanıcı profilini güncelleme
import { auth, googleProvider } from '../../config/firebase'; // Firebase auth ve Google sağlayıcısını içe aktar
import { useNavigate } from 'react-router-dom'; // useNavigate hook'unu içe aktar
import { useTranslation } from 'react-i18next'; // useTranslation hook'unu içe aktar
import LanguageSwitcher from '../UI/LanguageSwitcher'; // Dil değiştirme bileşenini içe aktar
import { LogIn, Users } from 'lucide-react'; // LogIn ve Users ikonlarını içe aktar
import Footer from '../UI/Footer'; // Footer bileşenini içe aktar

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [anonNickname, setAnonNickname] = useState('');
  const navigate = useNavigate();

  // handleGoogleSignIn fonksiyonu: Google ile giriş işlemini başlatır ve hata olursa kullanıcıya bildirir
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/lobby');
    } catch (error: unknown) {
      // Hata durumunda kullanıcıya Türkçe hata mesajı göster
      if (error instanceof Error) {
        console.error("Google ile Giriş Hatası:", error);
        setError(`${t('auth.googleSignInError')}: ${error.message}`);
      } else {
        console.error("Google ile Giriş Hatası:", error);
        setError(`${t('auth.googleSignInError')}: ${String(error)}`);
      }
    }
  };

  // handleAnonymousSignIn fonksiyonu: Kullanıcı takma ad girerek anonim giriş yapar
  const handleAnonymousSignIn = async () => {
    setError('');
    if (!anonNickname.trim()) {
      setError('Lütfen bir takma ad girin');
      return;
    }
    try {
      const userCred = await signInAnonymously(auth);
      if (userCred.user) {
        await updateProfile(userCred.user, { displayName: anonNickname.trim() });
      }
      navigate('/lobby');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Anonim Giriş Hatası:", error);
        setError(`${t('auth.anonymousSignInError')}: ${error.message}`);
      } else {
        console.error("Anonim Giriş Hatası:", error);
        setError(`${t('auth.anonymousSignInError')}: ${String(error)}`);
      }
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center safe-area-inset">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="container-mobile relative z-10">
        <div className="max-w-md mx-auto">
          {/* Main Card with Glass Effect */}
          <div className="card-modern glass-effect backdrop-blur-xl bg-white/90 p-6 md:p-8 animate-scale-in">
            {/* Header */}
            <div className="flex-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex-center shadow-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('auth.login')}</h1>
                  <p className="text-sm text-gray-500">QuickBingo™</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>
            
            {/* Welcome Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
              <h3 className="font-semibold text-lg text-primary-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                {t('auth.welcomeToBingo')}
              </h3>
              <p className="text-primary-600 mb-4 text-sm leading-relaxed">
                {t('auth.gameDescription')}
              </p>
              <div className="flex items-center text-primary-600">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                <span className="text-sm font-medium">{t('auth.twoPlayerGame')}</span>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl animate-slide-up">
                <p className="text-error-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {/* Login Actions */}
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 touch-target-comfortable shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-center gap-3">
                  <img
                    className="h-5 w-5 group-hover:scale-110 transition-transform"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                  />
                  <span>{t('auth.googleSignIn')}</span>
                </div>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">veya</span>
                </div>
              </div>

              {/* Anonymous Login */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={anonNickname}
                  onChange={e => setAnonNickname(e.target.value)}
                  placeholder="Takma adınızı girin"
                  className="input-modern"
                />
                <button
                  onClick={handleAnonymousSignIn}
                  className="btn-primary w-full btn-lg ripple"
                >
                  <Users className="w-5 h-5" />
                  <span>{t('auth.playAnonymously')}</span>
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
              {t('auth.loginDisclaimer')}
            </p>
          </div>
          
          {/* Copyright Footer */}
          <Footer className="mt-8" />
        </div>
      </div>
    </div>
  );
};

export default Login;