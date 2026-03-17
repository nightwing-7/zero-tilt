# ZERO TILT — Subscription System

> RevenueCat + Supabase | Version 1.0 | March 2026

## 1. Overview

ZERO TILT uses a freemium model where core features are free and advanced features require a Pro subscription. RevenueCat manages all subscription logic, receipt validation, and app store communication. The app never handles payment processing directly.

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Mobile App      │     │   RevenueCat     │     │  App Store / │
│                  │     │                  │     │  Play Store  │
│  react-native-   │────>│  Validates       │────>│              │
│  purchases SDK   │     │  receipts,       │<────│  Processes   │
│                  │<────│  manages         │     │  payment     │
│                  │     │  entitlements    │     │              │
└──────────┬───────┘     └────────┬─────────┘     └──────────────┘
           │                      │
           │                      │ Webhook
           │                      ▼
           │             ┌──────────────────┐
           │             │  Supabase Edge   │
           │             │  Function        │
           │             │  (webhook-       │
           │             │   revenuecat)    │
           │             └────────┬─────────┘
           │                      │
           │                      ▼
           │             ┌──────────────────┐
           │             │  subscriptions   │
           └────────────>│  table           │
                         │  (Supabase DB)   │
                         └──────────────────┘
```

## 2. Subscription Tiers

### Free Tier

Available to all users immediately after signup. No time limit.

| Feature | Free Tier Access |
|---------|-----------------|
| Streak tracking | Full access |
| Daily pledge | Full access |
| Urge logging | Full access |
| Breathing exercise (panic) | Full access |
| Journal | Limited to 3 entries/week |
| Goals tracking | 3 preset goals only |
| Community (read) | Full access |
| Community (post/comment) | Limited to 2 posts/week |
| Analytics | Basic overview only |
| Pre-trade checklist | 5 default items only |
| Mini-games | 1 game (Memory Match) |
| AI Coach (Mika) | 3 messages/day |
| Pods/Clans | Join 1 pod |
| Share progress | Basic card only |

### Pro Tier

Unlocks all features. Available in three pricing options:

| Plan | Price | Trial | Billing |
|------|-------|-------|---------|
| Pro Monthly | $9.99/month | None | Recurring |
| Pro Yearly | $59.99/year ($5.00/mo) | 7-day free trial | Recurring |
| Pro Lifetime | $149.99 | None | One-time |

| Feature | Pro Tier Access |
|---------|----------------|
| Journal | Unlimited entries |
| Goals tracking | Unlimited goals + custom goals |
| Community posting | Unlimited |
| Analytics | Full (overview + trends + goals breakdown) |
| Pre-trade checklist | Unlimited custom items |
| Mini-games | All 6 games |
| AI Coach (Mika) | Unlimited messages |
| Pods/Clans | Create + join unlimited |
| Share progress | Custom stat cards |
| Badges | Pro-exclusive badges |
| Leaderboard | Full access |
| Priority support | Yes |

## 3. RevenueCat Configuration

### Products (App Store Connect / Google Play Console)

| Product ID | Platform | Type | Price |
|-----------|----------|------|-------|
| `zerotilt_pro_monthly` | iOS + Android | Auto-renewable subscription | $9.99/mo |
| `zerotilt_pro_yearly` | iOS + Android | Auto-renewable subscription | $59.99/yr |
| `zerotilt_pro_lifetime` | iOS + Android | Non-consumable IAP | $149.99 |

### Entitlements

RevenueCat uses "entitlements" to gate features. ZERO TILT has one entitlement:

| Entitlement | Products That Grant It |
|-------------|----------------------|
| `pro` | `zerotilt_pro_monthly`, `zerotilt_pro_yearly`, `zerotilt_pro_lifetime` |

### Offerings

RevenueCat "offerings" define what the user sees on the paywall:

| Offering | Default | Packages |
|----------|---------|----------|
| `default` | Yes | Monthly ($9.99), Yearly ($59.99, highlighted), Lifetime ($149.99) |

## 4. Client Implementation

### Setup

```typescript
// lib/purchases.ts
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  ios: 'appl_XXXXXXXXXXXX',
  android: 'goog_XXXXXXXXXXXX',
};

export async function initializePurchases(userId: string) {
  Purchases.configure({
    apiKey: Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android,
    appUserID: userId, // Supabase user UUID
  });
}
```

### Subscription Hook

```typescript
// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

export function useSubscription() {
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPro(customerInfo.entitlements.active['pro'] !== undefined);
      } catch (e) {
        setIsPro(false);
      }
      setIsLoading(false);
    };

    checkStatus();

    // Listen for changes
    Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      setIsPro(info.entitlements.active['pro'] !== undefined);
    });
  }, []);

  const getOfferings = async () => {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      setOfferings(offerings.current.availablePackages);
    }
    return offerings;
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['pro'] !== undefined;
  };

  const restorePurchases = async () => {
    const customerInfo = await Purchases.restorePurchases();
    const restored = customerInfo.entitlements.active['pro'] !== undefined;
    setIsPro(restored);
    return restored;
  };

  return {
    isPro,
    isLoading,
    offerings,
    getOfferings,
    purchasePackage,
    restorePurchases,
  };
}
```

### Feature Gating Pattern

```typescript
// components/ProGate.tsx
import { useSubscription } from '../hooks/useSubscription';
import { useNavigation } from '@react-navigation/native';

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { isPro } = useSubscription();
  const { track } = useAnalytics();
  const navigation = useNavigation();

  if (isPro) return <>{children}</>;

  // Track that a free user hit a gate
  const handleGate = () => {
    track('feature_gate_hit', { feature_name: feature });
    navigation.navigate('Paywall', { source: 'feature_gate', feature });
  };

  if (fallback) return <>{fallback}</>;

  return (
    <TouchableOpacity onPress={handleGate}>
      <LockedFeatureCard feature={feature} />
    </TouchableOpacity>
  );
}

// Usage
<ProGate feature="advanced_analytics">
  <TrendsChart data={trendData} />
</ProGate>

<ProGate feature="unlimited_journal" fallback={<JournalLimitBanner />}>
  <JournalEntryForm />
</ProGate>
```

### Free Tier Limits

```typescript
// lib/limits.ts
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
```

## 5. Server-Side Validation

### RevenueCat Webhook Handler

```typescript
// supabase/functions/webhook-revenuecat/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
  // Verify webhook authenticity
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const event = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const userId = event.event.app_user_id;
  const eventType = event.event.type;
  const productId = event.event.product_id;

  const plan = productId?.includes('monthly') ? 'monthly'
    : productId?.includes('yearly') ? 'yearly'
    : productId?.includes('lifetime') ? 'lifetime'
    : 'free';

  switch (eventType) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: event.event.expiration_at_ms
          ? new Date(event.event.expiration_at_ms).toISOString()
          : null,
        revenue_cat_id: event.event.original_app_user_id,
      }, { onConflict: 'user_id' });
      break;

    case 'CANCELLATION':
      await supabase.from('subscriptions').update({
        status: 'cancelled',
      }).eq('user_id', userId);
      break;

    case 'EXPIRATION':
      await supabase.from('subscriptions').update({
        plan: 'free',
        status: 'expired',
      }).eq('user_id', userId);
      break;

    case 'BILLING_ISSUE':
      // Grace period — keep pro access but flag it
      await supabase.from('subscriptions').update({
        status: 'billing_issue',
      }).eq('user_id', userId);
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

### Double-Check on Server

For sensitive feature gates (e.g., coach message limits), the Edge Function also checks the subscription status from the database — not just the client's claim:

```typescript
// In coach-message edge function
const { data: sub } = await supabase
  .from('subscriptions')
  .select('plan, status')
  .eq('user_id', userId)
  .single();

const isPro = sub?.plan !== 'free' && sub?.status === 'active';

if (!isPro) {
  // Check daily message count
  const { count } = await supabase
    .from('coach_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart);

  if (count >= 3) {
    return new Response(
      JSON.stringify({ error: 'Daily coach limit reached. Upgrade to Pro for unlimited access.' }),
      { status: 429 }
    );
  }
}
```

## 6. Paywall Screen Behavior

### When to Show the Paywall

| Trigger | Behavior |
|---------|----------|
| End of onboarding | Soft paywall — show offerings, user can dismiss |
| Feature gate hit | Hard gate — must subscribe or go back |
| Settings > Subscription | Direct access to manage subscription |
| Weekly prompt (after day 7) | Soft paywall with personalized message based on usage |

### Paywall Design (from prototype)

The paywall screen highlights:

1. **Header**: "Unlock Your Full Potential"
2. **Stat hook**: Shows the user's current streak and stats to emphasize investment
3. **Plan cards**: Monthly / Yearly (highlighted "BEST VALUE" with savings %) / Lifetime
4. **Feature list**: 10 pro features with checkmarks
5. **Trial badge**: "7-day free trial" on the yearly plan
6. **Restore button**: "Already subscribed? Restore Purchases"
7. **Terms**: Links to Terms of Service and Privacy Policy (required by App Store)

### Trial Flow

1. User selects "Pro Yearly" with free trial
2. RevenueCat SDK initiates purchase (no charge yet)
3. App Store/Play Store shows trial confirmation dialog
4. On confirm: `subscription_trial_started` event fires
5. User gets full Pro access immediately
6. 7 days later: first charge of $59.99/year
7. If user cancels during trial: access reverts to free at trial end

## 7. Subscription State Machine

```
                    ┌────────────────┐
                    │     FREE       │
                    │  (default)     │
                    └───────┬────────┘
                            │ INITIAL_PURCHASE
                            │ or TRIAL_STARTED
                            ▼
                    ┌────────────────┐
             ┌─────│    ACTIVE      │─────┐
             │     │  (pro access)  │     │
             │     └───────┬────────┘     │
             │             │              │
    BILLING_ISSUE    CANCELLATION     RENEWAL
             │             │          (loops back)
             ▼             ▼
    ┌────────────────┐  ┌────────────────┐
    │ BILLING_ISSUE  │  │  CANCELLED     │
    │ (grace period, │  │ (pro access    │
    │  pro access)   │  │  until expiry) │
    └───────┬────────┘  └───────┬────────┘
            │                   │
       EXPIRATION          EXPIRATION
            │                   │
            ▼                   ▼
    ┌────────────────────────────────┐
    │         EXPIRED / FREE         │
    │    (reverted to free tier)     │
    └────────────────────────────────┘
```

## 8. Testing Subscriptions

### Development/QA

- **RevenueCat Sandbox**: Use sandbox mode for all testing. Apple sandbox accounts renew subscriptions every few minutes instead of months.
- **Test user IDs**: Create dedicated test accounts in RevenueCat dashboard.
- **Promo codes**: Use RevenueCat promo entitlements for QA team access.

### Checklist Before Launch

- [ ] Products created in App Store Connect and Google Play Console
- [ ] Products mapped to entitlements in RevenueCat
- [ ] Webhook URL configured in RevenueCat dashboard
- [ ] Webhook secret set in Supabase Edge Function secrets
- [ ] Free tier limits enforced both client-side and server-side
- [ ] Restore purchases flow tested on both platforms
- [ ] Trial flow tested end-to-end
- [ ] Cancellation flow tested (access until period end)
- [ ] Billing issue / grace period behavior verified
- [ ] App Store and Play Store review guidelines compliance (Terms, Privacy links)
