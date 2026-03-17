# ZERO TILT — Mobile App

> Trading Psychology & Tilt Prevention — React Native (Expo)

## Overview

ZERO TILT helps traders overcome emotional trading (tilt) through daily habit tracking, journaling, urge management, guided breathing, and milestone-based gamification. This is the MVP mobile client targeting iOS and Android.

## Tech Stack

- **React Native** with **Expo SDK 52** (Expo Router for file-based navigation)
- **Supabase** — Auth, PostgreSQL database, Row-Level Security
- **PostHog** — Product analytics
- **Sentry** — Crash reporting and error monitoring
- **TypeScript** — Full type safety throughout

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go on a physical device
- A Supabase project with the ZERO TILT schema deployed (see `../database/schema.sql`)

## Getting Started

### 1. Install dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://wqgmocwpsrmvmorybkqp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_POSTHOG_API_KEY=your-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Where to find these values:**

| Variable | Where |
|----------|-------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key |
| `POSTHOG_API_KEY` | PostHog Dashboard → Project Settings → Project API Key |
| `SENTRY_DSN` | Sentry Dashboard → Project → Settings → Client Keys (DSN) |

### 3. Run the app

```bash
# Start Expo dev server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Project Structure

```
mobile-app/
├── app/                          # Expo Router (file-based navigation)
│   ├── _layout.tsx               # Root layout — providers, auth guard
│   ├── index.tsx                 # Entry redirect
│   ├── (auth)/                   # Auth group (no bottom tabs)
│   │   ├── welcome.tsx           # Landing screen
│   │   ├── login.tsx             # Email/password login
│   │   └── signup.tsx            # Account creation
│   ├── (onboarding)/             # 5-step onboarding
│   │   ├── about-you.tsx         # Trader info
│   │   ├── quiz.tsx              # Tilt risk assessment
│   │   ├── symptoms.tsx          # Symptom selection
│   │   ├── goals.tsx             # Goal selection
│   │   └── commitment.tsx        # Pledge signing
│   ├── (tabs)/                   # Main app (bottom tab navigator)
│   │   ├── dashboard.tsx         # Home — streak, pledge, actions
│   │   ├── journal.tsx           # Journal entry list
│   │   ├── panic.tsx             # Breathing exercise (4-7-8)
│   │   ├── progress.tsx          # Stats, milestones, goals
│   │   └── settings.tsx          # Profile, account, subscription
│   ├── daily-pledge.tsx          # Full pledge signing screen
│   ├── urge-log.tsx              # Urge event logging
│   ├── journal-entry.tsx         # Create/edit journal entry
│   └── milestones.tsx            # All milestones grid
├── components/
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button.tsx            # Primary/secondary/danger/ghost variants
│   │   ├── Card.tsx              # Dark card with optional header
│   │   ├── ProgressBar.tsx       # Animated fill bar
│   │   └── ModalDialog.tsx       # Bottom sheet confirmation
│   ├── StreakRing.tsx             # SVG circular streak progress
│   ├── StreakTracker.tsx          # Full streak card with ring + stats
│   ├── MilestoneOrb.tsx          # Achievement badge (5 tiers)
│   └── JournalCard.tsx           # Journal entry preview card
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth state + actions
│   ├── useStreak.ts              # Streak data + reset
│   ├── useJournal.ts             # Journal CRUD
│   ├── useUrges.ts               # Urge logging + stats
│   ├── useMilestones.ts          # Milestone progress
│   └── useAnalytics.ts           # PostHog wrapper
├── services/                     # Supabase + third-party clients
│   ├── supabase.ts               # Client with secure token storage
│   ├── profile.ts                # Profile CRUD
│   ├── streaks.ts                # Streak RPC calls
│   ├── journal.ts                # Journal entries
│   ├── urges.ts                  # Urge logs
│   ├── pledges.ts                # Daily pledges
│   ├── milestones.ts             # Milestones + unlocks
│   ├── breathing.ts              # Breathing sessions
│   ├── analytics.ts              # PostHog setup
│   └── sentry.ts                 # Sentry setup
├── constants/
│   ├── theme.ts                  # Colors, typography, spacing
│   └── config.ts                 # App config, free tier limits
└── utils/
    ├── dates.ts                  # Date helpers
    └── formatting.ts             # Text + number formatting
```

## Core Features (MVP)

| Feature | Screen | Description |
|---------|--------|-------------|
| Streak Tracking | Dashboard | Animated ring showing current tilt-free streak |
| Daily Pledge | daily-pledge | Sign a commitment before each trading day |
| Urge Logging | urge-log | Track tilt urges with intensity, triggers, and outcomes |
| Panic Button | panic (tab) | Guided 4-7-8 breathing exercise with animated circle |
| Journal | journal (tab) | Trading journal with mood tracking and tags |
| Progress | progress (tab) | Stats overview, milestone grid, goal tracking |
| Milestones | milestones | 28 achievements across 8 categories with 5 tiers |
| Onboarding | 5 screens | Collects trader profile, risk assessment, goals, pledge |

## Features NOT in MVP

The following are planned for post-MVP (Weeks 5-8):

- Community (posts, comments, likes)
- Pods/Clans (accountability groups)
- Chat
- AI Coach (Mika)
- Mini-games
- Leaderboard

## Database

The app connects to a Supabase PostgreSQL database with 29 tables. Key tables used by the mobile app:

- `profiles` — User profile (auto-created on signup via trigger)
- `streaks` — Streak tracking with `current_days`, `best_streak`, `is_active`
- `daily_pledges` — One pledge per user per day
- `urge_logs` — Tilt urge events with intensity (1-10), triggers, outcomes
- `journal_entries` — Trading journal with mood, tags, word count
- `milestones` — 28 reference achievements
- `milestone_unlocks` — Per-user progress tracking
- `breathing_sessions` — Guided breathing session logs

See `../database/schema.sql` for the full schema and `../docs/database-schema.md` for documentation.

## Analytics Events

PostHog tracks key user actions:

- `app_opened` — App comes to foreground
- `onboarding_completed` — Finished all onboarding steps
- `pledge_signed` — Daily pledge committed
- `panic_button_pressed` — Panic breathing started
- `urge_logged` — Urge event recorded
- `journal_entry_saved` — Journal entry created
- `streak_viewed` — Dashboard loaded with streak
- `milestone_unlocked` — New milestone achieved

See `../docs/analytics-events.md` for the full 70+ event catalog.

## Additional Configuration

Before the app can run in production, you'll need:

1. **Supabase**: Create a project and deploy `database/schema.sql` + `database/seed.sql`
2. **PostHog**: Create a project at posthog.com and get the API key
3. **Sentry**: Create a React Native project at sentry.io and get the DSN
4. **RevenueCat** (post-MVP): Configure products in App Store Connect / Google Play Console
5. **EAS Build**: Run `eas build:configure` for iOS/Android builds
6. **App Icons & Splash**: Replace placeholder assets in `assets/` folder

## Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS Simulator
npm run android    # Run on Android Emulator
npm run web        # Run in browser (limited support)
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript compiler check
```

## License

Proprietary — ZERO TILT by Blackfyre Apps
