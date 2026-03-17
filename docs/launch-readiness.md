# ZERO TILT — Launch Readiness Checklist

> Version 1.0.0 | March 2026

## 1. Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Database | ✅ Deployed | Project: wqgmocwpsrmvmorybkqp, 29 tables, v2 schema |
| Row-Level Security | ✅ Enabled | All tables have RLS policies |
| Database Functions | ✅ Deployed | get_current_streak, get_best_streak, reset_streak, get_user_stats, calculate_milestone_progress |
| Seed Data | ✅ Deployed | 28 milestones seeded across 8 categories |
| Auth (Email/Password) | ✅ Configured | Supabase Auth with Expo SecureStore adapter |

## 2. Mobile App Status

### Implemented Systems (14/14)

| System | Files | Status |
|--------|-------|--------|
| **Core Loop** (streaks, pledges, urges, breathing) | 10 services, 6 hooks | ✅ Production-ready |
| **Journal System** | services/journal.ts, journalDraft.ts, hooks/useJournal.ts | ✅ Production-ready |
| **Milestone/Achievement System** | services/milestones.ts, milestoneEngine.ts, hooks/useMilestones.ts | ✅ Production-ready |
| **Community System** | services/community.ts, hooks/useCommunity.ts, app/community.tsx, app/post-detail.tsx | ✅ Implemented |
| **Clan System** | services/clans.ts, hooks/useClans.ts, app/clans.tsx | ✅ Implemented |
| **Messaging/Friends** | services/friendships.ts, hooks/useFriends.ts, app/friends.tsx | ✅ Implemented |
| **Social Profiles** | app/social-profile.tsx | ✅ Implemented |
| **Advanced Analytics** | services/advancedAnalytics.ts, app/analytics-dashboard.tsx | ✅ Implemented |
| **Subscription/Monetization** | services/subscription.ts, hooks/useSubscription.ts, components/ProGate.tsx, app/paywall.tsx | ✅ Implemented (RevenueCat placeholder) |
| **Notifications** | services/notifications.ts, hooks/useNotifications.ts, app/notification-settings.tsx | ✅ Implemented |
| **AI Coaching** | services/coaching.ts, hooks/useCoaching.ts, app/coaching.tsx | ✅ Implemented (template responses) |
| **Analytics Events** | services/analytics.ts (70+ events cataloged) | ✅ Implemented |
| **Crash Monitoring** | services/sentry.ts | ✅ Implemented |
| **App Session Tracking** | services/appSession.ts | ✅ Implemented |

### Navigation Structure

```
Root Layout (_layout.tsx)
├── (auth)/ — Login, Signup, Welcome
├── (onboarding)/ — About You, Quiz, Symptoms, Goals, Commitment
├── (tabs)/ — Main app
│   ├── dashboard.tsx — Home/Dashboard
│   ├── journal.tsx — Journal list
│   ├── panic.tsx — Panic button + breathing
│   ├── community.tsx — Community feed ← NEW
│   ├── progress.tsx — Progress stats
│   └── settings.tsx — Settings hub
├── Modal screens:
│   ├── daily-pledge.tsx
│   ├── urge-log.tsx
│   ├── journal-entry.tsx
│   ├── milestones.tsx
│   ├── edit-profile.tsx
│   ├── paywall.tsx ← NEW
│   └── coaching.tsx ← NEW
└── Full screens:
    ├── post-detail.tsx ← NEW
    ├── social-profile.tsx ← NEW
    ├── analytics-dashboard.tsx ← NEW
    ├── friends.tsx ← NEW
    ├── clans.tsx ← NEW
    ├── notification-settings.tsx ← NEW
    └── privacy-settings.tsx ← NEW
```

## 3. Configuration Required Before TestFlight

### Must Do (Blocking)

- [ ] **Supabase Anon Key** — Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- [ ] **PostHog API Key** — Create project at posthog.com, set `EXPO_PUBLIC_POSTHOG_API_KEY`
- [ ] **Sentry DSN** — Create project at sentry.io, set `EXPO_PUBLIC_SENTRY_DSN`
- [ ] **Expo Project ID** — Run `eas init`, set `EXPO_PUBLIC_PROJECT_ID` and update eas.json
- [ ] **Apple Developer Account** — Required for TestFlight
- [ ] **App Icon & Splash** — Create `assets/icon.png` (1024x1024), `assets/splash.png` (1242x2436), `assets/adaptive-icon.png`
- [ ] **App Store Connect** — Create app entry, set bundle ID `com.zerotilt.app`

### Should Do (Pre-Launch)

- [ ] **RevenueCat Account** — Create app at revenuecat.com, set API keys
- [ ] **RevenueCat Products** — Create products in App Store Connect, map in RevenueCat
- [ ] **RevenueCat Webhook** — Deploy webhook-revenuecat Edge Function, configure webhook URL
- [ ] **Push Notifications** — Configure APNs key in Expo dashboard
- [ ] **Privacy Policy** — Host at zerotilt.app/privacy
- [ ] **Terms of Service** — Host at zerotilt.app/terms

### Nice to Have (Post-Launch)

- [ ] **AI Coach Edge Function** — Replace template responses with Claude/GPT integration
- [ ] **Direct Messages** — Add messages table for DM functionality
- [ ] **Mini-Games** — Implement Memory Match and other games
- [ ] **Pre-Trade Checklist** — Implement checklist UI and service
- [ ] **Share Progress** — Implement share-image Edge Function
- [ ] **Google Sign-In** — Configure OAuth in Supabase
- [ ] **Apple Sign-In** — Configure OAuth in Supabase

## 4. Known Limitations

1. **AI Coach** — Uses template responses. Need Edge Function + AI API integration for real coaching.
2. **RevenueCat** — SDK not installed (placeholder). Install `react-native-purchases` and uncomment SDK calls.
3. **Direct Messages** — Friend list exists but real-time DM chat is not yet implemented. Need messages table and Supabase Realtime subscription.
4. **Mini-Games** — Game sessions table exists but no game UI implemented yet.
5. **Pre-Trade Checklist** — Tables exist but no checklist screen yet.
6. **Share Progress** — No share-image Edge Function yet.
7. **Tab Icons** — Using emoji for tab bar icons. Should replace with Lucide or custom SVG icons.
8. **Milestone Engine N+1** — milestoneEngine.ts runs 28 individual queries. Consider batching.
9. **Profile PK Mismatch** — Profile service uses `user_id` but DB schema uses `id` as PK (FK to auth.users). Works via trigger but should be aligned.

## 5. Build Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build for TestFlight (iOS)
eas build --platform ios --profile preview

# Build for production (iOS)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Build for Android internal testing
eas build --platform android --profile preview
```

## 6. Environment File Template

```env
EXPO_PUBLIC_SUPABASE_URL=https://wqgmocwpsrmvmorybkqp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_SENTRY_DSN=https://your_key@sentry.io/your_project
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_XXXXXXXXXXXX
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_XXXXXXXXXXXX
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0
```
