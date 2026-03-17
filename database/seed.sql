-- ================================================================
-- ZERO TILT — Seed Data for Development
-- Run after 001_initial_schema.sql
--
-- Creates:
--   3 test users with profiles
--   Active streaks for each user
--   Sample goals, pledges, urge logs, journal entries
--   All milestones (production-ready reference data)
--   Sample relapse events, game sessions, breathing sessions
--   Community posts and a pod
-- ================================================================

-- ============================================
-- MILESTONES (Production-ready reference data)
-- These ship with every environment.
-- ============================================
INSERT INTO milestones (slug, name, description, icon_name, category, requirement_type, requirement_value, tier, sort_order, xp_reward) VALUES
  -- Streak milestones
  ('streak_1d',     'First Day',              'Complete your first tilt-free day',             'flame',       'streak',    'streak_days',          1,    'bronze',   1,   10),
  ('streak_3d',     'Three Day Start',        '3 consecutive tilt-free days',                  'flame',       'streak',    'streak_days',          3,    'bronze',   2,   25),
  ('streak_7d',     'One Week Strong',        '7 consecutive tilt-free days',                  'flame',       'streak',    'streak_days',          7,    'bronze',   3,   50),
  ('streak_14d',    'Two Week Warrior',       '14 consecutive tilt-free days',                 'shield',      'streak',    'streak_days',          14,   'silver',   4,   100),
  ('streak_30d',    'Monthly Master',         '30 consecutive tilt-free days',                 'trophy',      'streak',    'streak_days',          30,   'gold',     5,   250),
  ('streak_60d',    'Iron Will',              '60 consecutive tilt-free days',                 'diamond',     'streak',    'streak_days',          60,   'platinum', 6,   500),
  ('streak_90d',    'Legendary Discipline',   '90 consecutive tilt-free days',                 'crown',       'streak',    'streak_days',          90,   'diamond',  7,   1000),
  ('streak_180d',   'Half Year Hero',         '180 consecutive tilt-free days',                'crown',       'streak',    'streak_days',          180,  'diamond',  8,   2000),
  ('streak_365d',   'Year of Mastery',        '365 consecutive tilt-free days',                'crown',       'streak',    'streak_days',          365,  'diamond',  9,   5000),

  -- Urge milestones
  ('urge_10',       'Urge Warrior',           'Resist 10 urges',                               'shield',      'urge',      'urges_resisted',       10,   'bronze',   1,   50),
  ('urge_25',       'Urge Fighter',           'Resist 25 urges',                               'shield',      'urge',      'urges_resisted',       25,   'silver',   2,   100),
  ('urge_50',       'Urge Master',            'Resist 50 urges',                               'shield',      'urge',      'urges_resisted',       50,   'gold',     3,   250),
  ('urge_100',      'Urge Legend',            'Resist 100 urges',                              'shield',      'urge',      'urges_resisted',       100,  'diamond',  4,   500),

  -- Journal milestones
  ('journal_5',     'First Reflections',      'Write 5 journal entries',                       'book',        'journal',   'journal_entries',       5,    'bronze',   1,   25),
  ('journal_10',    'Journal Keeper',         'Write 10 journal entries',                      'book',        'journal',   'journal_entries',       10,   'bronze',   2,   50),
  ('journal_25',    'Deep Thinker',           'Write 25 journal entries',                      'book',        'journal',   'journal_entries',       25,   'silver',   3,   100),
  ('journal_50',    'Deep Reflector',         'Write 50 journal entries',                      'book',        'journal',   'journal_entries',       50,   'gold',     4,   250),

  -- Breathing milestones
  ('breath_5',      'First Breaths',          'Complete 5 breathing sessions',                 'wind',        'breathing',  'breathing_sessions',    5,    'bronze',   1,   25),
  ('breath_20',     'Breath Master',          'Complete 20 breathing sessions',                'wind',        'breathing',  'breathing_sessions',    20,   'silver',   2,   100),
  ('breath_50',     'Zen Master',             'Complete 50 breathing sessions',                'wind',        'breathing',  'breathing_sessions',    50,   'gold',     3,   250),

  -- Game milestones
  ('games_10',      'Game On',                'Play 10 mini-games',                            'gamepad',     'game',       'games_played',          10,   'bronze',   1,   25),
  ('games_50',      'Game Champion',          'Play 50 mini-games',                            'gamepad',     'game',       'games_played',          50,   'silver',   2,   100),
  ('game_score_100','High Scorer',            'Score 100+ in any game',                        'gamepad',     'game',       'game_high_score',       100,  'silver',   3,   150),

  -- Checklist milestones
  ('checklist_7',   'Prepared Trader',        'Complete pre-trade checklist 7 days',            'clipboard',   'checklist',  'checklists_completed',  7,    'bronze',   1,   50),
  ('checklist_30',  'Checklist Pro',          'Complete pre-trade checklist 30 days',           'clipboard',   'checklist',  'checklists_completed',  30,   'gold',     2,   250),

  -- Goal milestones
  ('goals_week',    'Goal Getter',            'Complete all goals for a full week',             'target',      'goal',       'goals_completed_weekly', 7,   'silver',   1,   150),

  -- Community milestones
  ('posts_5',       'Community Voice',        'Create 5 community posts',                      'megaphone',   'community',  'community_posts',       5,    'bronze',   1,   50),
  ('posts_20',      'Community Leader',       'Create 20 community posts',                     'megaphone',   'community',  'community_posts',       20,   'gold',     2,   200)
ON CONFLICT (slug) DO NOTHING;


-- ============================================
-- TEST USERS (development only)
-- NOTE: In real Supabase, users are created via auth.users.
-- For local dev with supabase CLI, use:
--   supabase auth admin create-user --email user@test.com --password test123
-- Then the trigger auto-creates the profile.
--
-- Below we simulate 3 users with UUIDs that you can
-- reference from auth.users in a local dev setup.
-- ============================================

-- User 1: Experienced trader, 23 day streak
INSERT INTO profiles (id, email, full_name, trader_name, avatar_url, bio, age, trading_style, markets, trading_experience, onboarding_completed, tilt_risk_level, why_i_trade, selected_symptoms, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'alex@zerotilt.dev',
  'Alex Martinez',
  'TiltSlayer',
  NULL,
  'Futures day trader working on discipline',
  32,
  ARRAY['Day Trader', 'Scalper'],
  ARRAY['Futures', 'Options'],
  'advanced',
  TRUE,
  'high',
  'I want to provide for my family through consistent trading',
  ARRAY['Revenge trading', 'Overtrading', 'FOMO entries'],
  NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- User 2: Newer trader, 7 day streak
INSERT INTO profiles (id, email, full_name, trader_name, avatar_url, bio, age, trading_style, markets, trading_experience, onboarding_completed, tilt_risk_level, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'sarah@zerotilt.dev',
  'Sarah Chen',
  'ZenTrader',
  NULL,
  'Learning to control my emotions in the market',
  27,
  ARRAY['Swing Trader'],
  ARRAY['Stocks', 'Crypto'],
  'intermediate',
  TRUE,
  'moderate',
  NOW() - INTERVAL '20 days'
) ON CONFLICT (id) DO NOTHING;

-- User 3: Just started onboarding
INSERT INTO profiles (id, email, full_name, trader_name, trading_experience, onboarding_completed, onboarding_step, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'mike@zerotilt.dev',
  'Mike Johnson',
  'NewTrader',
  'beginner',
  FALSE,
  'quiz',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;


-- ============================================
-- STREAKS
-- ============================================

-- Alex: 23-day active streak + 1 historical ended streak
INSERT INTO streaks (user_id, start_date, end_date, days, is_active, ended_reason, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE - 38, CURRENT_DATE - 24, 14, FALSE, 'relapse', NOW() - INTERVAL '38 days'),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE - 23, NULL, 0, TRUE, NULL, NOW() - INTERVAL '23 days');

-- Sarah: 7-day active streak
INSERT INTO streaks (user_id, start_date, is_active, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 7, TRUE, NOW() - INTERVAL '7 days');

-- Mike: just started
INSERT INTO streaks (user_id, start_date, is_active, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, TRUE, NOW());


-- ============================================
-- RELAPSE EVENTS
-- ============================================
INSERT INTO relapse_events (user_id, streak_days_lost, trigger_category, emotional_state, lesson_learned, severity, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 14, 'revenge_trade', 'angry', 'Never trade after a loss. Walk away for at least 30 minutes.', 4, NOW() - INTERVAL '24 days');


-- ============================================
-- GOALS
-- ============================================
INSERT INTO goals (user_id, title, is_custom, is_active, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Follow my trading plan', FALSE, TRUE, 1),
  ('11111111-1111-1111-1111-111111111111', 'Proper risk management', FALSE, TRUE, 2),
  ('11111111-1111-1111-1111-111111111111', 'No revenge trades', FALSE, TRUE, 3),
  ('11111111-1111-1111-1111-111111111111', 'Journal every trade', TRUE, TRUE, 4),

  ('22222222-2222-2222-2222-222222222222', 'Stick to stop losses', FALSE, TRUE, 1),
  ('22222222-2222-2222-2222-222222222222', 'Max 3 trades per day', TRUE, TRUE, 2),
  ('22222222-2222-2222-2222-222222222222', 'Review chart before entry', FALSE, TRUE, 3);


-- ============================================
-- GOAL CHECK-INS (last 7 days for Alex)
-- ============================================
INSERT INTO goal_checkins (goal_id, user_id, checked_date, completed)
SELECT g.id, g.user_id, d.checked_date, TRUE
FROM goals g
CROSS JOIN (
  SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::INTERVAL)::DATE AS checked_date
) d
WHERE g.user_id = '11111111-1111-1111-1111-111111111111'
  AND g.title = 'Follow my trading plan'
ON CONFLICT (goal_id, checked_date) DO NOTHING;


-- ============================================
-- DAILY PLEDGES
-- ============================================
INSERT INTO daily_pledges (user_id, pledge_text, signed_name, pledge_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'I commit to following my trading plan and managing risk today.', 'Alex Martinez', CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'I will not revenge trade. I will walk away if I feel tilted.', 'Sarah Chen', CURRENT_DATE);


-- ============================================
-- URGE LOGS
-- ============================================
INSERT INTO urge_logs (user_id, intensity, intensity_label, trigger_type, trigger_description, resisted, breathing_completed, response, notes, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 4, 'Strong', 'fomo', 'Saw NQ spike 50 points without me', TRUE, TRUE, ARRAY['Breathing exercise', 'Walked away', 'Called accountability partner'], 'FOMO was intense but I resisted. Proud of myself.', NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', 2, 'Mild', 'boredom', 'Slow market day, wanted to force a trade', TRUE, FALSE, ARRAY['Reviewed trading plan', 'Played memory game'], NULL, NOW() - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111111', 5, 'Overwhelming', 'revenge_trade', 'Took a 3R loss and wanted to make it back immediately', TRUE, TRUE, ARRAY['Breathing exercise', 'Journaled', 'Closed trading platform'], 'Hardest urge yet. The breathing exercise saved me.', NOW() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-222222222222', 3, 'Moderate', 'overconfidence', 'Had 3 green days in a row, wanted to size up', TRUE, FALSE, ARRAY['Reviewed risk rules'], 'Reminded myself that overconfidence is a tilt trigger.', NOW() - INTERVAL '1 day');


-- ============================================
-- JOURNAL ENTRIES
-- ============================================
INSERT INTO journal_entries (user_id, title, content, mood, mood_score, mood_emoji, tags, is_pre_trade, is_post_trade, is_draft, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Morning prep - feeling focused',
   'Reviewed my trading plan for today. Key levels marked on NQ. Max loss is 2R. I will not trade after 11am if I hit my target. Feeling calm and ready.',
   'good', 4, NULL,
   ARRAY['Pre-Trade'], TRUE, FALSE, FALSE,
   NOW() - INTERVAL '1 day'),

  ('11111111-1111-1111-1111-111111111111',
   'Post session review',
   'Took 2 trades today. First was a clean winner following my plan. Second I hesitated on entry and got a smaller fill. Overall green day. Key lesson: trust the setup.',
   'great', 5, NULL,
   ARRAY['Post-Trade'], FALSE, TRUE, FALSE,
   NOW() - INTERVAL '1 day' + INTERVAL '6 hours'),

  ('11111111-1111-1111-1111-111111111111',
   'Tilt reflection from last week',
   'Looking back at the FOMO urge from Monday. The breathing exercise really helped. I noticed that FOMO hits hardest when I see a move in the first 15 minutes. New rule: no entries in the first 5 minutes.',
   'neutral', 3, NULL,
   ARRAY['Tilt Reflection'], FALSE, FALSE, FALSE,
   NOW() - INTERVAL '3 days'),

  ('22222222-2222-2222-2222-222222222222',
   'Day 7 milestone!',
   'One full week tilt-free! This is the longest I have gone without revenge trading. The daily pledge really helps set my mindset.',
   'great', 5, NULL,
   ARRAY['Milestone'], FALSE, FALSE, FALSE,
   NOW()),

  ('11111111-1111-1111-1111-111111111111',
   'Draft: weekly review',
   'Starting my weekly review. Need to compile stats...',
   NULL, NULL, NULL,
   ARRAY[], FALSE, FALSE, TRUE,
   NOW());


-- ============================================
-- BREATHING SESSIONS
-- ============================================
INSERT INTO breathing_sessions (user_id, session_type, duration_seconds, cycles_completed, completed, context, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '4-7-8', 120, 5, TRUE, 'panic', NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', '4-7-8', 90, 4, TRUE, 'urge_tracker', NOW() - INTERVAL '10 days'),
  ('11111111-1111-1111-1111-111111111111', 'box', 180, 8, TRUE, 'voluntary', NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', '4-7-8', 60, 3, FALSE, 'panic', NOW() - INTERVAL '3 days');


-- ============================================
-- GAME SESSIONS
-- ============================================
INSERT INTO game_sessions (user_id, game_type, score, duration_seconds, level_reached, context, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'memory', 850, 45, 3, 'voluntary', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'stroop', 1200, 60, 5, 'voluntary', NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'math_blitz', 920, 30, 4, 'urge_cooldown', NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'memory', 600, 38, 2, 'voluntary', NOW() - INTERVAL '2 days');


-- ============================================
-- DAILY CHECK-INS
-- ============================================
INSERT INTO daily_checkins (user_id, mood, mood_score, energy_level, notes, checkin_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'good', 4, 4, 'Ready for the market', CURRENT_DATE),
  ('11111111-1111-1111-1111-111111111111', 'great', 5, 5, 'Best trading day this week', CURRENT_DATE - 1),
  ('11111111-1111-1111-1111-111111111111', 'neutral', 3, 3, NULL, CURRENT_DATE - 2),
  ('22222222-2222-2222-2222-222222222222', 'good', 4, 3, 'Feeling focused', CURRENT_DATE)
ON CONFLICT (user_id, checkin_date) DO NOTHING;


-- ============================================
-- COMMUNITY POSTS
-- ============================================
INSERT INTO posts (user_id, title, content, category, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111',
   '23 days tilt-free!',
   'Just hit 23 days without revenge trading. The hardest moment was a FOMO urge on NQ last Monday, but the breathing exercise pulled me through. Keep going everyone!',
   'wins',
   NOW() - INTERVAL '2 hours'),

  ('22222222-2222-2222-2222-222222222222',
   'First week done!',
   'Day 7 and I have not revenge traded once. The daily pledge is my secret weapon. Writing it down every morning changes my mindset completely.',
   'wins',
   NOW() - INTERVAL '1 hour'),

  ('11111111-1111-1111-1111-111111111111',
   'How do you handle slow market days?',
   'Slow days are my biggest tilt trigger. I get bored and force trades. Anyone have strategies for staying disciplined when nothing is happening?',
   'questions',
   NOW() - INTERVAL '3 days');


-- ============================================
-- PODS (Accountability Groups)
-- ============================================
INSERT INTO pods (name, description, creator_id, max_members, is_public, trading_style) VALUES
  ('NQ Scalpers Anonymous', 'Accountability group for NQ futures scalpers working on discipline', '11111111-1111-1111-1111-111111111111', 8, TRUE, 'Scalper');

INSERT INTO pod_members (pod_id, user_id, role)
SELECT p.id, '11111111-1111-1111-1111-111111111111', 'admin'
FROM pods p WHERE p.name = 'NQ Scalpers Anonymous'
ON CONFLICT (pod_id, user_id) DO NOTHING;

INSERT INTO pod_members (pod_id, user_id, role)
SELECT p.id, '22222222-2222-2222-2222-222222222222', 'member'
FROM pods p WHERE p.name = 'NQ Scalpers Anonymous'
ON CONFLICT (pod_id, user_id) DO NOTHING;


-- ============================================
-- MILESTONE UNLOCKS (pre-populate for Alex)
-- ============================================
INSERT INTO milestone_unlocks (user_id, milestone_id, progress, is_unlocked, unlocked_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  m.id,
  23,
  23 >= m.requirement_value,
  CASE WHEN 23 >= m.requirement_value THEN NOW() - INTERVAL '1 day' ELSE NULL END
FROM milestones m
WHERE m.category = 'streak'
ON CONFLICT (user_id, milestone_id) DO NOTHING;


-- ============================================
-- SETTINGS (defaults for test users)
-- ============================================
INSERT INTO notification_preferences (user_id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO privacy_settings (user_id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subscriptions (user_id, plan, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'yearly', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'free', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'free', 'active')
ON CONFLICT (user_id) DO NOTHING;


-- ============================================
-- CHECKLIST ITEMS (defaults for Alex)
-- ============================================
INSERT INTO checklist_items (user_id, title, is_custom, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Review trading plan', FALSE, 1),
  ('11111111-1111-1111-1111-111111111111', 'Check economic calendar', FALSE, 2),
  ('11111111-1111-1111-1111-111111111111', 'Set max loss for the day', FALSE, 3),
  ('11111111-1111-1111-1111-111111111111', 'Mark key support/resistance levels', FALSE, 4),
  ('11111111-1111-1111-1111-111111111111', 'Rate my emotional state 1-5', TRUE, 5);
