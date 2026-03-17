# ZERO TILT - React Native Expo Mobile App
## Project Structure & Setup Guide

### Overview
ZERO TILT is a comprehensive trading psychology mobile app built with React Native and Expo. The app helps traders manage tilt, track streaks, journal trades, and achieve their trading psychology goals.

### Technology Stack
- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + React Hooks
- **Backend**: Supabase (PostgreSQL + Auth)
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Animations**: React Native Reanimated
- **TypeScript**: Full type safety

### Directory Structure

```
mobile-app/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                   # Auth stack group
│   │   ├── welcome.tsx           # Welcome screen
│   │   ├── login.tsx             # Login screen
│   │   ├── signup.tsx            # Registration screen
│   │   └── _layout.tsx           # Auth stack layout
│   ├── (onboarding)/             # Onboarding flow group
│   │   ├── about-you.tsx         # Basic info collection
│   │   ├── quiz.tsx              # Tilt assessment quiz
│   │   ├── symptoms.tsx          # Select tilt symptoms
│   │   ├── goals.tsx             # Set trading goals
│   │   ├── commitment.tsx        # Sign daily pledge
│   │   └── _layout.tsx           # Onboarding stack layout
│   ├── (tabs)/                   # Main app tab group
│   │   ├── dashboard.tsx         # Dashboard home screen
│   │   ├── journal.tsx           # Journal entries list
│   │   ├── panic.tsx             # Breathing exercise screen
│   │   ├── progress.tsx          # Statistics & milestones
│   │   ├── settings.tsx          # App settings
│   │   └── _layout.tsx           # Tab navigation layout
│   ├── daily-pledge.tsx          # Daily pledge modal
│   ├── urge-log.tsx              # Log trading urges modal
│   ├── journal-entry.tsx         # Create/edit journal entry modal
│   ├── milestones.tsx            # View all milestones modal
│   ├── _layout.tsx               # Root layout with providers
│   └── index.tsx                 # Entry point redirect
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx            # Customizable button
│   │   ├── Card.tsx              # Card container
│   │   ├── ProgressBar.tsx       # Animated progress bar
│   │   ├── ModalDialog.tsx       # Confirmation modal
│   │   └── index.ts              # UI exports
│   ├── StreakRing.tsx            # Circular streak display
│   ├── StreakTracker.tsx         # Full streak card
│   ├── MilestoneOrb.tsx          # Milestone badge
│   └── JournalCard.tsx           # Journal entry preview
│
├── services/                     # Supabase & API services
│   ├── supabase.ts              # Supabase client setup
│   ├── profile.ts               # User profile management
│   ├── streaks.ts               # Streak tracking
│   ├── journal.ts               # Journal entries
│   ├── urges.ts                 # Urge logging
│   ├── pledges.ts               # Daily pledges
│   ├── milestones.ts            # Milestone system
│   ├── breathing.ts             # Breathing sessions
│   ├── analytics.ts             # PostHog integration
│   └── sentry.ts                # Error tracking
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Auth state management
│   ├── useStreak.ts             # Streak data & actions
│   ├── useJournal.ts            # Journal data & actions
│   ├── useUrges.ts              # Urge data & actions
│   ├── useMilestones.ts         # Milestone data & actions
│   └── useAnalytics.ts          # Analytics wrapper
│
├── constants/                    # App constants & config
│   ├── theme.ts                 # Design tokens, colors, typography
│   └── config.ts                # App settings & data constants
│
├── utils/                        # Utility functions
│   ├── dates.ts                 # Date formatting & calculations
│   └── formatting.ts            # Number & text formatting
│
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── .env.example                  # Environment variables template
```

### Key Features

#### Authentication
- Email/password signup and login
- Secure token storage with ExpoSecureStore
- Session persistence across app restarts

#### Onboarding Flow
1. **About You**: Collect trader name, age, style, markets, experience
2. **Tilt Assessment**: 5-question quiz to assess tilt risk level
3. **Symptoms**: Select experienced tilt behaviors
4. **Goals**: Choose trading psychology goals
5. **Commitment**: Sign daily pledge

#### Main Features
- **Dashboard**: Streak display, daily pledge, quick actions
- **Journal**: Create, edit, and view trading journal entries with mood tracking
- **Panic Button**: 4-7-8 breathing exercise with animated circle
- **Progress**: Statistics, streak history, milestone tracking
- **Settings**: Profile management, account settings, subscription info

#### Streak System
- Animated circular progress ring
- Current and best streak tracking
- Rank badges based on progress
- Automatic streak calculation

#### Journal System
- Title, content, mood, tags
- Word count tracking
- Favorite marking
- Full CRUD operations

#### Urge Tracking
- Intensity slider (1-10)
- Trigger type selection
- Coping strategies multi-select
- Outcome tracking (Resisted/Gave in/Distracted)
- Statistics and analytics

#### Breathing Exercise
- 4-7-8 pattern (inhale 4, hold 7, exhale 8)
- Animated expanding/contracting circle
- 5 cycle session
- Calm before/after tracking
- Session logging

#### Milestone System
- 5 tiers: Bronze, Silver, Gold, Platinum, Diamond
- Categories: Streaks, Discipline, Journaling, Psychology, Community
- Progress tracking per milestone
- Unlocked badge system

### Supabase Database Schema

#### Tables
- `profiles`: User profile information, experience level, risk assessment
- `streaks`: Current and best streak tracking per user
- `journal_entries`: Trading journal entries with mood and tags
- `urge_logs`: Logged urges with intensity, triggers, outcomes
- `daily_pledges`: Daily pledge signatures and dates
- `milestones`: Milestone definitions and metadata
- `milestone_unlocks`: User milestone progress and unlock status
- `breathing_sessions`: Logged breathing exercises with before/after calm ratings

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=         # Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key
EXPO_PUBLIC_POSTHOG_API_KEY=      # PostHog API key
EXPO_PUBLIC_POSTHOG_HOST=         # PostHog host
EXPO_PUBLIC_SENTRY_DSN=           # Sentry DSN for error tracking
```

### Analytics Events
- `app_opened`: App launch
- `login_successful`: Successful login
- `signup_successful`: Successful signup
- `onboarding_completed`: Onboarding finished
- `pledge_signed`: Daily pledge signed
- `panic_button_pressed`: Panic button activated
- `breathing_session_started`: Breathing exercise started
- `breathing_session_completed`: Breathing exercise completed
- `urge_logged`: Urge logged
- `journal_entry_saved`: Journal entry created/updated
- `logout`: User logout
- `screen_viewed`: Screen navigation

### Design System
- **Primary Color**: Teal (#14b8a6) - calm, focused
- **Accent Colors**: Amber (#f59e0b) for warnings, Red (#ef4444) for danger
- **Background**: Dark navy (#0f172a) - trader aesthetic
- **Text Hierarchy**: Primary, secondary, tertiary, muted levels

### Setup Instructions

1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Fill in your Supabase and service credentials
```

3. **Start Development**
```bash
npm start
# or
expo start
```

4. **Run on Device**
- iOS: `npm run ios`
- Android: `npm run android`

5. **Build for Production**
```bash
npm run build:ios
npm run build:android
```

### Key Implementation Notes

- All services use Supabase for data persistence
- Auth state changes automatically update the UI through provider
- Analytics tracked for all major user actions
- Error handling integrated with Sentry for production monitoring
- Animations use React Native Reanimated for smooth 60fps performance
- All screens support keyboard and gesture navigation
- Dark theme implemented throughout for trader psychology comfort

### File Naming Conventions
- Components: PascalCase (e.g., StreakRing.tsx)
- Screens: lowercase with hyphen (e.g., daily-pledge.tsx)
- Services: lowercase (e.g., supabase.ts)
- Hooks: camelCase with use prefix (e.g., useAuth.ts)
- Constants: camelCase (e.g., theme.ts)
- Utils: camelCase (e.g., dates.ts)

### Production Considerations
- All sensitive data stored in ExpoSecureStore
- No credentials in .env, use environment variables
- Sentry configured for crash reporting
- PostHog for user behavior analytics
- Rate limiting built into Supabase service layer
- Type-safe throughout with TypeScript
