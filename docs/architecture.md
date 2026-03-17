# ZERO TILT — System Architecture

> Version 1.0 | March 2026
> Trading Psychology & Tilt Prevention App

## 1. Architecture Overview

ZERO TILT follows a **client-heavy, backend-lite** architecture optimized for a startup MVP. The mobile client handles UI, local state, and offline caching while Supabase provides the entire backend layer (auth, database, real-time, storage, serverless functions).

```
┌─────────────────────────────────────────────────────────┐
│                    ZERO TILT MOBILE APP                  │
│              React Native (Expo SDK 52+)                │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐  │
│  │  Screens │ │  Hooks   │ │  Zustand  │ │ Services │  │
│  │ (37 views│ │ useAuth  │ │  Store    │ │ supabase │  │
│  │  expo-   │ │ useStreak│ │ (persist) │ │ posthog  │  │
│  │  router) │ │ useGoals │ │           │ │ sentry   │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │ HTTPS / WSS
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌──────▼─────┐  ┌──▼──────────┐
    │  Supabase  │  │  Supabase  │  │  Supabase   │
    │    Auth    │  │  Database  │  │  Realtime    │
    │            │  │ (Postgres) │  │  (WebSocket) │
    └────────────┘  └──────┬─────┘  └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌──────▼─────┐  ┌──▼──────────┐
    │  Supabase  │  │  Supabase  │  │  External   │
    │  Storage   │  │   Edge     │  │  Services   │
    │  (media)   │  │ Functions  │  │             │
    └────────────┘  └──────┬─────┘  └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌──────▼─────┐  ┌──▼──────────┐
    │  Claude    │  │ RevenueCat │  │   PostHog   │
    │  API       │  │ (payments) │  │ (analytics) │
    │ (AI coach) │  │            │  │             │
    └────────────┘  └────────────┘  └─────────────┘
```

## 2. Service Map

| Service | Role | Communication |
|---------|------|---------------|
| **React Native (Expo)** | Mobile client for iOS + Android | — |
| **Supabase Auth** | User authentication (email, Google, Apple) | HTTPS REST |
| **Supabase Database** | PostgreSQL 15 — all persistent data | HTTPS REST (PostgREST) |
| **Supabase Realtime** | Live subscriptions for chat, streaks, community | WebSocket (WSS) |
| **Supabase Storage** | Profile photos, community images | HTTPS REST |
| **Supabase Edge Functions** | Server-side logic (Deno runtime) | HTTPS REST |
| **Claude API** | AI Coach (Mika) conversational engine | HTTPS via Edge Function proxy |
| **RevenueCat** | In-app subscription management | Native SDK (iOS/Android) |
| **PostHog** | Product analytics and event tracking | HTTPS REST |
| **Sentry** | Crash reporting and performance monitoring | Native SDK |
| **Expo Notifications** | Push notification delivery | Expo Push Service |
| **EAS Build** | CI/CD for app builds and OTA updates | CLI / GitHub Actions |

## 3. Data Flow Diagrams

### 3.1 Authentication Flow

```
User                    App                 Supabase Auth         Database
 │                       │                       │                   │
 │  Tap "Sign Up"        │                       │                   │
 │──────────────────────>│                       │                   │
 │                       │  signUp(email, pass)  │                   │
 │                       │──────────────────────>│                   │
 │                       │                       │  INSERT profiles  │
 │                       │                       │──────────────────>│
 │                       │    JWT + refresh       │                   │
 │                       │<──────────────────────│                   │
 │                       │                       │                   │
 │                       │  Store tokens in       │                   │
 │                       │  expo-secure-store     │                   │
 │                       │                       │                   │
 │  Onboarding screens   │                       │                   │
 │<─────────────────────>│                       │                   │
 │                       │  UPDATE profile        │                   │
 │                       │  (quiz, symptoms,      │                   │
 │                       │   goals, pledge)       │                   │
 │                       │──────────────────────────────────────────>│
 │                       │                       │                   │
 │  Dashboard            │                       │                   │
 │<──────────────────────│                       │                   │
```

### 3.2 Streak Tracking Flow

```
User                    App                  Zustand Store        Supabase DB
 │                       │                       │                   │
 │  Opens app daily      │                       │                   │
 │──────────────────────>│                       │                   │
 │                       │  Check auth session    │                   │
 │                       │──────────────────────────────────────────>│
 │                       │                       │                   │
 │                       │  get_current_streak()  │                   │
 │                       │──────────────────────────────────────────>│
 │                       │                       │                   │
 │                       │  streak_days = N       │                   │
 │                       │<─────────────────────────────────────────│
 │                       │                       │                   │
 │                       │  setStreak(N)          │                   │
 │                       │──────────────────────>│                   │
 │                       │                       │  Persist locally  │
 │                       │                       │  (MMKV)           │
 │                       │                       │                   │
 │  Dashboard shows      │                       │                   │
 │  "Day N tilt-free"    │                       │                   │
 │<──────────────────────│                       │                   │
 │                       │                       │                   │
 │  Taps "I Relapsed"    │                       │                   │
 │──────────────────────>│                       │                   │
 │                       │  reset_streak(uid)     │                   │
 │                       │──────────────────────────────────────────>│
 │                       │                       │                   │
 │                       │  resetStreak()         │                   │
 │                       │──────────────────────>│                   │
 │                       │                       │  streak=0, rank=Spark
 │  Encouragement screen │                       │                   │
 │<──────────────────────│                       │                   │
```

### 3.3 AI Coach (Mika) Flow

```
User                    App               Edge Function          Claude API
 │                       │                       │                   │
 │  "I feel like         │                       │                   │
 │   revenge trading"    │                       │                   │
 │──────────────────────>│                       │                   │
 │                       │  POST /coach-message   │                   │
 │                       │  { message, context }  │                   │
 │                       │──────────────────────>│                   │
 │                       │                       │  Build prompt:    │
 │                       │                       │  - Mika persona   │
 │                       │                       │  - User streak    │
 │                       │                       │  - Recent journal │
 │                       │                       │  - Goals          │
 │                       │                       │                   │
 │                       │                       │  POST /messages   │
 │                       │                       │──────────────────>│
 │                       │                       │                   │
 │                       │                       │  Streaming resp   │
 │                       │                       │<──────────────────│
 │                       │                       │                   │
 │                       │  Store in DB           │                   │
 │                       │  (coach_conversations) │                   │
 │                       │<──────────────────────│                   │
 │                       │                       │                   │
 │  "Take a deep breath. │                       │                   │
 │   Let me walk you..." │                       │                   │
 │<──────────────────────│                       │                   │
```

### 3.4 Panic Button Flow

```
User (in tilt)          App                  Services
 │                       │                       │
 │  PANIC BUTTON         │                       │
 │──────────────────────>│                       │
 │                       │                       │
 │  Breathing exercise   │                       │
 │  (4-7-8 guided)       │                       │
 │<──────────────────────│                       │
 │                       │                       │
 │  Completes breathing  │                       │
 │──────────────────────>│                       │
 │                       │  Log breathing_session │
 │                       │──────────────────────>│
 │                       │                       │
 │  "How do you feel?"   │                       │
 │<──────────────────────│                       │
 │                       │                       │
 │  Rates intensity      │                       │
 │──────────────────────>│                       │
 │                       │  Log urge              │
 │                       │──────────────────────>│
 │                       │                       │
 │  Coach suggestion or  │  Track event:          │
 │  coping strategies    │  panic_button_used     │
 │<──────────────────────│──────────────────────>│
```

## 4. Security Model

### 4.1 Authentication

| Method | Provider | Details |
|--------|----------|---------|
| Email/Password | Supabase Auth | Default signup method; email verification required |
| Google OAuth | Supabase Auth + expo-auth-session | Social login via Google |
| Apple Sign-In | Supabase Auth + expo-apple-authentication | Required for iOS App Store |
| Magic Link | Supabase Auth | Password reset flow |

### 4.2 Token Management

All auth tokens are stored in **expo-secure-store** (encrypted keychain on iOS, encrypted SharedPreferences on Android). The Supabase client is configured with:

```typescript
auth: {
  storage: ExpoSecureStoreAdapter,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
}
```

JWT tokens are automatically refreshed by the Supabase client. Session expiry is set to 1 hour with refresh tokens valid for 30 days.

### 4.3 Row-Level Security (RLS)

Every table has RLS enabled. The security model follows two patterns:

**Private data** (streaks, journal, urges, goals, pledges, checkins, breathing, games, settings):
```sql
CREATE POLICY "Users can manage own data"
  ON <table> FOR ALL
  USING (auth.uid() = user_id);
```

**Community data** (posts, comments, likes, pods):
```sql
-- Anyone authenticated can read
CREATE POLICY "Anyone can view" ON <table> FOR SELECT USING (true);
-- Only the author can write
CREATE POLICY "Users can create" ON <table> FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own" ON <table> FOR UPDATE USING (auth.uid() = user_id);
```

### 4.4 API Key Security

| Key | Location | Exposure |
|-----|----------|----------|
| Supabase anon key | App config (expo-constants) | Public (RLS protects data) |
| Supabase service role key | Edge Function secrets only | Never exposed to client |
| Claude API key | Edge Function secrets only | Never exposed to client |
| RevenueCat public key | App config | Public (designed for client) |
| PostHog project key | App config | Public (write-only) |
| Sentry DSN | App config | Public (write-only) |

### 4.5 Data Privacy

- All user data encrypted at rest (Supabase AES-256) and in transit (TLS 1.2+)
- Privacy settings table controls what data is visible to other users
- GDPR-compliant data export and deletion via Edge Functions
- Coach conversations are stored server-side but only accessible by the owning user
- No PII is sent to PostHog (user identified by anonymous UUID)

## 5. Application Layers

### 5.1 Client Architecture

```
src/
├── app/                          # Expo Router file-based navigation
│   ├── (auth)/                   # Auth group (no bottom tabs)
│   │   ├── welcome.tsx
│   │   ├── signup.tsx
│   │   └── signin.tsx
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── about-you.tsx
│   │   ├── quiz.tsx
│   │   ├── symptoms.tsx
│   │   ├── goals.tsx
│   │   ├── commitment.tsx
│   │   └── carousel.tsx
│   ├── (tabs)/                   # Main app (bottom tab navigator)
│   │   ├── dashboard.tsx
│   │   ├── coach.tsx
│   │   ├── community/
│   │   │   ├── index.tsx         # Forum/Chat/Clans/Friends
│   │   │   ├── [postId].tsx
│   │   │   ├── chatroom/[id].tsx
│   │   │   └── clan/[id].tsx
│   │   ├── analytics.tsx
│   │   └── profile.tsx
│   ├── games/
│   │   ├── index.tsx
│   │   ├── memory.tsx
│   │   ├── stroop.tsx
│   │   ├── math.tsx
│   │   ├── scramble.tsx
│   │   ├── findit.tsx
│   │   └── breath.tsx
│   ├── urge.tsx
│   ├── panic.tsx
│   ├── journal/
│   │   ├── index.tsx
│   │   └── new.tsx
│   └── settings/
│       ├── edit-profile.tsx
│       ├── notifications.tsx
│       ├── subscription.tsx
│       ├── privacy.tsx
│       └── help.tsx
├── components/
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   └── TabBar.tsx
│   ├── icons/                    # SVG icon components
│   └── shared/                   # Feature-specific shared components
│       ├── StreakCard.tsx
│       ├── GoalTracker.tsx
│       ├── ShareModal.tsx
│       └── ConfettiOverlay.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useStreak.ts
│   ├── useGoals.ts
│   ├── useJournal.ts
│   ├── useUrges.ts
│   ├── useCoach.ts
│   ├── useCommunity.ts
│   └── useSubscription.ts
├── lib/                          # Service clients
│   ├── supabase.ts
│   ├── posthog.ts
│   ├── sentry.ts
│   └── purchases.ts             # RevenueCat setup
├── store/                        # Zustand state management
│   └── appStore.ts
├── types/                        # TypeScript definitions
│   └── database.ts              # Supabase-generated types
└── constants/
    └── theme.ts                  # Design tokens
```

### 5.2 State Management Strategy

| State Type | Technology | Purpose |
|-----------|-----------|---------|
| **Server state** | Supabase client + React Query (optional) | Streaks, journal, goals, community — source of truth is the database |
| **Client state** | Zustand (persisted via MMKV) | Auth status, onboarding progress, UI preferences, current rank |
| **Real-time state** | Supabase Realtime subscriptions | Chat messages, community feed, online status |
| **Navigation state** | Expo Router | Screen stack, tab state, deep links |

### 5.3 Offline Strategy

For MVP, the app assumes an internet connection for most operations. However, critical features have offline resilience:

- **Streak display**: Cached locally in Zustand/MMKV so the user always sees their streak even without connectivity
- **Journal drafts**: Saved locally and synced when connection restores
- **Queue pattern**: Failed writes (urge logs, check-ins) are queued locally and retried on reconnect

## 6. Edge Functions

Supabase Edge Functions (Deno runtime) handle server-side logic that cannot run on the client:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `coach-message` | POST from client | Proxies user message to Claude API with system prompt, user context, and conversation history |
| `check-badges` | Database webhook (on streak/urge/journal insert) | Evaluates badge criteria and awards new badges |
| `share-image` | POST from client | Generates a social media share card image (stats overlay) |
| `send-notification` | Cron (daily) + event triggers | Sends push notifications for reminders, streaks, community activity |
| `webhook-revenuecat` | POST from RevenueCat | Handles subscription status changes (new, renewed, cancelled, expired) |
| `export-user-data` | POST from client | GDPR data export — collects all user data into a downloadable JSON |
| `delete-user-data` | POST from client | GDPR data deletion — cascading delete of all user records |

## 7. Deployment Strategy

### 7.1 Environments

| Environment | Supabase Project | RevenueCat | Purpose |
|-------------|-----------------|------------|---------|
| Development | `zero-tilt-dev` | Sandbox | Local dev with seed data |
| Staging | `zero-tilt-staging` | Sandbox | QA testing, mirrors production schema |
| Production | `zero-tilt-prod` | Production | Live users |

### 7.2 CI/CD Pipeline

```
Developer pushes to GitHub
         │
         ▼
┌─────────────────────┐
│   GitHub Actions     │
│                     │
│  1. Lint + TypeCheck │
│  2. Unit Tests       │
│  3. Build Check      │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
 PR merge    Release tag
 to main     (v1.x.x)
    │           │
    ▼           ▼
 EAS Update  EAS Build
 (OTA JS     (native
  bundle)     binary)
    │           │
    ▼           ▼
 Staging     App Store
 channel     + Play Store
```

### 7.3 Release Strategy

- **OTA updates** (via EAS Update): For JS-only changes (bug fixes, UI tweaks, content updates). Deployed to staging channel first, promoted to production after QA.
- **Native builds** (via EAS Build): For dependency changes, new native modules, or SDK upgrades. Submitted to App Store and Play Store via EAS Submit.
- **Database migrations**: Run via Supabase CLI (`supabase db push`) against staging first, then production.
- **Edge Functions**: Deployed via `supabase functions deploy <function-name>`.

## 8. Assumptions

1. **Scale**: MVP targets up to 10,000 users. Architecture will support 100K without major changes. Supabase Pro tier handles this comfortably.
2. **No microservices**: Everything runs through Supabase. No separate backend servers, message queues, or container orchestration.
3. **No real-time chat at MVP**: Community posts are fetched on pull-to-refresh. Real-time chat in pods/DMs is a post-MVP feature.
4. **Single region**: Supabase project deployed in a single AWS region (us-east-1). Multi-region is unnecessary at this scale.
5. **No content moderation AI**: Community posts are moderated manually at MVP. Automated moderation is a future consideration.
6. **RevenueCat handles all billing logic**: The app never processes payments directly. RevenueCat handles receipts, renewals, and refunds.
