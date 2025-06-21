import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card-modern max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-amber-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">QuickBingo™ Online</h2>
              <p className="text-indigo-100 text-sm">Modern Çok Oyunculu Tombala</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* App Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Uygulama Bilgileri</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Versiyon:</strong> 2.0.0</p>
                <p><strong>Son Güncelleme:</strong> 2025</p>
                <p><strong>Platform:</strong> Web, iOS, Android</p>
                <p><strong>Teknoloji:</strong> React + TypeScript</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Özellikler</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gerçek zamanlı çok oyunculu oyun</li>
                <li>• Modern mobil-öncelikli tasarım</li>
                <li>• Türkçe ve İngilizce dil desteği</li>
                <li>• Ses efektleri ve müzik</li>
                <li>• Başarım sistemi</li>
                <li>• Sosyal paylaşım</li>
                <li>• Çevrimdışı mod desteği</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Geliştirici</h3>
              <div className="text-sm text-gray-600">
                <p><strong>MTG Softworks</strong></p>
                <p>Modern yazılım çözümleri</p>
                <p className="mt-2">
                  <a 
                    href="mailto:contact@mtgsoftworks.com" 
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    contact@mtgsoftworks.com
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Teşekkürler</h3>
              <p className="text-sm text-gray-600">
                React, TypeScript, Firebase, Tailwind CSS ve diğer açık kaynak 
                projelere teşekkürler. Bu uygulama sevgi ile geliştirilmiştir.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Kapat
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <footer className={`text-center py-4 px-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
          <span>© 2025 MTG Softworks</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
          >
            QuickBingo™ Online
          </button>
          <span className="hidden sm:inline">•</span>
          <span>All Rights Reserved</span>
        </div>
      </footer>

      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
    </>
  );
};

export default Footer; 