import { Platform } from 'react-native';
import { supabase } from './supabase';

// RevenueCat types (when SDK is installed)
export interface SubscriptionPackage {
  identifier: string;
  product: {
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
  packageType: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
}

export interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'billing_issue';
  started_at: string | null;
  expires_at: string | null;
  trial_ends_at: string | null;
  revenue_cat_id: string | null;
}

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
}) || '';

let purchasesInitialized = false;

export async function initializePurchases(userId: string): Promise<void> {
  if (purchasesInitialized || !REVENUECAT_API_KEY) {
    console.warn('RevenueCat not configured or already initialized');
    return;
  }

  try {
    // In production, uncomment when react-native-purchases is installed:
    // const Purchases = require('react-native-purchases').default;
    // Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
    purchasesInitialized = true;
  } catch (error) {
    console.error('Error initializing purchases:', error);
  }
}

export async function getSubscriptionInfo(
  userId: string
): Promise<SubscriptionInfo> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return {
        plan: 'free',
        status: 'active',
        started_at: null,
        expires_at: null,
        trial_ends_at: null,
        revenue_cat_id: null,
      };
    }

    return {
      plan: data.plan || 'free',
      status: data.status || 'active',
      started_at: data.started_at,
      expires_at: data.expires_at,
      trial_ends_at: data.trial_ends_at,
      revenue_cat_id: data.revenue_cat_id,
    };
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return {
      plan: 'free',
      status: 'active',
      started_at: null,
      expires_at: null,
      trial_ends_at: null,
      revenue_cat_id: null,
    };
  }
}

export async function getOfferings(): Promise<SubscriptionPackage[]> {
  try {
    // In production with RevenueCat:
    // const Purchases = require('react-native-purchases').default;
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.availablePackages || [];

    // Placeholder offerings for development
    return [
      {
        identifier: 'zerotilt_pro_monthly',
        product: {
          title: 'Pro Monthly',
          description: 'Full access to all ZERO TILT features',
          price: 9.99,
          priceString: '$9.99',
          currencyCode: 'USD',
        },
        packageType: 'MONTHLY',
      },
      {
        identifier: 'zerotilt_pro_yearly',
        product: {
          title: 'Pro Yearly',
          description: 'Full access — save 50%! Includes 7-day free trial',
          price: 59.99,
          priceString: '$59.99',
          currencyCode: 'USD',
        },
        packageType: 'ANNUAL',
      },
      {
        identifier: 'zerotilt_pro_lifetime',
        product: {
          title: 'Pro Lifetime',
          description: 'One-time purchase — forever access',
          price: 149.99,
          priceString: '$149.99',
          currencyCode: 'USD',
        },
        packageType: 'LIFETIME',
      },
    ];
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return [];
  }
}

export async function purchasePackage(
  packageId: string
): Promise<boolean> {
  try {
    // In production with RevenueCat:
    // const Purchases = require('react-native-purchases').default;
    // const { customerInfo } = await Purchases.purchasePackage(pkg);
    // return customerInfo.entitlements.active['pro'] !== undefined;

    console.log('Purchase attempted for package:', packageId);
    return false;
  } catch (error) {
    console.error('Error purchasing package:', error);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    // In production with RevenueCat:
    // const Purchases = require('react-native-purchases').default;
    // const customerInfo = await Purchases.restorePurchases();
    // return customerInfo.entitlements.active['pro'] !== undefined;

    console.log('Restore purchases attempted');
    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
}

// Free tier limits
export const FREE_LIMITS = {
  journal_entries_per_week: 3,
  community_posts_per_week: 2,
  coach_messages_per_day: 3,
  max_goals: 3,
  max_pods: 1,
  max_checklist_items: 5,
  available_games: ['memory'],
} as const;

export function checkLimit(
  feature: keyof typeof FREE_LIMITS,
  currentCount: number,
  isPro: boolean
): { allowed: boolean; remaining: number } {
  if (isPro) return { allowed: true, remaining: Infinity };

  const limit = FREE_LIMITS[feature];
  if (typeof limit === 'number') {
    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
    };
  }
  return { allowed: true, remaining: Infinity };
}
