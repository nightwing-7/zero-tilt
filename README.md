# Tilt - Trading Tilt Prevention App

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development:
   ```bash
   npx expo start
   ```

## Tech Stack
- **Frontend:** Expo / React Native (TypeScript)
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Realtime)
- **State:** Zustand + React hooks
- **Payments:** RevenueCat (planned)

## Project Structure
```
src/
├── components/     # Reusable UI components
├── constants/      # Theme, colors, default data
├── hooks/          # Custom hooks (useAuth, useStreak, useGoals, etc.)
├── lib/            # Supabase client, utilities
├── navigation/     # React Navigation setup
├── screens/        # Screen components
│   ├── onboarding/ # Onboarding flow screens
│   ├── main/       # Main app screens
│   └── modals/     # Modal screens
└── types/          # TypeScript type definitions
```

## Supabase Project
- **Project ID:** wqgmocwpsrmvmorybkqp
- **Region:** us-east-1
- **URL:** https://wqgmocwpsrmvmorybkqp.supabase.co

## Database Tables
21 tables with Row Level Security enabled:
- profiles, streaks, journal_entries, urge_logs
- goals, goal_checkins, checklist_items, checklist_completions
- daily_pledges, daily_checkins, badges, user_badges
- breathing_sessions, posts, comments, post_likes
- pods, pod_members, friendships, quiz_responses, game_sessions

## Edge Functions
- `manage-streak` - Get/reset/history for tilt-free streaks
- `check-badges` - Evaluate and award achievement badges
- `complete-onboarding` - Process onboarding data and seed user defaults

## Next Steps
- [ ] Build out all screen components from prototype
- [ ] Configure Google & Apple OAuth in Supabase dashboard
- [ ] Set up RevenueCat for subscriptions
- [ ] Add push notifications via Expo
- [ ] Configure EAS Build for App Store submission
