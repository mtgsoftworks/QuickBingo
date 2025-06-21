import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdOptions, RewardAdOptions } from '@capacitor-community/admob';

// AdMob Ad Unit IDs
const AD_UNITS = {
  banner: 'ca-app-pub-2923372871861852/1163685038',
  interstitial: 'ca-app-pub-2923372871861852/8850603369',
  rewarded: 'ca-app-pub-2923372871861852/7537521694',
  // Test IDs for development
  bannerTest: 'ca-app-pub-3940256099942544/6300978111',
  interstitialTest: 'ca-app-pub-3940256099942544/1033173712',
  rewardedTest: 'ca-app-pub-3940256099942544/5224354917',
};

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

  // Check if we're in development mode
  const isDev = import.meta.env.DEV;
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      initializeAdMob();
    }
  }, []);

  const initializeAdMob = async () => {
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: isDev ? ['YOUR_DEVICE_ID'] : [],
        initializeForTesting: isDev,
      });
      setIsInitialized(true);
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  };

  const showBanner = async (position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER) => {
    if (!isInitialized || !isNative) return;

    try {
      const options: BannerAdOptions = {
        adId: isDev ? AD_UNITS.bannerTest : AD_UNITS.banner,
        adSize: BannerAdSize.BANNER,
        position,
        margin: 0,
        isTesting: isDev,
      };

      await AdMob.showBanner(options);
      setIsBannerLoaded(true);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  };

  const hideBanner = async () => {
    if (!isNative) return;

    try {
      await AdMob.hideBanner();
      setIsBannerLoaded(false);
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  };

  const loadInterstitial = async () => {
    if (!isInitialized || !isNative) return;

    try {
      const options: InterstitialAdOptions = {
        adId: isDev ? AD_UNITS.interstitialTest : AD_UNITS.interstitial,
        isTesting: isDev,
      };

      await AdMob.prepareInterstitial(options);
      setIsInterstitialLoaded(true);
      console.log('Interstitial ad loaded');
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
    }
  };

  const showInterstitial = async () => {
    if (!isInterstitialLoaded || !isNative) return;

    try {
      await AdMob.showInterstitial();
      setIsInterstitialLoaded(false);
      console.log('Interstitial ad shown');
      // Preload next interstitial
      setTimeout(() => loadInterstitial(), 1000);
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    }
  };

  const loadRewarded = async () => {
    if (!isInitialized || !isNative) return;

    try {
      const options: RewardAdOptions = {
        adId: isDev ? AD_UNITS.rewardedTest : AD_UNITS.rewarded,
        isTesting: isDev,
      };

      await AdMob.prepareRewardVideoAd(options);
      setIsRewardedLoaded(true);
      console.log('Rewarded ad loaded');
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
    }
  };

  const showRewarded = async (): Promise<boolean> => {
    if (!isRewardedLoaded || !isNative) return false;

    try {
      const result = await AdMob.showRewardVideoAd();
      setIsRewardedLoaded(false);
      console.log('Rewarded ad shown, reward:', result);
      // Preload next rewarded ad
      setTimeout(() => loadRewarded(), 1000);
      return true;
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return false;
    }
  };

  // Preload ads when initialized
  useEffect(() => {
    if (isInitialized && isNative) {
      loadInterstitial();
      loadRewarded();
    }
  }, [isInitialized]);

  return {
    isInitialized,
    isNative,
    isBannerLoaded,
    isInterstitialLoaded,
    isRewardedLoaded,
    showBanner,
    hideBanner,
    showInterstitial,
    showRewarded,
    loadInterstitial,
    loadRewarded,
  };
}; 