import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Trophy, Users, Clock, Target, Zap, Star } from 'lucide-react';

interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameRules: React.FC<GameRulesProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const rules = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Oyuncu Sayısı",
      description: "2-4 oyuncu arasında oynanan çok oyunculu tombala oyunu",
      details: ["Minimum 2 oyuncu gereklidir", "En fazla 4 oyuncu katılabilir", "Arkadaşlarını davet edebilirsin"]
    },
    {
      icon: <Target className="w-6 h-6 text-green-500" />,
      title: "Oyun Amacı",
      description: "Kartındaki sayıları ilk tamamlayan oyuncu kazanır",
      details: ["15 sayılık kartın tamamını doldur", "Sayılar çekildiğinde kartında varsa işaretle", "İlk tamamlayan 'BINGO!' diye bağırır"]
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: "Oyun Süreci",
      description: "Sırayla sayılar çekilir ve oyuncular kartlarını kontrol eder",
      details: ["Her turda bir sayı çekilir", "Sayı kartında varsa otomatik işaretlenir", "5 saniye içinde sonraki sayıya geçilir"]
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: "Kazanma Koşulları",
      description: "Kartındaki 15 sayının tamamını işaretleyen oyuncu kazanır",
      details: ["Tüm sayılar işaretlenmeli", "Sistem otomatik kontrol eder", "Kazanan oyuncuya puan verilir"]
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: "Özel Özellikler",
      description: "Oyunu daha eğlenceli hale getiren ekstra özellikler",
      details: ["Ses efektleri ve müzik", "Anlık sohbet sistemi", "Başarım rozetleri", "İstatistik takibi"]
    },
    {
      icon: <Star className="w-6 h-6 text-pink-500" />,
      title: "Puanlama Sistemi",
      description: "Kazandığın oyunlardan puan kazan ve seviye atla",
      details: ["Kazanılan her oyun: +10 puan", "Hızlı kazanma bonusu: +5 puan", "Günlük giriş bonusu: +2 puan"]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="card-modern max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Oyun Kuralları</h2>
                <p className="text-indigo-100 text-sm">QuickBingo™ Online nasıl oynanır?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quick Start Guide */}
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
            <h3 className="font-bold text-lg text-emerald-700 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Hızlı Başlangıç
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-emerald-700">Oda Oluştur</p>
                  <p className="text-emerald-600">Yeni bir oyun odası aç veya mevcut odaya katıl</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-emerald-700">Kartını Al</p>
                  <p className="text-emerald-600">15 rastgele sayı ile dolu kartın oluşturulur</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-emerald-700">Oyuna Başla</p>
                  <p className="text-emerald-600">Sayılar çekilmeye başlar, kartını işaretle!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Rules */}
          <div className="grid gap-6">
            {rules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-modern p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-center">
                    {rule.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{rule.title}</h4>
                    <p className="text-gray-600 mb-3">{rule.description}</p>
                    <ul className="space-y-1">
                      {rule.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-gray-500 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-lg text-amber-700 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Oyun İpuçları
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-600">
              <div>
                <p className="font-medium mb-1">🎯 Stratejik Oyun</p>
                <p>Kartını dikkatli incele ve hangi sayıların daha sık çıktığını takip et</p>
              </div>
              <div>
                <p className="font-medium mb-1">⚡ Hızlı Tepki</p>
                <p>Sayılar hızlı çekilir, kartında varsa hemen işaretle</p>
              </div>
              <div>
                <p className="font-medium mb-1">🎵 Sesli Oyun</p>
                <p>Ses efektlerini aç, çekilen sayıları duymak avantaj sağlar</p>
              </div>
              <div>
                <p className="font-medium mb-1">💬 Sohbet Et</p>
                <p>Diğer oyuncularla sohbet ederek oyunu daha eğlenceli hale getir</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="btn-primary px-8"
            >
              <Trophy className="w-5 h-5" />
              <span>Oyuna Başla!</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameRules; 