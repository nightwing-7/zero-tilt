# ZERO TILT — 4-Week MVP Engineering Roadmap

> Version 1.0 | March 2026

## Assumptions

- **Team**: 1-2 developers (full-stack, React Native experience)
- **Starting point**: Existing Expo project with screens scaffolded, Supabase schema defined, TypeScript types generated
- **MVP scope**: Core loop (streak + urge + journal + pledge + coach) + paywall. Community features are post-MVP.
- **Definition of done**: App running on TestFlight (iOS) and internal testing track (Android) with real Supabase backend.

## Week 1: Foundation + Auth + Onboarding

**Goal**: User can sign up, complete onboarding, and land on a functional dashboard.

### Day 1-2: Project Setup

| Task | Priority | Estimate |
|------|----------|----------|
| Configure Expo Router (file-based navigation) with auth/onboarding/tabs groups | P0 | 4h |
| Set up Supabase project (dev environment), run migration 001 | P0 | 2h |
| Configure environment variables (supabaseUrl, supabaseAnonKey) via app.config.ts | P0 | 1h |
| Set up Sentry (crash reporting) + PostHog (analytics) | P1 | 2h |
| Configure EAS Build for dev client | P1 | 2h |
| Set up Zustand store with MMKV persistence (port existing appStore.ts) | P0 | 1h |

### Day 3-4: Authentication

| Task | Priority | Estimate |
|------|----------|----------|
| Welcome screen with "Sign Up" / "Sign In" CTAs | P0 | 2h |
| Email/password signup with Supabase Auth | P0 | 3h |
| Email/password signin | P0 | 2h |
| Google OAuth via expo-auth-session | P1 | 3h |
| Apple Sign-In | P1 | 3h |
| Auth state listener + protected routes (redirect to auth if no session) | P0 | 2h |
| Password reset (magic link) flow | P2 | 1h |

### Day 5: Onboarding Flow

| Task | Priority | Estimate |
|------|----------|----------|
| About You screen (name, trader name, age) | P0 | 2h |
| Trading psychology quiz (5 questions → tilt risk calculation) | P0 | 3h |
| Symptom selection screen | P1 | 2h |
| Goal selection screen (presets + custom) | P0 | 2h |
| Commitment/pledge screen (digital signature) | P0 | 2h |
| Education carousel (swipeable cards) | P1 | 2h |
| Save all onboarding data to profiles + goals tables | P0 | 1h |

### Week 1 Deliverable
User can sign up → complete onboarding → data persists in Supabase → lands on dashboard shell.

---

## Week 2: Core Loop (Streak + Urge + Journal + Pledge)

**Goal**: The daily engagement loop works end-to-end with real data.

### Day 6-7: Dashboard + Streak

| Task | Priority | Estimate |
|------|----------|----------|
| Dashboard screen — streak card, rank display, daily stats | P0 | 4h |
| Fetch streak from Supabase (get_current_streak RPC) | P0 | 1h |
| Streak milestone celebrations (confetti via react-native-reanimated) | P1 | 2h |
| Relapse flow — confirmation dialog → reset_streak RPC → encouragement screen | P0 | 3h |
| Rank system display (Spark → Legend based on streak days) | P1 | 1h |
| Daily pledge screen — sign today, check if already pledged (UNIQUE constraint) | P0 | 2h |

### Day 8-9: Urge Tracking + Panic Button

| Task | Priority | Estimate |
|------|----------|----------|
| Urge tracker screen — intensity slider, trigger selection, coping strategy checklist | P0 | 4h |
| Save urge log to Supabase | P0 | 1h |
| Panic button screen — full-screen "BREATHE" with guided 4-7-8 animation | P0 | 4h |
| Breathing exercise with animated circle (react-native-reanimated) + haptic feedback | P0 | 3h |
| Log breathing session to Supabase | P1 | 1h |
| Post-panic flow — "How do you feel now?" → log outcome | P1 | 2h |

### Day 10: Journal

| Task | Priority | Estimate |
|------|----------|----------|
| Journal list screen — entries in reverse chronological order, pull-to-refresh | P0 | 3h |
| New entry screen — title, content, mood picker, tags | P0 | 3h |
| Save/update/delete journal entries via Supabase | P0 | 2h |
| Free tier limit enforcement (3 entries/week) | P1 | 1h |

### Week 2 Deliverable
User can: view streak → sign daily pledge → log urges → use panic button with breathing → write journal entries. All data persists.

---

## Week 3: Goals + Analytics + AI Coach + Games

**Goal**: The differentiated features that make ZERO TILT unique are functional.

### Day 11-12: Goals + Pre-Trade Checklist

| Task | Priority | Estimate |
|------|----------|----------|
| Goals tracking screen — daily checkbox grid (Mon-Sun) | P0 | 4h |
| Toggle goal check-in (upsert to goal_checkins) | P0 | 2h |
| Goal progress calculation (weekly/overall percentage) | P0 | 2h |
| Pre-trade checklist screen — ordered list with checkboxes | P1 | 3h |
| Add custom checklist items | P1 | 1h |
| Free tier limits for goals (3 max) and checklist (5 max) | P1 | 1h |

### Day 13: Analytics

| Task | Priority | Estimate |
|------|----------|----------|
| Analytics overview tab — streak chart, urge frequency, mood trend | P0 | 4h |
| Trends tab (Pro) — detailed charts using react-native-svg or Victory | P1 | 4h |
| Goals breakdown tab — per-goal completion rates | P1 | 2h |
| Share progress button — generate stat card image (react-native-view-shot) | P2 | 3h |

### Day 14: AI Coach (Mika)

| Task | Priority | Estimate |
|------|----------|----------|
| Coach chat UI — message list with user/coach bubbles, input field | P0 | 4h |
| Supabase Edge Function: `coach-message` — system prompt, user context injection, Claude API call | P0 | 4h |
| Conversation persistence (store messages in Supabase) | P0 | 2h |
| Free tier limit (3 messages/day) | P1 | 1h |
| Streaming response display | P2 | 2h |

### Day 15: Mini-Games

| Task | Priority | Estimate |
|------|----------|----------|
| Game selection screen with 6 game cards | P0 | 2h |
| Memory Match game (card flip matching) | P0 | 3h |
| Stroop Test game (color word mismatch) | P1 | 2h |
| Math Blitz game (quick mental math) | P1 | 2h |
| Save game scores to Supabase | P1 | 1h |
| Free tier gate (only Memory for free users) | P1 | 1h |

### Week 3 Deliverable
All core features functional: goals, analytics, AI coach responds with context, games playable. Feature gating enforced for free tier.

---

## Week 4: Subscriptions + Polish + Launch Prep

**Goal**: App is monetization-ready and polished enough for TestFlight/internal testing.

### Day 16-17: Subscriptions (RevenueCat)

| Task | Priority | Estimate |
|------|----------|----------|
| Create products in App Store Connect + Google Play Console | P0 | 2h |
| Configure RevenueCat: products, entitlements, offerings | P0 | 2h |
| Initialize RevenueCat SDK in app (lib/purchases.ts) | P0 | 2h |
| Paywall screen — plan cards, feature list, purchase buttons | P0 | 4h |
| Purchase flow — initiate purchase → confirm → update UI | P0 | 3h |
| Restore purchases flow | P0 | 1h |
| RevenueCat webhook Edge Function → update subscriptions table | P0 | 3h |
| Integrate useSubscription hook into all feature-gated screens | P0 | 2h |
| Test sandbox purchases on both platforms | P0 | 2h |

### Day 18: Profile + Settings

| Task | Priority | Estimate |
|------|----------|----------|
| Profile screen — avatar, stats, rank badge, streak display | P0 | 3h |
| Edit profile screen — form fields, save to Supabase | P1 | 2h |
| Notification preferences screen (toggle switches) | P1 | 2h |
| Privacy settings screen | P2 | 1h |
| Help/FAQ screen | P2 | 1h |

### Day 19: Push Notifications

| Task | Priority | Estimate |
|------|----------|----------|
| Configure expo-notifications (request permissions, register token) | P0 | 2h |
| Store push tokens in Supabase (new column on profiles) | P0 | 1h |
| Edge Function: daily streak reminder notification (cron) | P1 | 3h |
| Edge Function: streak milestone notification | P1 | 2h |
| Deep link handling (notification tap → correct screen) | P1 | 2h |

### Day 20: Polish + QA + Build

| Task | Priority | Estimate |
|------|----------|----------|
| Loading states and skeleton screens for all data-fetching screens | P0 | 3h |
| Error handling — toast notifications, retry buttons, offline fallback | P0 | 3h |
| App icon and splash screen | P0 | 1h |
| Haptic feedback on key interactions (pledge, relapse, games, streaks) | P1 | 1h |
| EAS Build — create iOS TestFlight build | P0 | 2h |
| EAS Build — create Android internal test APK | P0 | 1h |
| Smoke test all flows on physical devices | P0 | 3h |
| Fix critical bugs found during QA | P0 | 4h |

### Week 4 Deliverable
App is on TestFlight and Android internal test track. Subscriptions work in sandbox. All core flows tested end-to-end on physical devices.

---

## Post-MVP Priorities (Weeks 5-8)

These features are important but explicitly excluded from the 4-week MVP to keep scope manageable:

| Feature | Priority | Estimated Effort |
|---------|----------|-----------------|
| Community forum (posts, comments, likes) | P1 | 1 week |
| Pods/Clans (accountability groups) | P2 | 1 week |
| Real-time chat in pods | P2 | 1 week |
| Friendships system | P2 | 3 days |
| Leaderboard | P1 | 2 days |
| Badge/achievement system | P1 | 3 days |
| Remaining mini-games (Scramble, Find It, Breath) | P2 | 3 days |
| Content moderation (automated) | P2 | 3 days |
| Data export (GDPR) | P1 | 2 days |
| Account deletion (GDPR) | P1 | 1 day |
| Onboarding A/B testing | P2 | 2 days |
| Advanced analytics charts | P2 | 3 days |
| Multi-language support | P3 | 1 week |

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| App Store rejection (subscription compliance) | Follow Apple's auto-renewable subscription guidelines exactly — Terms link, restore button, clear pricing, no misleading trial language |
| Claude API latency on coach | Implement streaming responses + 10-second timeout with fallback "Coach is thinking..." message |
| Expo SDK limitations | Use Expo Dev Client (custom dev build) which allows any native module |
| Supabase free tier limits during development | Use Supabase Pro ($25/mo) from day 1 — the cost is negligible and avoids surprises |
| Scope creep | Community features are explicitly post-MVP. If there is pressure to include them, the answer is "Week 5." |

## Definition of "MVP Done"

- [ ] User can sign up (email + at least one OAuth provider)
- [ ] Onboarding flow saves quiz results, symptoms, goals, and pledge
- [ ] Dashboard shows live streak from Supabase
- [ ] Relapse flow works (confirmation → reset → encouragement)
- [ ] Daily pledge can be signed (once per day)
- [ ] Urge tracker logs intensity, trigger, and coping strategies
- [ ] Panic button launches guided breathing exercise
- [ ] Journal supports create/read/update/delete
- [ ] Goals tracking with daily check-in grid
- [ ] Pre-trade checklist with toggleable items
- [ ] AI Coach (Mika) responds with context-aware messages
- [ ] At least 3 mini-games are playable
- [ ] Analytics overview shows streak history and urge data
- [ ] Paywall displays plans and completes purchases (sandbox)
- [ ] Free tier limits enforced on all gated features
- [ ] Profile screen shows user stats and rank
- [ ] Push notifications deliver daily reminders
- [ ] App runs on iOS (TestFlight) and Android (internal track)
- [ ] No crashes on main flows (verified by Sentry)
- [ ] All screens have loading states and error handling
