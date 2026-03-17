# ZERO TILT — Database Schema

> Supabase / PostgreSQL 15
> Version 2.0 | March 2026

## 1. Overview

The ZERO TILT database consists of **25 tables** organized into 6 domains. The schema is designed for Supabase with PostgreSQL 15, using UUID primary keys, Row-Level Security on every table, and custom ENUM types for type safety.

| Domain | Tables | Purpose |
|--------|--------|---------|
| **User** | profiles, subscriptions, notification_preferences, privacy_settings | User identity, settings, billing |
| **Core Loop** | streaks, relapse_events, daily_pledges, daily_checkins, urge_logs | Daily engagement and streak tracking |
| **Growth** | goals, goal_checkins, journal_entries, checklist_items, checklist_completions | Self-improvement tracking |
| **Milestones** | milestones, milestone_unlocks | Achievement and gamification system |
| **Engagement** | breathing_sessions, game_sessions, app_sessions, coach_conversations, coach_messages | Feature usage tracking |
| **Community** | posts, comments, post_likes, pods, pod_members, friendships | Social features |
| **Analytics** | analytics_events | Server-side event logging |

## 2. Entity Relationship Diagram

```
                            ┌──────────────┐
                            │  auth.users  │
                            │──────────────│
                            │ id (PK)      │
                            │ email        │
                            └──────┬───────┘
                                   │ 1:1 (trigger)
                            ┌──────▼───────┐
                   ┌────────│   profiles   │────────┐
                   │        │──────────────│        │
                   │    ┌───│ id (PK/FK)   │───┐    │
                   │    │   │ trader_name  │   │    │
                   │    │   │ tilt_risk    │   │    │
                   │    │   └──────────────┘   │    │
                   │    │          │            │    │
         ┌─────────┤    │    ┌─────┼──────┐    │    ├──────────┐
         │         │    │    │     │      │    │    │          │
    ┌────▼───┐ ┌───▼────▼┐ ┌▼─────▼─┐ ┌──▼───▼┐ ┌─▼────────┐│
    │streaks │ │  goals  │ │journal │ │ urge  │ │daily     ││
    │────────│ │─────────│ │entries │ │ logs  │ │pledges   ││
    │start_dt│ │title    │ │────────│ │───────│ │──────────││
    │is_activ│ │is_custom│ │title   │ │intens │ │pledge_txt││
    │end_reas│ │         │ │content │ │trigger│ │UNIQUE    ││
    └───┬────┘ └────┬────┘ │mood    │ │resist │ │(usr,date)││
        │           │      │is_draft│ │breathe│ └──────────┘│
        │      ┌────▼────┐ │tags[]  │ └───────┘             │
        │      │goal     │ └────────┘                       │
        │      │checkins │                                  │
        │      │─────────│     ┌────────────┐    ┌──────────▼─┐
        │      │goal_id  │     │  daily     │    │subscriptions│
        │      │checked  │     │  checkins  │    │────────────│
        │      │UNIQUE   │     │────────────│    │plan (enum) │
        │      └─────────┘     │mood, energy│    │status      │
        │                      │UNIQUE      │    │revenuecat  │
        │                      └────────────┘    └────────────┘
   ┌────▼──────────┐
   │relapse_events │    ┌──────────────┐    ┌──────────────┐
   │───────────────│    │  milestones  │    │  milestone   │
   │streak_id FK   │    │  (reference) │    │  unlocks     │
   │trigger_cat    │    │──────────────│    │──────────────│
   │emotional_st   │    │ slug UNIQUE  │───>│ milestone_id │
   │lesson         │    │ category     │    │ progress     │
   │severity       │    │ req_type     │    │ is_unlocked  │
   └───────────────┘    │ req_value    │    │ unlocked_at  │
                        │ tier (enum)  │    └──────────────┘
                        └──────────────┘

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  breathing   │  │    game      │  │     app      │
  │  sessions    │  │  sessions    │  │  sessions    │
  │──────────────│  │──────────────│  │──────────────│
  │ duration_sec │  │ game_type    │  │ started_at   │
  │ cycles       │  │ score        │  │ ended_at     │
  │ context      │  │ level        │  │ duration     │
  │ completed    │  │ context      │  │ platform     │
  └──────────────┘  └──────────────┘  └──────────────┘

  ┌──────────────┐  ┌──────────────┐
  │    coach     │  │   coach      │
  │conversations │──│  messages    │
  │──────────────│  │──────────────│
  │ title        │  │ role         │
  │ message_count│  │ content      │
  │ is_active    │  │ tokens_used  │
  └──────────────┘  └──────────────┘

  COMMUNITY:
  ┌──────────┐   ┌──────────┐   ┌────────────┐
  │  posts   │──<│ comments │   │ post_likes │
  │──────────│   │──────────│   │────────────│
  │ category │   │ post_id  │   │ UNIQUE     │
  │ likes_ct │   │ content  │   │(post,user) │
  │ pinned   │   └──────────┘   └────────────┘
  └──────────┘
  ┌──────────┐   ┌─────────────┐  ┌──────────────┐
  │   pods   │──<│ pod_members │  │ friendships  │
  │──────────│   │─────────────│  │──────────────│
  │ name     │   │ role        │  │ requester FK │
  │ max=8    │   │ UNIQUE      │  │ addressee FK │
  └──────────┘   └─────────────┘  │ status       │
                                  └──────────────┘
```

## 3. Custom Types

The schema uses PostgreSQL ENUM types for type safety and query performance:

| Type | Values | Used In |
|------|--------|---------|
| `mood_type` | great, good, neutral, bad, terrible | journal_entries, daily_checkins |
| `subscription_plan` | free, monthly, yearly, lifetime | subscriptions |
| `subscription_status` | active, trial, cancelled, expired, billing_issue | subscriptions |
| `tilt_risk` | low, moderate, high, severe | profiles |
| `experience_level` | beginner, intermediate, advanced, expert, professional | profiles |
| `friendship_status` | pending, accepted, blocked | friendships |
| `milestone_tier` | bronze, silver, gold, platinum, diamond | milestones |
| `post_category` | general, wins, struggles, strategies, questions | posts |

## 4. Table Reference

### 4.1 profiles

Extends Supabase `auth.users`. Auto-created via trigger on signup. Also auto-creates notification_preferences, privacy_settings, subscriptions, and an initial streak.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users ON DELETE CASCADE | Matches auth user ID |
| `email` | TEXT | | User email |
| `full_name` | TEXT | | Display name |
| `trader_name` | TEXT | | Trading alias |
| `avatar_url` | TEXT | | Profile photo URL |
| `bio` | TEXT | | Short bio |
| `age` | INTEGER | CHECK 13-120 | |
| `trading_style` | TEXT[] | DEFAULT '{}' | e.g. ['Scalper', 'Day Trader'] |
| `markets` | TEXT[] | DEFAULT '{}' | e.g. ['Futures', 'Stocks'] |
| `trading_experience` | experience_level | DEFAULT 'beginner' | |
| `onboarding_completed` | BOOLEAN | DEFAULT FALSE | |
| `onboarding_step` | TEXT | DEFAULT 'about_you' | Current step if incomplete |
| `quiz_responses` | JSONB | DEFAULT '{}' | Tilt risk assessment answers |
| `tilt_risk_level` | tilt_risk | DEFAULT 'moderate' | Calculated from quiz |
| `why_i_trade` | TEXT | | User motivation |
| `selected_symptoms` | TEXT[] | DEFAULT '{}' | Tilt symptoms identified |
| `push_token` | TEXT | | Expo push token |
| `timezone` | TEXT | DEFAULT 'America/New_York' | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, auto-updated | |

### 4.2 streaks

Each user has one active streak (`is_active = TRUE`). On relapse, the active streak is closed and a new one begins via the `reset_streak()` function.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles, NOT NULL | |
| `start_date` | DATE | NOT NULL | When this streak began |
| `end_date` | DATE | | NULL while active |
| `days` | INTEGER | DEFAULT 0 | Computed when streak ends |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `ended_reason` | TEXT | CHECK IN ('relapse', 'manual_reset') | |
| `created_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |

**Indexes**: Partial index on `(user_id, is_active) WHERE is_active = TRUE` for instant current-streak lookup.

### 4.3 relapse_events

**NEW TABLE** — Captures detailed context when a relapse occurs. Separate from streaks to enable pattern analysis (which triggers cause relapses, emotional states, market conditions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles, NOT NULL | |
| `streak_id` | UUID | FK → streaks | The streak that was broken |
| `streak_days_lost` | INTEGER | DEFAULT 0 | How many days were lost |
| `trigger_description` | TEXT | | Free-text description |
| `trigger_category` | TEXT | CHECK IN (fomo, revenge_trade, overconfidence, boredom, news_event, social_pressure, financial_stress, other) | |
| `emotional_state` | TEXT | CHECK IN (angry, anxious, frustrated, euphoric, fearful, impulsive, stressed, other) | |
| `market_conditions` | TEXT | | What was happening in the market |
| `was_trading` | BOOLEAN | DEFAULT TRUE | Were they actively trading |
| `lesson_learned` | TEXT | | Reflection after relapse |
| `severity` | INTEGER | CHECK 1-5 | How bad was it |
| `created_at` | TIMESTAMPTZ | | |

**Indexes**: `(user_id, created_at DESC)` for history, `(user_id, trigger_category)` for pattern analysis.

### 4.4 goals + goal_checkins

Goals are selected during onboarding (presets) or created by the user (custom). Daily check-ins track whether each goal was completed that day.

**goals**: Same as v1 plus `description`, `icon`, `color`, and `sort_order`.

**goal_checkins**: One check-in per goal per day. `UNIQUE(goal_id, checked_date)`.

### 4.5 daily_pledges

One pledge per user per day. `UNIQUE(user_id, pledge_date)`.

### 4.6 urge_logs

Records each tilt urge with intensity (1-5), trigger type, coping responses, and whether the user resisted. Now includes `intensity_label`, `trigger_description`, and `duration_seconds`.

### 4.7 journal_entries

Trading journal with autosave support. Key additions in v2: `is_draft` flag for autosave, `is_pre_trade` / `is_post_trade` booleans for tag-based filtering, and `word_count` (auto-computed by trigger).

### 4.8 milestones + milestone_unlocks

**milestones** (reference table — seeded at deployment): Defines all achievements. 27 milestones across 8 categories with bronze/silver/gold/platinum/diamond tiers and XP rewards.

**milestone_unlocks** (per-user): Tracks progress toward each milestone. `progress` stores the current count, `is_unlocked` flips to TRUE when the requirement is met, and `unlocked_at` records the exact timestamp.

The `calculate_milestone_progress()` function evaluates any milestone for a user and auto-upserts the unlock row.

### 4.9 breathing_sessions

Now includes `session_type` (4-7-8, box, etc.) and `completed` boolean.

### 4.10 game_sessions

Now includes `level_reached` and `context` (voluntary, panic, urge_cooldown) to distinguish why the game was played.

### 4.11 app_sessions

**NEW TABLE** — Tracks when users open/close the app. Used for engagement analytics (DAU, session length, retention). `screens_visited` array logs the navigation path.

### 4.12 coach_conversations + coach_messages

**NEW TABLES** — AI Coach (Mika) history. Conversations group messages; each message has a `role` (user/assistant/system), content, token count, and response time.

### 4.13 Community (posts, comments, post_likes, pods, pod_members, friendships)

Same as v1 with additions: `is_anonymous` and `is_pinned` on posts, `likes_count` on comments, `avatar_url` and `trading_style` on pods. Counter triggers auto-update `likes_count`, `comments_count`, and `member_count`.

### 4.14 subscriptions

Now uses ENUM types for `plan` and `status`. Added `trial_ends_at` and `product_id` fields for RevenueCat integration.

### 4.15 analytics_events

**NEW TABLE** — Server-side event log for events fired from Edge Functions or webhooks (not from the client, which uses PostHog). JSONB `properties` column for flexible event data.

## 5. Database Functions

### Streak Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `get_current_streak(user_id)` | UUID | INTEGER | Days in the active streak |
| `get_best_streak(user_id)` | UUID | INTEGER | Best streak ever (active or ended) |
| `reset_streak(user_id, reason, trigger_cat, emotional_state, lesson)` | UUID + TEXT args | JSON | Ends streak, creates relapse_event, starts new streak. Returns `{relapse_id, days_lost, new_streak_id}` |

### Stats Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `get_user_stats(user_id)` | UUID | JSON | Dashboard stats: streak, best, relapses, urges, resist rate, journals, breathing, milestones, games, pledges, coach messages |
| `get_weekly_goal_progress(user_id)` | UUID | JSON | Goal completion rate for the current week |

### Milestone Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `calculate_milestone_progress(user_id, slug)` | UUID, TEXT | JSON | Evaluates progress, upserts milestone_unlocks, returns `{milestone, current, required, unlocked, progress_pct}` |

### Session Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `end_app_session(session_id)` | UUID | VOID | Marks app session as ended, computes duration |

### Utility Functions

| Function | Description |
|----------|-------------|
| `handle_new_user()` | Trigger: auto-creates profile, settings, subscription, and first streak on signup |
| `update_updated_at()` | Trigger: auto-updates `updated_at` timestamp on row modification |
| `compute_journal_word_count()` | Trigger: auto-computes word count on journal insert/update |
| `update_post_likes_count()` | Trigger: increments/decrements `likes_count` on posts |
| `update_post_comments_count()` | Trigger: increments/decrements `comments_count` on posts |
| `update_pod_member_count()` | Trigger: increments/decrements `member_count` on pods |
| `update_coach_message_count()` | Trigger: increments `message_count` on coach_conversations |

## 6. Example Queries

### Get current streak

```sql
SELECT get_current_streak('user-uuid') AS streak_days;
-- Returns: 23
```

### Get full dashboard stats

```sql
SELECT get_user_stats('user-uuid') AS stats;
-- Returns JSON: { current_streak: 23, best_streak: 23, total_relapses: 1,
--                 urges_resisted: 3, resist_rate: 75.0, journal_entries: 4, ... }
```

### Log an urge event

```sql
INSERT INTO urge_logs (user_id, intensity, trigger_type, trigger_description, resisted, breathing_completed, response)
VALUES (
  'user-uuid', 4, 'fomo',
  'Saw NQ spike 50 points without me',
  TRUE, TRUE,
  ARRAY['Breathing exercise', 'Walked away']
) RETURNING id, created_at;
```

### Save journal entry (with autosave)

```sql
-- First save (draft)
INSERT INTO journal_entries (user_id, title, content, is_draft)
VALUES ('user-uuid', 'Morning prep', 'Starting my review...', TRUE)
RETURNING id;

-- Autosave updates
UPDATE journal_entries
SET content = 'Starting my review. Key levels for NQ today are...',
    is_draft = TRUE
WHERE id = 'entry-uuid';

-- Final save
UPDATE journal_entries
SET content = 'Full entry text here...',
    mood = 'good', mood_score = 4,
    tags = ARRAY['Pre-Trade'],
    is_pre_trade = TRUE, is_draft = FALSE
WHERE id = 'entry-uuid';
```

### Reset streak after relapse

```sql
SELECT reset_streak(
  'user-uuid',
  'relapse',
  'revenge_trade',
  'angry',
  'Never trade after a losing streak. Walk away.'
) AS result;
-- Returns: { relapse_id: "uuid", days_lost: 23, new_streak_id: "uuid" }
```

### Calculate milestone progress

```sql
SELECT calculate_milestone_progress('user-uuid', 'streak_14d') AS progress;
-- Returns: { milestone: "Two Week Warrior", current: 23, required: 14,
--            unlocked: true, progress_pct: 100.0 }
```

### Get today's goals with check-in status

```sql
SELECT g.id, g.title, g.icon, g.color,
  EXISTS(
    SELECT 1 FROM goal_checkins gc
    WHERE gc.goal_id = g.id AND gc.checked_date = CURRENT_DATE
  ) AS checked_today
FROM goals g
WHERE g.user_id = 'user-uuid' AND g.is_active = TRUE
ORDER BY g.sort_order;
```

### Get community feed with author info

```sql
SELECT p.id, p.title, p.content, p.category, p.likes_count,
  p.comments_count, p.created_at,
  pr.trader_name, pr.avatar_url
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.category = 'wins'
ORDER BY p.is_pinned DESC, p.created_at DESC
LIMIT 20;
```

### Get leaderboard (respects privacy settings)

```sql
SELECT pr.trader_name, pr.avatar_url,
  COALESCE(CURRENT_DATE - s.start_date, 0) AS streak_days
FROM profiles pr
JOIN streaks s ON pr.id = s.user_id AND s.is_active = TRUE
JOIN privacy_settings ps ON pr.id = ps.user_id AND ps.show_leaderboard = TRUE
ORDER BY streak_days DESC
LIMIT 10;
```

### Weekly urge analytics

```sql
SELECT
  EXTRACT(DOW FROM created_at) AS day_of_week,
  COUNT(*) AS urge_count,
  ROUND(AVG(intensity), 1) AS avg_intensity,
  ROUND(COUNT(*) FILTER (WHERE resisted)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) AS resist_pct
FROM urge_logs
WHERE user_id = 'user-uuid'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY day_of_week
ORDER BY day_of_week;
```

### Get relapse patterns

```sql
SELECT trigger_category, emotional_state,
  COUNT(*) AS occurrences,
  ROUND(AVG(streak_days_lost), 0) AS avg_days_lost
FROM relapse_events
WHERE user_id = 'user-uuid'
GROUP BY trigger_category, emotional_state
ORDER BY occurrences DESC;
```

## 7. Row-Level Security Summary

| Pattern | Tables | Policy |
|---------|--------|--------|
| **Private (own data only)** | streaks, relapse_events, goals, goal_checkins, pledges, urge_logs, journal_entries, daily_checkins, checklists, milestone_unlocks, breathing, games, app_sessions, coach_*, settings | `auth.uid() = user_id` for all operations |
| **Public read, own write** | profiles, posts, comments, post_likes, pods, pod_members | `SELECT USING (true)`, `INSERT/UPDATE/DELETE USING (auth.uid() = user_id)` |
| **Public read only** | milestones | `SELECT USING (true)` — reference data, no user writes |
| **Insert only** | analytics_events | `INSERT WITH CHECK (auth.uid() = user_id)` — no client reads |
| **Read only** | subscriptions | `SELECT USING (auth.uid() = user_id)` — writes via webhook only |

## 8. Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| streaks | `idx_streaks_user_active` | `(user_id, is_active) WHERE is_active` | Instant current-streak lookup |
| streaks | `idx_streaks_user_history` | `(user_id, created_at DESC)` | Streak history timeline |
| relapse_events | `idx_relapse_user_date` | `(user_id, created_at DESC)` | Relapse history |
| relapse_events | `idx_relapse_trigger` | `(user_id, trigger_category)` | Pattern analysis |
| journal_entries | `idx_journal_user_date` | `(user_id, created_at DESC)` | Journal feed |
| journal_entries | `idx_journal_drafts` | `(user_id, is_draft) WHERE is_draft` | Quick draft lookup |
| urge_logs | `idx_urges_user_date` | `(user_id, created_at DESC)` | Urge history |
| urge_logs | `idx_urges_resisted` | `(user_id, resisted)` | Resist rate queries |
| goal_checkins | `idx_goal_checkins_user_date` | `(user_id, checked_date)` | Daily goal status |
| posts | `idx_posts_category` | `(category, created_at DESC)` | Community feed |
| milestone_unlocks | `idx_milestone_unlocks_recent` | `(user_id, unlocked_at DESC) WHERE is_unlocked` | Recent achievements |
| app_sessions | `idx_app_sessions_active` | `(user_id, is_active) WHERE is_active` | Current session |
| coach_messages | `idx_coach_messages_convo` | `(conversation_id, created_at ASC)` | Chat history |

## 9. Migration & Deployment

### Files

| File | Purpose |
|------|---------|
| `database/schema.sql` | Complete schema — reference document |
| `database/migrations/001_initial_schema.sql` | First migration (identical to schema.sql) |
| `database/seed.sql` | Development seed data (3 users, sample data, all milestones) |

### Running Locally

```bash
# Start local Supabase
supabase start

# Reset and apply all migrations + seed
supabase db reset

# Or apply migration manually
psql -h localhost -p 54322 -U postgres -d postgres -f database/migrations/001_initial_schema.sql
psql -h localhost -p 54322 -U postgres -d postgres -f database/seed.sql
```

### Deploying to Production

```bash
# Push migrations to remote Supabase project
supabase db push

# Or paste into Supabase SQL Editor in the dashboard
```

## 10. Design Decisions & Assumptions

1. **UUID primary keys everywhere** — Compatible with Supabase auth.users IDs and prevents enumeration attacks.
2. **ENUM types over CHECK constraints** — Better query performance and type safety for values that rarely change.
3. **Denormalized counters** (likes_count, comments_count, member_count) — Maintained via triggers to avoid expensive COUNT queries on every page load.
4. **Separate relapse_events table** — Streaks track duration; relapse_events track emotional context. This separation enables pattern analysis ("which triggers cause the longest streaks to break?").
5. **Journal autosave via is_draft** — Entries with `is_draft = TRUE` are not counted in stats but are preserved for the user.
6. **Partial indexes** — Used on `is_active = TRUE` columns to keep frequently-queried subsets fast.
7. **No soft deletes** — ON DELETE CASCADE handles cleanup. GDPR deletion removes all user data via cascading foreign keys.
8. **Analytics events table** — Supplements PostHog for server-side events only (webhooks, Edge Functions). Client events go directly to PostHog.
