/**
 * src/services/admobService.ts: QuickBingo AdMob entegrasyonu
 * Oyun için optimize edilmiş reklam gösterimi ve yönetimi
 */

import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdOptions, RewardAdOptions, AdMobError } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Production reklam ID'leri
const AD_UNITS = {
  banner: 'ca-app-pub-2923372871861852/1163685038', // Production Banner ID
  interstitial: 'ca-app-pub-2923372871861852/8850603369', // Production Interstitial ID
  rewarded: 'ca-app-pub-2923372871861852/7537521694', // Production Rewarded ID
};

class AdMobService {
  private isInitialized = false;
  private isBannerShowing = false;

  /**
   * AdMob'u başlatır
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('AdMob sadece native platformlarda çalışır');
      return;
    }

    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [], // Production için test cihazları kaldırıldı
        initializeForTesting: false, // Production için false
      });
      this.isInitialized = true;
      console.log('AdMob başarıyla başlatıldı');
    } catch (error) {
      console.error('AdMob başlatılırken hata:', error);
    }
  }

  /**
   * Banner reklam gösterir (lobi alt kısmında)
   */
  async showBannerAd(): Promise<void> {
    if (!this.isInitialized || this.isBannerShowing) return;

    const options: BannerAdOptions = {
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false, // Production için false
    };

    try {
      await AdMob.showBanner(options);
      this.isBannerShowing = true;
      console.log('Banner reklam gösterildi');
    } catch (error) {
      console.error('Banner reklam gösterilirken hata:', error);
    }
  }

  /**
   * Banner reklamı gizler
   */
  async hideBannerAd(): Promise<void> {
    if (!this.isBannerShowing) return;

    try {
      await AdMob.hideBanner();
      this.isBannerShowing = false;
      console.log('Banner reklam gizlendi');
    } catch (error) {
      console.error('Banner reklam gizlenirken hata:', error);
    }
  }

  /**
   * Tam ekran reklam gösterir (oyun aralarında)
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized) return false;

    const options: InterstitialAdOptions = {
      adId: AD_UNITS.interstitial,
      isTesting: false, // Production için false
    };

    try {
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      console.log('Interstitial reklam gösterildi');
      return true;
    } catch (error) {
      console.error('Interstitial reklam gösterilirken hata:', error);
      return false;
    }
  }

  /**
   * Ödüllü reklam gösterir (ekstra özellikler için)
   */
  async showRewardedAd(): Promise<{ watched: boolean; reward?: any }> {
    if (!this.isInitialized) return { watched: false };

    const options: RewardAdOptions = {
      adId: AD_UNITS.rewarded,
      isTesting: false, // Production için false
    };

    try {
      await AdMob.prepareRewardVideoAd(options);
      const result = await AdMob.showRewardVideoAd();
      console.log('Ödüllü reklam tamamlandı:', result);
      return { watched: true, reward: result };
    } catch (error) {
      console.error('Ödüllü reklam gösterilirken hata:', error);
      return { watched: false };
    }
  }

  /**
   * QuickBingo için optimize edilmiş reklam stratejisi
   */
  async handleGameEndAd(gamesPlayed: number): Promise<void> {
    // Her 3 oyunda bir interstitial göster
    if (gamesPlayed > 0 && gamesPlayed % 3 === 0) {
      await this.showInterstitialAd();
    }
  }

  /**
   * Premium özellik ödüllü reklamı
   */
  async offerPremiumFeature(feature: 'extra_cards' | 'auto_mark' | 'themes'): Promise<boolean> {
    const result = await this.showRewardedAd();
    if (result.watched) {
      console.log(`${feature} özelliği reklam izlenerek açıldı`);
      return true;
    }
    return false;
  }

  /**
   * Temizlik - uygulama kapanırken
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isBannerShowing) {
        await this.hideBannerAd();
      }
    } catch (error) {
      console.error('AdMob temizlik hatası:', error);
    }
  }
}

export const adMobService = new AdMobService();
export default adMobService; 