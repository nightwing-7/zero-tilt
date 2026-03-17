-- ================================================================
-- ZERO TILT — Complete Database Schema
-- PostgreSQL 15 / Supabase
-- Version 2.0 | March 2026
--
-- This file contains the FULL schema definition.
-- For incremental deployment, use migrations/ instead.
-- ================================================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CUSTOM TYPES
-- ============================================
DO $$ BEGIN
  CREATE TYPE mood_type AS ENUM ('great', 'good', 'neutral', 'bad', 'terrible');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('free', 'monthly', 'yearly', 'lifetime');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'cancelled', 'expired', 'billing_issue');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tilt_risk AS ENUM ('low', 'moderate', 'high', 'severe');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'professional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE milestone_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_category AS ENUM ('general', 'wins', 'struggles', 'strategies', 'questions');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ================================================================
-- 1. USER PROFILES
-- Extends Supabase auth.users. Auto-created via trigger on signup.
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT,
  full_name             TEXT,
  trader_name           TEXT,
  avatar_url            TEXT,
  bio                   TEXT,
  age                   INTEGER CHECK (age >= 13 AND age <= 120),
  trading_style         TEXT[] DEFAULT '{}',
  markets               TEXT[] DEFAULT '{}',
  trading_experience    experience_level DEFAULT 'beginner',
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  onboarding_step       TEXT DEFAULT 'about_you',
  quiz_responses        JSONB DEFAULT '{}',
  tilt_risk_level       tilt_risk DEFAULT 'moderate',
  why_i_trade           TEXT,
  selected_symptoms     TEXT[] DEFAULT '{}',
  push_token            TEXT,
  timezone              TEXT DEFAULT 'America/New_York',
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_trader_name ON profiles(trader_name);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  -- Also create default settings rows
  INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
  INSERT INTO privacy_settings (user_id) VALUES (NEW.id);
  INSERT INTO subscriptions (user_id) VALUES (NEW.id);
  -- Start first streak
  INSERT INTO streaks (user_id, start_date, is_active) VALUES (NEW.id, CURRENT_DATE, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 2. STREAKS
-- Tracks tilt-free streaks. Only one active streak per user.
-- On relapse, current streak is ended and a new one begins.
-- ================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date      DATE,
  days          INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  ended_reason  TEXT CHECK (ended_reason IN ('relapse', 'manual_reset')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_streaks_user_active ON streaks(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_streaks_user_history ON streaks(user_id, created_at DESC);

CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 3. RELAPSE EVENTS
-- Detailed record of each relapse, separate from streak end.
-- Captures emotional context for pattern analysis.
-- ================================================================
CREATE TABLE IF NOT EXISTS relapse_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_id           UUID REFERENCES streaks(id) ON DELETE SET NULL,
  streak_days_lost    INTEGER DEFAULT 0,
  trigger_description TEXT,
  trigger_category    TEXT CHECK (trigger_category IN (
    'fomo', 'revenge_trade', 'overconfidence', 'boredom',
    'news_event', 'social_pressure', 'financial_stress', 'other'
  )),
  emotional_state     TEXT CHECK (emotional_state IN (
    'angry', 'anxious', 'frustrated', 'euphoric',
    'fearful', 'impulsive', 'stressed', 'other'
  )),
  market_conditions   TEXT,
  was_trading         BOOLEAN DEFAULT TRUE,
  lesson_learned      TEXT,
  severity            INTEGER CHECK (severity BETWEEN 1 AND 5) DEFAULT 3,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_relapse_user_date ON relapse_events(user_id, created_at DESC);
CREATE INDEX idx_relapse_trigger ON relapse_events(user_id, trigger_category);


-- ================================================================
-- 4. GOALS
-- User goals selected during onboarding + custom goals.
-- ================================================================
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  color       TEXT,
  is_custom   BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_goals_user_active ON goals(user_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 5. GOAL PROGRESS (goal_checkins)
-- Daily check-ins per goal. One check-in per goal per day.
-- ================================================================
CREATE TABLE IF NOT EXISTS goal_checkins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id       UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checked_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  completed     BOOLEAN DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(goal_id, checked_date)
);

CREATE INDEX idx_goal_checkins_user_date ON goal_checkins(user_id, checked_date);
CREATE INDEX idx_goal_checkins_goal ON goal_checkins(goal_id, checked_date DESC);


-- ================================================================
-- 6. DAILY PLEDGES
-- Users sign a commitment pledge each trading day.
-- ================================================================
CREATE TABLE IF NOT EXISTS daily_pledges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pledge_text   TEXT NOT NULL,
  signed_name   TEXT,
  pledge_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, pledge_date)
);

CREATE INDEX idx_pledges_user_date ON daily_pledges(user_id, pledge_date DESC);


-- ================================================================
-- 7. URGE LOGS
-- Records each time a user feels the urge to tilt/revenge trade.
-- ================================================================
CREATE TABLE IF NOT EXISTS urge_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intensity             INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  intensity_label       TEXT,
  trigger_type          TEXT NOT NULL,
  trigger_description   TEXT,
  location              TEXT,
  is_alone              BOOLEAN,
  response              TEXT[] DEFAULT '{}',
  resisted              BOOLEAN DEFAULT TRUE,
  breathing_completed   BOOLEAN DEFAULT FALSE,
  duration_seconds      INTEGER,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_urges_user_date ON urge_logs(user_id, created_at DESC);
CREATE INDEX idx_urges_resisted ON urge_logs(user_id, resisted);
CREATE INDEX idx_urges_intensity ON urge_logs(user_id, intensity);


-- ================================================================
-- 8. JOURNAL ENTRIES
-- Trading journal with mood tracking and tags.
-- Supports autosave via updated_at tracking.
-- ================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT,
  mood            mood_type,
  mood_score      INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  mood_emoji      TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_pre_trade    BOOLEAN DEFAULT FALSE,
  is_post_trade   BOOLEAN DEFAULT FALSE,
  is_draft        BOOLEAN DEFAULT FALSE,
  word_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_mood ON journal_entries(user_id, mood);
CREATE INDEX idx_journal_drafts ON journal_entries(user_id, is_draft) WHERE is_draft = TRUE;

CREATE TRIGGER journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 9. DAILY CHECK-INS
-- Daily mood tracking separate from journal entries.
-- ================================================================
CREATE TABLE IF NOT EXISTS daily_checkins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood          mood_type,
  mood_score    INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  energy_level  INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  notes         TEXT,
  checkin_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);


-- ================================================================
-- 10. PRE-TRADE CHECKLIST
-- ================================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  is_custom   BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_completions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id         UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(item_id, completed_date)
);

CREATE INDEX idx_checklist_user ON checklist_items(user_id, sort_order);
CREATE INDEX idx_checklist_comp_date ON checklist_completions(user_id, completed_date);


-- ================================================================
-- 11. MILESTONES (replaces badges)
-- Static reference table defining all achievable milestones.
-- Seeded at deployment, not user-created.
-- ================================================================
CREATE TABLE IF NOT EXISTS milestones (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  icon_name         TEXT,
  category          TEXT NOT NULL CHECK (category IN (
    'streak', 'urge', 'journal', 'breathing',
    'community', 'game', 'checklist', 'goal'
  )),
  requirement_type  TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  tier              milestone_tier DEFAULT 'bronze',
  sort_order        INTEGER DEFAULT 0,
  xp_reward         INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_milestones_category ON milestones(category, sort_order);
CREATE INDEX idx_milestones_tier ON milestones(tier);


-- ================================================================
-- 12. MILESTONE UNLOCKS (replaces user_badges)
-- Records when a user earns a milestone.
-- ================================================================
CREATE TABLE IF NOT EXISTS milestone_unlocks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id  UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  progress      INTEGER DEFAULT 0,
  is_unlocked   BOOLEAN DEFAULT FALSE,
  unlocked_at   TIMESTAMPTZ,
  notified      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX idx_milestone_unlocks_user ON milestone_unlocks(user_id, is_unlocked);
CREATE INDEX idx_milestone_unlocks_recent ON milestone_unlocks(user_id, unlocked_at DESC) WHERE is_unlocked = TRUE;

CREATE TRIGGER milestone_unlocks_updated_at
  BEFORE UPDATE ON milestone_unlocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 13. BREATHING SESSIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type      TEXT DEFAULT '4-7-8',
  duration_seconds  INTEGER NOT NULL,
  cycles_completed  INTEGER DEFAULT 0,
  completed         BOOLEAN DEFAULT TRUE,
  context           TEXT CHECK (context IN ('panic', 'urge_tracker', 'voluntary', 'game')),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_breathing_user_date ON breathing_sessions(user_id, created_at DESC);


-- ================================================================
-- 14. GAME SESSIONS
-- Tracks play history for all mini-games.
-- ================================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_type         TEXT NOT NULL CHECK (game_type IN (
    'memory', 'stroop', 'math_blitz', 'scramble', 'findit', 'breath'
  )),
  score             INTEGER DEFAULT 0,
  duration_seconds  INTEGER,
  level_reached     INTEGER DEFAULT 1,
  context           TEXT CHECK (context IN ('voluntary', 'panic', 'urge_cooldown')),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_games_user_type ON game_sessions(user_id, game_type, created_at DESC);
CREATE INDEX idx_games_user_score ON game_sessions(user_id, game_type, score DESC);


-- ================================================================
-- 15. APP SESSIONS
-- Tracks when users open/close the app for engagement analytics.
-- ================================================================
CREATE TABLE IF NOT EXISTS app_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER,
  platform          TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_version       TEXT,
  screens_visited   TEXT[] DEFAULT '{}',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_app_sessions_user ON app_sessions(user_id, started_at DESC);
CREATE INDEX idx_app_sessions_active ON app_sessions(user_id, is_active) WHERE is_active = TRUE;


-- ================================================================
-- 16. COACH CONVERSATIONS
-- AI Coach (Mika) conversation history.
-- ================================================================
CREATE TABLE IF NOT EXISTS coach_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  message_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content           TEXT NOT NULL,
  tokens_used       INTEGER DEFAULT 0,
  response_time_ms  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coach_convos_user ON coach_conversations(user_id, updated_at DESC);
CREATE INDEX idx_coach_messages_convo ON coach_messages(conversation_id, created_at ASC);
CREATE INDEX idx_coach_messages_user_daily ON coach_messages(user_id, created_at DESC);

CREATE TRIGGER coach_conversations_updated_at
  BEFORE UPDATE ON coach_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 17. COMMUNITY — POSTS
-- ================================================================
CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT NOT NULL,
  category        post_category DEFAULT 'general',
  is_anonymous    BOOLEAN DEFAULT FALSE,
  likes_count     INTEGER DEFAULT 0,
  comments_count  INTEGER DEFAULT 0,
  is_pinned       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_posts_category ON posts(category, created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_pinned ON posts(is_pinned, created_at DESC) WHERE is_pinned = TRUE;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 18. COMMUNITY — COMMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);


-- ================================================================
-- 19. COMMUNITY — LIKES
-- ================================================================
CREATE TABLE IF NOT EXISTS post_likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);


-- ================================================================
-- 20. PODS (Accountability Groups / Clans)
-- ================================================================
CREATE TABLE IF NOT EXISTS pods (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  avatar_url    TEXT,
  creator_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  max_members   INTEGER DEFAULT 8 CHECK (max_members BETWEEN 2 AND 50),
  member_count  INTEGER DEFAULT 0,
  is_public     BOOLEAN DEFAULT TRUE,
  trading_style TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS pod_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id    UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(pod_id, user_id)
);

CREATE INDEX idx_pod_members_user ON pod_members(user_id);


-- ================================================================
-- 21. FRIENDSHIPS
-- ================================================================
CREATE TABLE IF NOT EXISTS friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        friendship_status DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);

CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 22. NOTIFICATION PREFERENCES
-- ================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  pre_market_reminder     BOOLEAN DEFAULT TRUE,
  post_market_reflection  BOOLEAN DEFAULT TRUE,
  daily_checkin           BOOLEAN DEFAULT TRUE,
  urge_cooldown_alert     BOOLEAN DEFAULT TRUE,
  streak_milestones       BOOLEAN DEFAULT TRUE,
  weekly_report           BOOLEAN DEFAULT TRUE,
  community_posts         BOOLEAN DEFAULT FALSE,
  direct_messages         BOOLEAN DEFAULT TRUE,
  quiet_hours_start       TIME,
  quiet_hours_end         TIME,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 23. PRIVACY SETTINGS
-- ================================================================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  profile_visible   BOOLEAN DEFAULT TRUE,
  show_streak       BOOLEAN DEFAULT TRUE,
  show_leaderboard  BOOLEAN DEFAULT TRUE,
  show_activity     BOOLEAN DEFAULT FALSE,
  allow_dms         BOOLEAN DEFAULT TRUE,
  analytics_opt_in  BOOLEAN DEFAULT TRUE,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 24. SUBSCRIPTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  plan            subscription_plan DEFAULT 'free',
  status          subscription_status DEFAULT 'active',
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  trial_ends_at   TIMESTAMPTZ,
  revenue_cat_id  TEXT,
  product_id      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_status ON subscriptions(status, plan);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- 25. ANALYTICS EVENTS (server-side event log)
-- Supplement to PostHog for server-side events only.
-- ================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_name  TEXT NOT NULL,
  properties  JSONB DEFAULT '{}',
  source      TEXT DEFAULT 'server' CHECK (source IN ('server', 'edge_function', 'webhook')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_user_event ON analytics_events(user_id, event_name, created_at DESC);
CREATE INDEX idx_analytics_event_date ON analytics_events(event_name, created_at DESC);

-- Partition hint: for high-volume production, consider partitioning by month
-- CREATE TABLE analytics_events_2026_03 PARTITION OF analytics_events
--   FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');


-- ================================================================
-- DATABASE FUNCTIONS
-- ================================================================

-- Get the number of tilt-free days for the active streak
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(CURRENT_DATE - start_date, 0)
  FROM streaks
  WHERE user_id = p_user_id AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Get the best streak ever achieved
CREATE OR REPLACE FUNCTION get_best_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  best_ended INTEGER;
  current_active INTEGER;
BEGIN
  SELECT COALESCE(MAX(days), 0) INTO best_ended
  FROM streaks WHERE user_id = p_user_id AND is_active = FALSE;

  SELECT COALESCE(CURRENT_DATE - start_date, 0) INTO current_active
  FROM streaks WHERE user_id = p_user_id AND is_active = TRUE
  ORDER BY created_at DESC LIMIT 1;

  RETURN GREATEST(best_ended, COALESCE(current_active, 0));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- Reset streak on relapse; creates a relapse_event and starts a new streak
CREATE OR REPLACE FUNCTION reset_streak(
  p_user_id UUID,
  p_reason TEXT DEFAULT 'relapse',
  p_trigger_category TEXT DEFAULT NULL,
  p_emotional_state TEXT DEFAULT NULL,
  p_lesson TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_streak_id UUID;
  v_streak_days INTEGER;
  v_relapse_id UUID;
  v_new_streak_id UUID;
BEGIN
  -- Find and close the active streak
  SELECT id, COALESCE(CURRENT_DATE - start_date, 0)
  INTO v_streak_id, v_streak_days
  FROM streaks
  WHERE user_id = p_user_id AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_streak_id IS NOT NULL THEN
    UPDATE streaks
    SET is_active = FALSE,
        end_date = CURRENT_DATE,
        days = v_streak_days,
        ended_reason = p_reason
    WHERE id = v_streak_id;
  END IF;

  -- Create relapse event
  INSERT INTO relapse_events (
    user_id, streak_id, streak_days_lost,
    trigger_category, emotional_state, lesson_learned
  ) VALUES (
    p_user_id, v_streak_id, COALESCE(v_streak_days, 0),
    p_trigger_category, p_emotional_state, p_lesson
  ) RETURNING id INTO v_relapse_id;

  -- Start a new streak
  INSERT INTO streaks (user_id, start_date, is_active)
  VALUES (p_user_id, CURRENT_DATE, TRUE)
  RETURNING id INTO v_new_streak_id;

  RETURN json_build_object(
    'relapse_id', v_relapse_id,
    'days_lost', COALESCE(v_streak_days, 0),
    'new_streak_id', v_new_streak_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get comprehensive user stats for dashboard and sharing
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'current_streak', COALESCE(get_current_streak(p_user_id), 0),
    'best_streak', COALESCE(get_best_streak(p_user_id), 0),
    'total_relapses', (SELECT COUNT(*) FROM relapse_events WHERE user_id = p_user_id),
    'urges_resisted', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id AND resisted = TRUE),
    'total_urges', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id),
    'resist_rate', COALESCE(
      (SELECT ROUND(
        COUNT(*) FILTER (WHERE resisted = TRUE)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 1
      ) FROM urge_logs WHERE user_id = p_user_id), 0
    ),
    'journal_entries', (SELECT COUNT(*) FROM journal_entries WHERE user_id = p_user_id AND is_draft = FALSE),
    'breathing_sessions', (SELECT COUNT(*) FROM breathing_sessions WHERE user_id = p_user_id),
    'milestones_unlocked', (SELECT COUNT(*) FROM milestone_unlocks WHERE user_id = p_user_id AND is_unlocked = TRUE),
    'games_played', (SELECT COUNT(*) FROM game_sessions WHERE user_id = p_user_id),
    'days_pledged', (SELECT COUNT(*) FROM daily_pledges WHERE user_id = p_user_id),
    'coach_messages', (SELECT COUNT(*) FROM coach_messages WHERE user_id = p_user_id AND role = 'user')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Calculate milestone progress for a user
CREATE OR REPLACE FUNCTION calculate_milestone_progress(p_user_id UUID, p_milestone_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_milestone milestones%ROWTYPE;
  v_current_value INTEGER;
BEGIN
  SELECT * INTO v_milestone FROM milestones WHERE slug = p_milestone_slug;
  IF NOT FOUND THEN RETURN '{"error": "milestone not found"}'::JSON; END IF;

  CASE v_milestone.requirement_type
    WHEN 'streak_days' THEN
      SELECT COALESCE(get_current_streak(p_user_id), 0) INTO v_current_value;
    WHEN 'urges_resisted' THEN
      SELECT COUNT(*) INTO v_current_value FROM urge_logs WHERE user_id = p_user_id AND resisted = TRUE;
    WHEN 'journal_entries' THEN
      SELECT COUNT(*) INTO v_current_value FROM journal_entries WHERE user_id = p_user_id AND is_draft = FALSE;
    WHEN 'breathing_sessions' THEN
      SELECT COUNT(*) INTO v_current_value FROM breathing_sessions WHERE user_id = p_user_id AND completed = TRUE;
    WHEN 'games_played' THEN
      SELECT COUNT(*) INTO v_current_value FROM game_sessions WHERE user_id = p_user_id;
    WHEN 'game_high_score' THEN
      SELECT COALESCE(MAX(score), 0) INTO v_current_value FROM game_sessions WHERE user_id = p_user_id;
    WHEN 'checklists_completed' THEN
      SELECT COUNT(DISTINCT completed_date) INTO v_current_value FROM checklist_completions WHERE user_id = p_user_id;
    WHEN 'goals_completed_weekly' THEN
      SELECT COUNT(*) INTO v_current_value FROM goal_checkins
      WHERE user_id = p_user_id AND checked_date >= CURRENT_DATE - INTERVAL '7 days';
    WHEN 'community_posts' THEN
      SELECT COUNT(*) INTO v_current_value FROM posts WHERE user_id = p_user_id;
    ELSE
      v_current_value := 0;
  END CASE;

  -- Upsert progress
  INSERT INTO milestone_unlocks (user_id, milestone_id, progress, is_unlocked, unlocked_at)
  VALUES (
    p_user_id, v_milestone.id, v_current_value,
    v_current_value >= v_milestone.requirement_value,
    CASE WHEN v_current_value >= v_milestone.requirement_value THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    is_unlocked = EXCLUDED.is_unlocked,
    unlocked_at = CASE
      WHEN milestone_unlocks.is_unlocked = FALSE AND EXCLUDED.is_unlocked = TRUE THEN NOW()
      ELSE milestone_unlocks.unlocked_at
    END;

  RETURN json_build_object(
    'milestone', v_milestone.name,
    'current', v_current_value,
    'required', v_milestone.requirement_value,
    'unlocked', v_current_value >= v_milestone.requirement_value,
    'progress_pct', LEAST(ROUND(v_current_value::NUMERIC / v_milestone.requirement_value * 100, 1), 100)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get weekly goal completion rate
CREATE OR REPLACE FUNCTION get_weekly_goal_progress(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_goals', (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id AND is_active = TRUE),
    'days_this_week', EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1,
    'checkins_this_week', (
      SELECT COUNT(*) FROM goal_checkins
      WHERE user_id = p_user_id
        AND checked_date >= date_trunc('week', CURRENT_DATE)
        AND completed = TRUE
    ),
    'possible_checkins', (
      SELECT COUNT(*) * (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1)
      FROM goals WHERE user_id = p_user_id AND is_active = TRUE
    ),
    'completion_pct', COALESCE(
      (SELECT ROUND(
        COUNT(*) FILTER (WHERE completed = TRUE)::NUMERIC /
        NULLIF(
          (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id AND is_active = TRUE)
          * (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1),
          0
        ) * 100, 1
      )
      FROM goal_checkins
      WHERE user_id = p_user_id
        AND checked_date >= date_trunc('week', CURRENT_DATE)
      ), 0
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Log an app session end
CREATE OR REPLACE FUNCTION end_app_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE app_sessions
  SET ended_at = NOW(),
      duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
      is_active = FALSE
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ================================================================
-- TRIGGERS — Auto-increment counters
-- ================================================================

-- Update post likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update post comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_post_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update pod member_count
CREATE OR REPLACE FUNCTION update_pod_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pods SET member_count = member_count + 1 WHERE id = NEW.pod_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pods SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.pod_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_pod_member_count
  AFTER INSERT OR DELETE ON pod_members
  FOR EACH ROW EXECUTE FUNCTION update_pod_member_count();

-- Update coach conversation message_count
CREATE OR REPLACE FUNCTION update_coach_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coach_conversations
  SET message_count = message_count + 1, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_coach_message_count
  AFTER INSERT ON coach_messages
  FOR EACH ROW EXECUTE FUNCTION update_coach_message_count();

-- Auto-compute journal word_count
CREATE OR REPLACE FUNCTION compute_journal_word_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count := COALESCE(array_length(regexp_split_to_array(COALESCE(NEW.content, ''), '\s+'), 1), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_journal_word_count
  BEFORE INSERT OR UPDATE OF content ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION compute_journal_word_count();


-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE urge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ---- PRIVATE DATA: users can only access their own ----

-- Profiles: public read (for community), own write
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Private tables: user owns their own data
CREATE POLICY "streaks_all" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "relapse_events_all" ON relapse_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_all" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goal_checkins_all" ON goal_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_pledges_all" ON daily_pledges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "urge_logs_all" ON urge_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "journal_entries_all" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_checkins_all" ON daily_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "checklist_items_all" ON checklist_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "checklist_completions_all" ON checklist_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "milestone_unlocks_all" ON milestone_unlocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "breathing_sessions_all" ON breathing_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "game_sessions_all" ON game_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "app_sessions_all" ON app_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "coach_conversations_all" ON coach_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "coach_messages_all" ON coach_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notification_prefs_all" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "privacy_settings_all" ON privacy_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Milestones: everyone can read the reference table
CREATE POLICY "milestones_select" ON milestones FOR SELECT USING (true);

-- Analytics: insert only (no reads from client)
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- COMMUNITY DATA: public read, own write ----
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "post_likes_select" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "pods_select" ON pods FOR SELECT USING (true);
CREATE POLICY "pods_insert" ON pods FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "pods_update" ON pods FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "pod_members_select" ON pod_members FOR SELECT USING (true);
CREATE POLICY "pod_members_insert" ON pod_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pod_members_delete" ON pod_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "friendships_all" ON friendships FOR ALL
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
