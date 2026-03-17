# ZERO TILT — App Store Launch Guide

> Version 1.0.0 | March 2026

## 1. App Store Connect Setup

### App Information

| Field | Value |
|-------|-------|
| **App Name** | ZERO TILT |
| **Subtitle** | Master Your Trading Psychology |
| **Bundle ID** | com.zerotilt.app |
| **SKU** | com-zerotilt-app |
| **Primary Category** | Finance |
| **Secondary Category** | Health & Fitness |
| **Content Rights** | This app does not contain third-party content |
| **Age Rating** | 12+ (Infrequent/Mild references to gambling themes) |

### App Description

```
ZERO TILT — Master your trading psychology and break free from emotional trading.

Every trader knows the feeling: FOMO kicks in, revenge trades happen, and discipline breaks down. ZERO TILT is your daily companion for building unshakable trading discipline.

KEY FEATURES:

Streak Tracking — Track your tilt-free days and build momentum
Daily Pledge — Start each trading day with intention
Urge Logger — Track and resist trading impulses in real-time
Panic Button — Guided 4-7-8 breathing when emotions run high
Trading Journal — Process your thoughts and reflect on your trading
Achievement System — Unlock milestones as you build discipline
AI Coach (Mika) — Get personalized coaching for your trading psychology
Community — Connect with other traders on the same journey
Clans — Join or create groups with like-minded traders
Advanced Analytics — Understand your patterns with detailed insights

Whether you're fighting FOMO, revenge trading, or overtrading, ZERO TILT gives you the tools to recognize, manage, and overcome your emotional trading habits.

Free to use with optional Pro subscription for advanced features.
```

### Keywords

```
trading psychology, tilt, FOMO, revenge trading, trading journal,
discipline, streak tracker, trading mindset, emotional trading,
trading coach, day trading, forex, crypto trading, trading habits
```

### Promotional Text

```
Build unbreakable trading discipline. Track your streak, log urges, journal your trades, and connect with a community of traders committed to mastering their psychology.
```

## 2. Screenshots Required

### iPhone 6.7" Display (iPhone 15 Pro Max) — Required

1. **Dashboard** — Streak ring, daily stats, pledge status
2. **Panic Button** — Breathing exercise in progress
3. **Journal** — Journal list with mood indicators
4. **Community** — Feed with posts, comments, likes
5. **Analytics** — Urge trends and streak history charts
6. **Paywall** — Pro features overview

### iPhone 6.5" Display (iPhone 14 Plus) — Required

Same 6 screenshots at 6.5" resolution

### iPad 12.9" Display — Optional but recommended

Same 6 screenshots at iPad resolution

## 3. In-App Purchases Configuration

### Products to Create in App Store Connect

| Reference Name | Product ID | Type | Price |
|---------------|-----------|------|-------|
| ZERO TILT Pro Monthly | zerotilt_pro_monthly | Auto-Renewable Subscription | $9.99 |
| ZERO TILT Pro Yearly | zerotilt_pro_yearly | Auto-Renewable Subscription | $59.99 |
| ZERO TILT Pro Lifetime | zerotilt_pro_lifetime | Non-Consumable | $149.99 |

### Subscription Group

| Field | Value |
|-------|-------|
| Group Name | ZERO TILT Pro |
| Group Reference Name | zerotilt_pro |

### Subscription Descriptions (for App Store)

**Pro Monthly:**
```
Full access to all ZERO TILT features including unlimited journal entries,
advanced analytics, AI coaching, community posting, and more.
```

**Pro Yearly:**
```
Save 50% with annual billing. Full access to all ZERO TILT features including
unlimited journal entries, advanced analytics, AI coaching, community posting,
and more. Includes 7-day free trial.
```

**Pro Lifetime:**
```
One-time purchase for permanent access to all ZERO TILT Pro features.
Never pay again.
```

## 4. Privacy & Compliance

### App Privacy Labels (App Store Connect)

| Data Type | Collection | Linked to Identity | Tracking |
|-----------|-----------|-------------------|----------|
| Email Address | Yes | Yes | No |
| Name | Yes | Yes | No |
| User ID | Yes | Yes | No |
| Health & Fitness (Mood) | Yes | Yes | No |
| Usage Data | Yes | No | No |
| Diagnostics (Crash Data) | Yes | No | No |
| Purchase History | Yes | Yes | No |

### Required Links

| Document | URL |
|----------|-----|
| Privacy Policy | https://zerotilt.app/privacy |
| Terms of Service | https://zerotilt.app/terms |
| Support URL | https://zerotilt.app/support |
| Marketing URL | https://zerotilt.app |

### Data Deletion Requirement (App Store Policy)

Users can request account deletion from Privacy Settings within the app.
The Edge Function `delete-user-data` handles cascading deletion via
Supabase's ON DELETE CASCADE foreign keys. This must be fully functional
before App Store submission.

## 5. Review Guidelines Compliance

### Common Rejection Risks

| Risk | Mitigation |
|------|-----------|
| **Sign in with Apple required** | Must implement Apple Sign-In if Google Sign-In is offered |
| **Subscription terms not visible** | Paywall screen includes auto-renewal terms, price, and manage subscription info |
| **Missing Restore Purchases** | Paywall has "Restore Purchases" button |
| **Account deletion** | Privacy Settings includes Delete Account flow |
| **Health claims** | App description does not make medical/health claims — positioned as psychology/mindset tool |
| **In-app content gate** | Free tier provides meaningful functionality (streaks, pledges, panic button, basic journal) |
| **Background activity** | Only uses background for push notifications (declared in entitlements) |

### App Review Notes

```
Test Account:
Email: review@zerotilt.app
Password: TestFlight2026!

The app is a trading psychology tool that helps traders build emotional discipline.
Core features (streak tracking, breathing exercises, daily pledges) are free.
Pro subscription unlocks advanced analytics, AI coaching, and unlimited journal entries.

No real financial transactions occur within the app. The app does not provide
financial advice or access to trading platforms.
```

## 6. Google Play Store Setup

### Store Listing

| Field | Value |
|-------|-------|
| **Title** | ZERO TILT: Trading Psychology |
| **Short Description** | Master your trading psychology. Track streaks, resist urges, journal your trades. |
| **Category** | Finance |
| **Content Rating** | Everyone |
| **Target Audience** | 18+ (financial/trading content) |

### Data Safety Section

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Personal info (name, email) | Yes | No | Account management |
| Health info (mood data) | Yes | No | App functionality |
| App activity | Yes | No | Analytics |
| App info and performance | Yes | No | Crash reporting |

## 7. Pre-Submission Checklist

- [ ] App icon uploaded (1024x1024 PNG, no alpha)
- [ ] All 6 screenshots for both iPhone sizes
- [ ] App description and keywords finalized
- [ ] Privacy Policy URL live and accessible
- [ ] Terms of Service URL live and accessible
- [ ] Support URL live and accessible
- [ ] In-App Purchase products created and approved
- [ ] Subscription Group configured
- [ ] App Review test account created
- [ ] App Review notes written
- [ ] Data privacy labels configured
- [ ] Age rating questionnaire completed
- [ ] Restore Purchases functional
- [ ] Account deletion functional
- [ ] Sign in with Apple implemented (if Google Sign-In present)
- [ ] No placeholder content visible to reviewers
- [ ] Build uploaded via EAS Submit
- [ ] Internal testing verified on physical device

## 8. Launch Day Sequence

1. **T-7 days**: Submit build to App Store Review
2. **T-3 days**: Prepare social media announcements
3. **T-1 day**: Verify all services are operational (Supabase, PostHog, Sentry, RevenueCat)
4. **Launch day**: Release build, announce on social media
5. **T+1 day**: Monitor crash reports (Sentry), analytics (PostHog), and reviews
6. **T+7 days**: Analyze first week metrics, plan v1.1 based on feedback
