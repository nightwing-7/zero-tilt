-- ZERO TILT APP - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  trader_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  trading_style TEXT[] DEFAULT '{}', -- ['Scalper', 'Day Trader', etc.]
  markets TEXT[] DEFAULT '{}', -- ['Futures', 'Stocks', etc.]
  trading_experience TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced, expert, professional
  onboarding_completed BOOLEAN DEFAULT FALSE,
  quiz_responses JSONB DEFAULT '{}',
  tilt_risk_level TEXT DEFAULT 'moderate', -- low, moderate, high, severe
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  ended_reason TEXT, -- 'relapse', 'manual_reset'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streaks_user_active ON streaks(user_id, is_active);

-- ============================================
-- 3. JOURNAL ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  mood_emoji TEXT,
  tags TEXT[] DEFAULT '{}', -- ['Pre-Trade', 'Post-Trade', 'Tilt Reflection']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, created_at DESC);

-- ============================================
-- 4. URGE LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS urge_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  trigger TEXT NOT NULL,
  location TEXT,
  is_alone BOOLEAN,
  response TEXT[] DEFAULT '{}', -- what actions they took
  resisted BOOLEAN DEFAULT TRUE,
  breathing_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_urges_user_date ON urge_logs(user_id, created_at DESC);

-- ============================================
-- 5. GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  UNIQUE(goal_id, checked_date)
);

CREATE INDEX idx_goal_checkins_date ON goal_checkins(user_id, checked_date);

-- ============================================
-- 6. DAILY PLEDGES
-- ============================================
CREATE TABLE IF NOT EXISTS daily_pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pledge_text TEXT NOT NULL,
  signed_name TEXT,
  pledge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pledge_date)
);

-- ============================================
-- 7. DAILY CHECK-INS (mood tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  notes TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- ============================================
-- 8. CHECKLIST ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(item_id, completed_date)
);

-- ============================================
-- 9. BADGES / ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  requirement_type TEXT, -- 'streak_days', 'urges_resisted', 'journal_entries', etc.
  requirement_value INTEGER,
  tier TEXT DEFAULT 'bronze' -- bronze, silver, gold, platinum, diamond
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 10. BREATHING SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  duration_seconds INTEGER,
  cycles_completed INTEGER,
  context TEXT, -- 'panic', 'urge_tracker', 'voluntary'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. COMMUNITY - POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- wins, struggles, strategies, questions, general
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_posts_category ON posts(category, created_at DESC);

-- ============================================
-- 12. COMMUNITY - PODS (accountability groups)
-- ============================================
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  max_members INTEGER DEFAULT 8,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pod_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id)
);

-- ============================================
-- 13. FRIENDSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- ============================================
-- 14. GAME SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL, -- 'memory', 'math_blitz', 'stroop'
  score INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pre_market_reminder BOOLEAN DEFAULT TRUE,
  post_market_reflection BOOLEAN DEFAULT TRUE,
  daily_checkin BOOLEAN DEFAULT TRUE,
  urge_cooldown_alert BOOLEAN DEFAULT TRUE,
  streak_milestones BOOLEAN DEFAULT TRUE,
  weekly_report BOOLEAN DEFAULT TRUE,
  community_posts BOOLEAN DEFAULT FALSE,
  direct_messages BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. PRIVACY SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_visible BOOLEAN DEFAULT TRUE,
  show_streak BOOLEAN DEFAULT TRUE,
  show_leaderboard BOOLEAN DEFAULT TRUE,
  show_activity BOOLEAN DEFAULT FALSE,
  analytics_opt_in BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free', -- free, monthly, yearly, lifetime
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revenue_cat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE urge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own urges" ON urge_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own checkins" ON goal_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pledges" ON daily_pledges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily checkins" ON daily_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own checklist" ON checklist_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own completions" ON checklist_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own breathing" ON breathing_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own games" ON game_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own privacy" ON privacy_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Community: public read, own write
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view pods" ON pods FOR SELECT USING (true);
CREATE POLICY "Users can create pods" ON pods FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view pod members" ON pod_members FOR SELECT USING (true);
CREATE POLICY "Users can manage own membership" ON pod_members FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Public profiles for leaderboard/community (limited fields)
CREATE POLICY "Public profiles visible" ON profiles FOR SELECT USING (true);

-- ============================================
-- SEED DATA: Default badges
-- ============================================
INSERT INTO badges (name, description, requirement_type, requirement_value, tier) VALUES
  ('First Day', 'Complete your first tilt-free day', 'streak_days', 1, 'bronze'),
  ('One Week Strong', '7 consecutive tilt-free days', 'streak_days', 7, 'bronze'),
  ('Two Week Warrior', '14 consecutive tilt-free days', 'streak_days', 14, 'silver'),
  ('Monthly Master', '30 consecutive tilt-free days', 'streak_days', 30, 'gold'),
  ('Iron Will', '60 consecutive tilt-free days', 'streak_days', 60, 'platinum'),
  ('Legendary Discipline', '90 consecutive tilt-free days', 'streak_days', 90, 'diamond'),
  ('Urge Warrior', 'Resist 10 urges', 'urges_resisted', 10, 'bronze'),
  ('Urge Master', 'Resist 50 urges', 'urges_resisted', 50, 'gold'),
  ('Journal Keeper', 'Write 10 journal entries', 'journal_entries', 10, 'bronze'),
  ('Deep Reflector', 'Write 50 journal entries', 'journal_entries', 50, 'gold'),
  ('Breath Master', 'Complete 20 breathing sessions', 'breathing_sessions', 20, 'silver'),
  ('Community Helper', 'Get 50 helpful votes', 'helpful_votes', 50, 'gold'),
  ('Game Champion', 'Score 100+ in any game', 'game_high_score', 100, 'silver'),
  ('Checklist Pro', 'Complete 30 pre-trade checklists', 'checklists_completed', 30, 'gold'),
  ('Goal Getter', 'Complete all goals for a week', 'weekly_goals_complete', 1, 'silver')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate current streak days
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_days INTEGER;
BEGIN
  SELECT COALESCE(CURRENT_DATE - start_date, 0) INTO streak_days
  FROM streaks
  WHERE user_id = p_user_id AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(streak_days, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset streak (relapse)
CREATE OR REPLACE FUNCTION reset_streak(p_user_id UUID, p_reason TEXT DEFAULT 'relapse')
RETURNS VOID AS $$
BEGIN
  -- End current active streak
  UPDATE streaks
  SET is_active = FALSE,
      end_date = CURRENT_DATE,
      days = CURRENT_DATE - start_date,
      ended_reason = p_reason
  WHERE user_id = p_user_id AND is_active = TRUE;

  -- Start new streak
  INSERT INTO streaks (user_id, start_date, is_active)
  VALUES (p_user_id, CURRENT_DATE, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user stats for sharing
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'current_streak', COALESCE(get_current_streak(p_user_id), 0),
    'best_streak', COALESCE((SELECT MAX(days) FROM streaks WHERE user_id = p_user_id), 0),
    'total_relapses', (SELECT COUNT(*) FROM streaks WHERE user_id = p_user_id AND is_active = FALSE),
    'urges_resisted', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id AND resisted = TRUE),
    'total_urges', (SELECT COUNT(*) FROM urge_logs WHERE user_id = p_user_id),
    'journal_entries', (SELECT COUNT(*) FROM journal_entries WHERE user_id = p_user_id),
    'breathing_sessions', (SELECT COUNT(*) FROM breathing_sessions WHERE user_id = p_user_id),
    'badges_earned', (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
