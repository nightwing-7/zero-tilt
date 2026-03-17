# ZERO TILT — Database Schema

> Supabase / PostgreSQL 15
> Version 1.0 | March 2026

## 1. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│  auth.users  │       │   profiles   │       │  subscriptions   │
│──────────────│       │──────────────│       │──────────────────│
│ id (PK)      │──1:1──│ id (PK/FK)   │──1:1──│ user_id (FK)     │
│ email        │       │ email        │       │ plan             │
│ ...          │       │ full_name    │       │ status           │
└──────────────┘       │ trader_name  │       │ revenue_cat_id   │
                       │ avatar_url   │       └──────────────────┘
                       │ tilt_risk    │
                       │ onboarding   │
                       └──────┬───────┘
                              │
          ┌───────────────────┼───────────────────────┐
          │                   │                       │
    ┌─────▼──────┐    ┌──────▼───────┐    ┌──────────▼────────┐
    │  streaks   │    │journal_entries│    │   urge_logs       │
    │────────────│    │──────────────│    │───────────────────│
    │ user_id FK │    │ user_id FK   │    │ user_id FK        │
    │ start_date │    │ title        │    │ intensity (1-5)   │
    │ days       │    │ content      │    │ trigger           │
    │ is_active  │    │ mood         │    │ resisted          │
    │ end_reason │    │ tags[]       │    │ breathing_done    │
    └────────────┘    └──────────────┘    └───────────────────┘
          │
          │           ┌──────────────┐    ┌───────────────────┐
          │           │    goals     │    │   daily_pledges   │
          │           │──────────────│    │───────────────────│
          │           │ user_id FK   │    │ user_id FK        │
          │           │ title        │──┐ │ pledge_date       │
          │           │ is_custom    │  │ │ UNIQUE(user,date) │
          │           └──────────────┘  │ └───────────────────┘
          │                             │
          │           ┌─────────────────▼─┐
          │           │  goal_checkins    │
          │           │───────────────────│
          │           │ goal_id FK        │
          │           │ user_id FK        │
          │           │ checked_date      │
          │           │ UNIQUE(goal,date) │
          │           └───────────────────┘
          │
    ┌─────┴───────────────────────────────────────────┐
    │                                                 │
    │     COMMUNITY                                   │
    │  ┌──────────┐   ┌──────────┐   ┌────────────┐  │
    │  │  posts   │──<│ comments │   │ post_likes │  │
    │  │──────────│   │──────────│   │────────────│  │
    │  │ user_id  │   │ post_id  │   │ post_id    │  │
    │  │ category │   │ user_id  │   │ user_id    │  │
    │  │ content  │   │ content  │   │ UNIQUE     │  │
    │  └──────────┘   └──────────┘   └────────────┘  │
    │                                                 │
    │  ┌──────────┐   ┌─────────────┐                 │
    │  │   pods   │──<│ pod_members │                 │
    │  │──────────│   │─────────────│                 │
    │  │ name     │   │ pod_id FK   │                 │
    │  │ creator  │   │ user_id FK  │                 │
    │  │ max=8    │   │ role        │                 │
    │  └──────────┘   └─────────────┘                 │
    │                                                 │
    │  ┌──────────────┐                               │
    │  │ friendships  │                               │
    │  │──────────────│                               │
    │  │ requester FK │                               │
    │  │ addressee FK │                               │
    │  │ status       │                               │
    │  └──────────────┘                               │
    └─────────────────────────────────────────────────┘
```

## 2. Table Definitions

### 2.1 profiles

Extends Supabase `auth.users`. Created automatically via trigger on signup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Matches auth user ID |
| `email` | TEXT | | User email |
| `full_name` | TEXT | | Display name |
| `trader_name` | TEXT | | Trading alias |
| `avatar_url` | TEXT | | Profile photo URL (Supabase Storage) |
| `bio` | TEXT | | Short bio |
| `age` | INTEGER | | User age |
| `trading_style` | TEXT[] | DEFAULT '{}' | e.g. ['Scalper', 'Day Trader'] |
| `markets` | TEXT[] | DEFAULT '{}' | e.g. ['Futures', 'Stocks'] |
| `trading_experience` | TEXT | DEFAULT 'beginner' | beginner, intermediate, advanced, expert, professional |
| `onboarding_completed` | BOOLEAN | DEFAULT FALSE | Whether onboarding flow is done |
| `quiz_responses` | JSONB | DEFAULT '{}' | Tilt risk assessment quiz answers |
| `tilt_risk_level` | TEXT | DEFAULT 'moderate' | Calculated: low, moderate, high, severe |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Trigger**: `on_auth_user_created` — automatically creates a profile row when a new user signs up.

### 2.2 streaks

Tracks tilt-free streaks. Each active streak has `is_active = TRUE`. On relapse, the current streak is ended and a new one started.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `start_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | When this streak began |
| `end_date` | DATE | | When this streak ended (NULL if active) |
| `days` | INTEGER | DEFAULT 0 | Calculated on end |
| `is_active` | BOOLEAN | DEFAULT TRUE | Only one active streak per user |
| `ended_reason` | TEXT | | 'relapse' or 'manual_reset' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index**: `idx_streaks_user_active` on `(user_id, is_active)` — fast lookup of current streak.

### 2.3 journal_entries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `title` | TEXT | NOT NULL | Entry title |
| `content` | TEXT | | Entry body |
| `mood` | TEXT | CHECK IN ('great','good','neutral','bad','terrible') | |
| `mood_emoji` | TEXT | | Emoji representation |
| `tags` | TEXT[] | DEFAULT '{}' | ['Pre-Trade', 'Post-Trade', 'Tilt Reflection'] |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index**: `idx_journal_user_date` on `(user_id, created_at DESC)` — journal feed in reverse chronological order.

### 2.4 urge_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `intensity` | INTEGER | CHECK 1-5 | 1=mild, 5=overwhelming |
| `trigger` | TEXT | NOT NULL | What triggered the urge |
| `location` | TEXT | | Where they were |
| `is_alone` | BOOLEAN | | Were they alone |
| `response` | TEXT[] | DEFAULT '{}' | Actions taken |
| `resisted` | BOOLEAN | DEFAULT TRUE | Did they resist the urge |
| `breathing_completed` | BOOLEAN | DEFAULT FALSE | Did they complete breathing exercise |
| `notes` | TEXT | | Additional context |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index**: `idx_urges_user_date` on `(user_id, created_at DESC)`.

### 2.5 goals + goal_checkins

**goals**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `title` | TEXT | NOT NULL | Goal name |
| `is_custom` | BOOLEAN | DEFAULT FALSE | User-created vs preset |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**goal_checkins**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `goal_id` | UUID | FK → goals(id), NOT NULL | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `checked_date` | DATE | DEFAULT CURRENT_DATE | |
| `completed` | BOOLEAN | DEFAULT TRUE | |

**Constraint**: `UNIQUE(goal_id, checked_date)` — one check-in per goal per day.

**Index**: `idx_goal_checkins_date` on `(user_id, checked_date)`.

### 2.6 daily_pledges

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `pledge_text` | TEXT | NOT NULL | The commitment text |
| `signed_name` | TEXT | | Digital signature name |
| `pledge_date` | DATE | DEFAULT CURRENT_DATE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint**: `UNIQUE(user_id, pledge_date)` — one pledge per day.

### 2.7 daily_checkins

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `mood` | TEXT | CHECK IN ('great','good','neutral','bad','terrible') | |
| `mood_score` | INTEGER | CHECK 1-5 | |
| `notes` | TEXT | | |
| `checkin_date` | DATE | DEFAULT CURRENT_DATE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint**: `UNIQUE(user_id, checkin_date)` — one check-in per day.

### 2.8 checklist_items + checklist_completions

Pre-trade checklist system. Users have default items and can add custom ones.

**checklist_items**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `title` | TEXT | NOT NULL | Checklist item text |
| `is_custom` | BOOLEAN | DEFAULT FALSE | |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |

**checklist_completions**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `item_id` | UUID | FK → checklist_items(id), NOT NULL | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `completed_date` | DATE | DEFAULT CURRENT_DATE | |

**Constraint**: `UNIQUE(item_id, completed_date)`.

### 2.9 badges + user_badges

**badges** (static reference table, seeded at deployment):
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `name` | TEXT | UNIQUE, NOT NULL | Badge display name |
| `description` | TEXT | | What it means |
| `icon_name` | TEXT | | Icon identifier |
| `requirement_type` | TEXT | | 'streak_days', 'urges_resisted', 'journal_entries', etc. |
| `requirement_value` | INTEGER | | Number needed to earn |
| `tier` | TEXT | DEFAULT 'bronze' | bronze, silver, gold, platinum, diamond |

**user_badges**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `badge_id` | UUID | FK → badges(id), NOT NULL | |
| `earned_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint**: `UNIQUE(user_id, badge_id)`.

### 2.10 breathing_sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `duration_seconds` | INTEGER | | How long the session lasted |
| `cycles_completed` | INTEGER | | Number of breath cycles |
| `context` | TEXT | | 'panic', 'urge_tracker', 'voluntary' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### 2.11 Community Tables

**posts**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `title` | TEXT | | Optional title |
| `content` | TEXT | NOT NULL | Post body |
| `category` | TEXT | DEFAULT 'general' | wins, struggles, strategies, questions, general |
| `likes_count` | INTEGER | DEFAULT 0 | Denormalized count |
| `comments_count` | INTEGER | DEFAULT 0 | Denormalized count |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index**: `idx_posts_category` on `(category, created_at DESC)`.

**comments**:
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `post_id` | UUID | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | FK → profiles(id) |
| `content` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**post_likes**:
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `post_id` | UUID | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | FK → profiles(id) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Constraint**: `UNIQUE(post_id, user_id)`.

### 2.12 pods + pod_members

Accountability groups (called "Clans" in the prototype).

**pods**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `name` | TEXT | NOT NULL | Pod name |
| `description` | TEXT | | |
| `creator_id` | UUID | FK → profiles(id) ON DELETE SET NULL | |
| `max_members` | INTEGER | DEFAULT 8 | Small accountability groups |
| `is_public` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**pod_members**:
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `pod_id` | UUID | FK → pods(id) ON DELETE CASCADE |
| `user_id` | UUID | FK → profiles(id) ON DELETE CASCADE |
| `role` | TEXT | DEFAULT 'member' — 'admin' or 'member' |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Constraint**: `UNIQUE(pod_id, user_id)`.

### 2.13 friendships

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `requester_id` | UUID | FK → profiles(id), NOT NULL | Who sent the request |
| `addressee_id` | UUID | FK → profiles(id), NOT NULL | Who received it |
| `status` | TEXT | DEFAULT 'pending' | pending, accepted, blocked |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint**: `UNIQUE(requester_id, addressee_id)`.

### 2.14 game_sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), NOT NULL | |
| `game_type` | TEXT | NOT NULL | 'memory', 'stroop', 'math_blitz', 'scramble', 'findit', 'breath' |
| `score` | INTEGER | DEFAULT 0 | |
| `duration_seconds` | INTEGER | | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### 2.15 Settings Tables

**notification_preferences** (one row per user):
| Column | Type | Default |
|--------|------|---------|
| `pre_market_reminder` | BOOLEAN | TRUE |
| `post_market_reflection` | BOOLEAN | TRUE |
| `daily_checkin` | BOOLEAN | TRUE |
| `urge_cooldown_alert` | BOOLEAN | TRUE |
| `streak_milestones` | BOOLEAN | TRUE |
| `weekly_report` | BOOLEAN | TRUE |
| `community_posts` | BOOLEAN | FALSE |
| `direct_messages` | BOOLEAN | TRUE |

**privacy_settings** (one row per user):
| Column | Type | Default |
|--------|------|---------|
| `profile_visible` | BOOLEAN | TRUE |
| `show_streak` | BOOLEAN | TRUE |
| `show_leaderboard` | BOOLEAN | TRUE |
| `show_activity` | BOOLEAN | FALSE |
| `analytics_opt_in` | BOOLEAN | TRUE |

### 2.16 subscriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → profiles(id), UNIQUE | One subscription record per user |
| `plan` | TEXT | DEFAULT 'free' | free, monthly, yearly, lifetime |
| `status` | TEXT | DEFAULT 'active' | active, cancelled, expired, trial |
| `started_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `expires_at` | TIMESTAMPTZ | | NULL for free/lifetime |
| `revenue_cat_id` | TEXT | | RevenueCat customer ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

## 3. Database Functions

### get_current_streak(user_id)

Returns the number of tilt-free days for the user's active streak.

```sql
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(CURRENT_DATE - start_date, 0)
  FROM streaks
  WHERE user_id = p_user_id AND is_active = TRUE
  ORDER BY created_at DESC LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

### reset_streak(user_id, reason)

Ends the current streak and starts a new one (relapse flow).

```sql
CREATE OR REPLACE FUNCTION reset_streak(p_user_id UUID, p_reason TEXT DEFAULT 'relapse')
RETURNS VOID AS $$
BEGIN
  UPDATE streaks
  SET is_active = FALSE, end_date = CURRENT_DATE,
      days = CURRENT_DATE - start_date, ended_reason = p_reason
  WHERE user_id = p_user_id AND is_active = TRUE;

  INSERT INTO streaks (user_id, start_date, is_active)
  VALUES (p_user_id, CURRENT_DATE, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_user_stats(user_id)

Returns a JSON object with all key stats for the dashboard and sharing.

```sql
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'current_streak', COALESCE(get_current_streak(p_user_id), 0),
    'best_streak', COALESCE((SELECT MAX(days) FROM streaks WHERE user_id = p_user_id), 0),
    'total_relapses', (SELECT COUNT(*) FROM streaks WHERE user_id = p_user_id AND is_active = FALSE),
    'urges_resisted', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id AND resisted = TRUE),
    'total_urges', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id),
    'journal_entries', (SELECT COUNT(*) FROM journal_entries WHERE user_id = p_user_id),
    'breathing_sessions', (SELECT COUNT(*) FROM breathing_sessions WHERE user_id = p_user_id),
    'badges_earned', (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id)
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

## 4. Example Queries

### Get dashboard data for a user

```sql
-- Current streak + stats in one call
SELECT get_user_stats('user-uuid-here') AS stats;

-- Recent journal entries
SELECT id, title, mood, mood_emoji, tags, created_at
FROM journal_entries
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC
LIMIT 5;

-- Today's goals with check-in status
SELECT g.id, g.title,
  EXISTS(
    SELECT 1 FROM goal_checkins gc
    WHERE gc.goal_id = g.id AND gc.checked_date = CURRENT_DATE
  ) AS checked_today
FROM goals g
WHERE g.user_id = 'user-uuid-here' AND g.is_active = TRUE
ORDER BY g.created_at;
```

### Get community feed

```sql
SELECT p.*, pr.trader_name, pr.avatar_url
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.category = 'wins'
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;
```

### Get leaderboard (top streaks)

```sql
SELECT pr.trader_name, pr.avatar_url,
  COALESCE(CURRENT_DATE - s.start_date, 0) AS streak_days
FROM profiles pr
JOIN streaks s ON pr.id = s.user_id AND s.is_active = TRUE
JOIN privacy_settings ps ON pr.id = ps.user_id AND ps.show_leaderboard = TRUE
ORDER BY streak_days DESC
LIMIT 10;
```

### Weekly analytics

```sql
-- Urge frequency by day of week (last 30 days)
SELECT
  EXTRACT(DOW FROM created_at) AS day_of_week,
  COUNT(*) AS urge_count,
  AVG(intensity) AS avg_intensity,
  SUM(CASE WHEN resisted THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS resist_rate
FROM urge_logs
WHERE user_id = 'user-uuid-here'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY day_of_week
ORDER BY day_of_week;
```

## 5. Migration Strategy

Migrations are managed via the Supabase CLI and stored in `supabase/migrations/`.

| Migration | File | Description |
|-----------|------|-------------|
| 001 | `001_initial_schema.sql` | All tables, indexes, RLS, triggers, seed data (DONE) |
| 002 | `002_add_coach_conversations.sql` | Coach conversation history table (planned) |
| 003 | `003_add_chat_messages.sql` | Real-time chat for pods (post-MVP) |

### Running Migrations

```bash
# Local development
supabase start
supabase db reset  # Drops and recreates from migrations

# Deploy to staging/production
supabase db push --db-url "postgresql://..."
```
