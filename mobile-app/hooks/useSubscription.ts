import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  SubscriptionInfo,
  SubscriptionPackage,
  getSubscriptionInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  initializePurchases,
  checkLimit,
  FREE_LIMITS,
} from '../services/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [offerings, setOfferings] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = subscription?.plan !== 'free' && subscription?.status === 'active';

  useEffect(() => {
    async function init() {
      if (!user) return;

      try {
        await initializePurchases(user.id);
        const [subInfo, offeringsData] = await Promise.all([
          getSubscriptionInfo(user.id),
          getOfferings(),
        ]);
        setSubscription(subInfo);
        setOfferings(offeringsData);
      } catch (error) {
        console.error('Error initializing subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [user]);

  const purchase = useCallback(async (pkg: SubscriptionPackage) => {
    track('paywall_plan_selected', { plan: pkg.packageType.toLowerCase() });

    const success = await purchasePackage(pkg.identifier);
    if (success) {
      track('subscription_started', {
        plan: pkg.packageType.toLowerCase(),
        price: pkg.product.price,
        has_trial: pkg.packageType === 'ANNUAL',
      });

      // Refresh subscription info
      if (user) {
        const subInfo = await getSubscriptionInfo(user.id);
        setSubscription(subInfo);
      }
    }
    return success;
  }, [user, track]);

  const restore = useCallback(async () => {
    const success = await restorePurchases();
    if (success && user) {
      track('subscription_restored', { plan: subscription?.plan || 'unknown' });
      const subInfo = await getSubscriptionInfo(user.id);
      setSubscription(subInfo);
    }
    return success;
  }, [user, subscription, track]);

  const canUseFeature = useCallback((
    feature: keyof typeof FREE_LIMITS,
    currentCount: number
  ) => {
    return checkLimit(feature, currentCount, isPro);
  }, [isPro]);

  return {
    subscription,
    isPro,
    offerings,
    loading,
    purchase,
    restore,
    canUseFeature,
  };
}
