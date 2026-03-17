-- ================================================================
-- ZERO TILT — Seed Data for Development
-- Run after schema.sql / 001_initial_schema.sql
--
-- Creates:
--   27 milestones (production-ready reference data)
--   3 test users via auth.users (triggers auto-create profiles)
--   Active streaks for each user
--   Sample goals, pledges, urge logs, journal entries
--   Sample relapse events, game sessions, breathing sessions
--   Community posts and a pod
--   Checklist items, daily check-ins, milestone unlocks
-- ================================================================

-- ============================================
-- MILESTONES (Production-ready reference data)
-- These ship with every environment.
-- ============================================
INSERT INTO milestones (name, description, icon, category, requirement, tier, sort_order, points) VALUES
  -- Streak milestones
  ('First Day',              'Complete your first tilt-free day',             'flame',       'streak',    '{"type": "streak_days", "target": 1}',    'bronze',   1,   10),
  ('Three Day Start',        '3 consecutive tilt-free days',                  'flame',       'streak',    '{"type": "streak_days", "target": 3}',    'bronze',   2,   25),
  ('One Week Strong',        '7 consecutive tilt-free days',                  'flame',       'streak',    '{"type": "streak_days", "target": 7}',    'bronze',   3,   50),
  ('Two Week Warrior',       '14 consecutive tilt-free days',                 'shield',      'streak',    '{"type": "streak_days", "target": 14}',   'silver',   4,   100),
  ('Monthly Master',         '30 consecutive tilt-free days',                 'trophy',      'streak',    '{"type": "streak_days", "target": 30}',   'gold',     5,   250),
  ('Iron Will',              '60 consecutive tilt-free days',                 'diamond',     'streak',    '{"type": "streak_days", "target": 60}',   'platinum', 6,   500),
  ('Legendary Discipline',   '90 consecutive tilt-free days',                 'crown',       'streak',    '{"type": "streak_days", "target": 90}',   'diamond',  7,   1000),
  ('Half Year Hero',         '180 consecutive tilt-free days',                'crown',       'streak',    '{"type": "streak_days", "target": 180}',  'diamond',  8,   2000),
  ('Year of Mastery',        '365 consecutive tilt-free days',                'crown',       'streak',    '{"type": "streak_days", "target": 365}',  'diamond',  9,   5000),

  -- Urge milestones
  ('Urge Warrior',           'Resist 10 urges',                               'shield',      'urge',      '{"type": "urge_resisted", "target": 10}',   'bronze',   1,   50),
  ('Urge Fighter',           'Resist 25 urges',                               'shield',      'urge',      '{"type": "urge_resisted", "target": 25}',   'silver',   2,   100),
  ('Urge Master',            'Resist 50 urges',                               'shield',      'urge',      '{"type": "urge_resisted", "target": 50}',   'gold',     3,   250),
  ('Urge Legend',            'Resist 100 urges',                              'shield',      'urge',      '{"type": "urge_resisted", "target": 100}',  'diamond',  4,   500),

  -- Journal milestones
  ('First Reflections',      'Write 5 journal entries',                       'book',        'journal',   '{"type": "journal_entries", "target": 5}',    'bronze',   1,   25),
  ('Journal Keeper',         'Write 10 journal entries',                      'book',        'journal',   '{"type": "journal_entries", "target": 10}',   'bronze',   2,   50),
  ('Deep Thinker',           'Write 25 journal entries',                      'book',        'journal',   '{"type": "journal_entries", "target": 25}',   'silver',   3,   100),
  ('Deep Reflector',         'Write 50 journal entries',                      'book',        'journal',   '{"type": "journal_entries", "target": 50}',   'gold',     4,   250),

  -- Breathing milestones
  ('First Breaths',          'Complete 5 breathing sessions',                 'wind',        'breathing',  '{"type": "breathing_sessions", "target": 5}',    'bronze',   1,   25),
  ('Breath Master',          'Complete 20 breathing sessions',                'wind',        'breathing',  '{"type": "breathing_sessions", "target": 20}',   'silver',   2,   100),
  ('Zen Master',             'Complete 50 breathing sessions',                'wind',        'breathing',  '{"type": "breathing_sessions", "target": 50}',   'gold',     3,   250),

  -- Game milestones
  ('Game On',                'Play 10 mini-games',                            'gamepad',     'game',       '{"type": "games_played", "target": 10}',   'bronze',   1,   25),
  ('Game Champion',          'Play 50 mini-games',                            'gamepad',     'game',       '{"type": "games_played", "target": 50}',   'silver',   2,   100),
  ('High Scorer',            'Score 100+ in any game',                        'gamepad',     'game',       '{"type": "game_high_score", "target": 100}',  'silver',   3,   150),

  -- Checklist milestones
  ('Prepared Trader',        'Complete pre-trade checklist 7 days',            'clipboard',   'checklist',  '{"type": "checklists_completed", "target": 7}',    'bronze',   1,   50),
  ('Checklist Pro',          'Complete pre-trade checklist 30 days',           'clipboard',   'checklist',  '{"type": "checklists_completed", "target": 30}',   'gold',     2,   250),

  -- Goal milestones
  ('Goal Getter',            'Complete all goals for a full week',             'target',      'goal',       '{"type": "goals_completed_weekly", "target": 7}',   'silver',   1,   150),

  -- Community milestones
  ('Community Voice',        'Create 5 community posts',                      'megaphone',   'community',  '{"type": "community_posts", "target": 5}',    'bronze',   1,   50),
  ('Community Leader',       'Create 20 community posts',                     'megaphone',   'community',  '{"type": "community_posts", "target": 20}',   'gold',     2,   200)
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- TEST USERS (development only)
-- Creates users in auth.users which triggers handle_new_user()
-- to auto-create profiles, settings, subscriptions, and streaks.
--
-- Test credentials:
--   alex@zerotilt.dev / TestPass123!
--   sarah@zerotilt.dev / TestPass123!
--   mike@zerotilt.dev / TestPass123!
-- ============================================

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'alex@zerotilt.dev', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '45 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Martinez"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'sarah@zerotilt.dev', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '20 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Chen"}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'mike@zerotilt.dev', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '1 day', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mike Johnson"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Wait for triggers to fire, then update profiles with full data

-- User 1: Alex — Experienced trader, 23 day streak, Pro subscriber
UPDATE profiles SET
  trader_name = 'TiltSlayer',
  bio = 'Futures day trader working on discipline',
  age = 32,
  trading_style = ARRAY['Day Trader', 'Scalper'],
  markets = ARRAY['Futures', 'Options'],
  trading_experience = 'advanced',
  onboarding_completed = TRUE,
  tilt_risk_level = 'high',
  why_i_trade = 'I want to provide for my family through consistent trading',
  selected_symptoms = ARRAY['Revenge trading', 'Overtrading', 'FOMO entries']
WHERE id = '11111111-1111-1111-1111-111111111111';

-- User 2: Sarah — Newer trader, 7 day streak, Free tier
UPDATE profiles SET
  trader_name = 'ZenTrader',
  bio = 'Learning to control my emotions in the market',
  age = 27,
  trading_style = ARRAY['Swing Trader'],
  markets = ARRAY['Stocks', 'Crypto'],
  trading_experience = 'intermediate',
  onboarding_completed = TRUE,
  tilt_risk_level = 'moderate'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- User 3: Mike — Just started onboarding
UPDATE profiles SET
  trader_name = 'NewTrader',
  trading_experience = 'beginner',
  onboarding_completed = FALSE,
  onboarding_step = 'quiz'
WHERE id = '33333333-3333-3333-3333-333333333333';


-- ============================================
-- STREAKS
-- ============================================

-- Deactivate auto-created streaks from trigger
UPDATE streaks SET is_active = FALSE WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Alex: 14-day historical streak (ended) + 23-day active streak
INSERT INTO streaks (user_id, current_days, best_streak, start_date, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 14, 14, CURRENT_DATE - 38, FALSE),
  ('11111111-1111-1111-1111-111111111111', 23, 23, CURRENT_DATE - 23, TRUE);

-- Sarah: 7-day active streak
INSERT INTO streaks (user_id, current_days, best_streak, start_date, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', 7, 7, CURRENT_DATE - 7, TRUE);

-- Mike: just started
INSERT INTO streaks (user_id, current_days, best_streak, start_date, is_active) VALUES
  ('33333333-3333-3333-3333-333333333333', 0, 0, CURRENT_DATE, TRUE);


-- ============================================
-- SUBSCRIPTIONS (update Alex to Pro)
-- ============================================
UPDATE subscriptions SET plan = 'yearly' WHERE user_id = '11111111-1111-1111-1111-111111111111';


-- ============================================
-- RELAPSE EVENTS
-- ============================================
INSERT INTO relapse_events (user_id, streak_before, trigger_category, emotional_state, notes, severity, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 14, 'revenge_trade', 'angry', 'Never trade after a loss. Walk away for at least 30 minutes.', 'severe', NOW() - INTERVAL '24 days');


-- ============================================
-- GOALS
-- ============================================
INSERT INTO goals (user_id, title, category, is_active, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Follow my trading plan', 'discipline', TRUE, 1),
  ('11111111-1111-1111-1111-111111111111', 'Proper risk management', 'risk', TRUE, 2),
  ('11111111-1111-1111-1111-111111111111', 'No revenge trades', 'discipline', TRUE, 3),
  ('11111111-1111-1111-1111-111111111111', 'Journal every trade', 'custom', TRUE, 4),

  ('22222222-2222-2222-2222-222222222222', 'Stick to stop losses', 'risk', TRUE, 1),
  ('22222222-2222-2222-2222-222222222222', 'Max 3 trades per day', 'custom', TRUE, 2),
  ('22222222-2222-2222-2222-222222222222', 'Review chart before entry', 'discipline', TRUE, 3);


-- ============================================
-- GOAL CHECK-INS (last 7 days for Alex)
-- ============================================
INSERT INTO goal_checkins (goal_id, user_id, checkin_date, completed)
SELECT g.id, g.user_id, d.checkin_date, TRUE
FROM goals g
CROSS JOIN (
  SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::INTERVAL)::DATE AS checkin_date
) d
WHERE g.user_id = '11111111-1111-1111-1111-111111111111'
  AND g.title = 'Follow my trading plan'
ON CONFLICT (goal_id, checkin_date) DO NOTHING;


-- ============================================
-- DAILY PLEDGES
-- ============================================
INSERT INTO daily_pledges (user_id, pledge_text, signature_data, pledge_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'I commit to following my trading plan and managing risk today.', 'Alex Martinez', CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'I will not revenge trade. I will walk away if I feel tilted.', 'Sarah Chen', CURRENT_DATE);


-- ============================================
-- URGE LOGS
-- ============================================
INSERT INTO urge_logs (user_id, intensity, trigger_type, trigger_details, coping_strategies, outcome, notes, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 8, 'fomo', 'Saw NQ spike 50 points without me', ARRAY['Breathing exercise', 'Walked away', 'Called accountability partner'], 'resisted', 'FOMO was intense but I resisted. Proud of myself.', NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', 4, 'boredom', 'Slow market day, wanted to force a trade', ARRAY['Reviewed trading plan', 'Played memory game'], 'resisted', NULL, NOW() - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111111', 10, 'revenge_trade', 'Took a 3R loss and wanted to make it back immediately', ARRAY['Breathing exercise', 'Journaled', 'Closed trading platform'], 'resisted', 'Hardest urge yet. The breathing exercise saved me.', NOW() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-222222222222', 6, 'overconfidence', 'Had 3 green days in a row, wanted to size up', ARRAY['Reviewed risk rules'], 'resisted', 'Reminded myself that overconfidence is a tilt trigger.', NOW() - INTERVAL '1 day');


-- ============================================
-- JOURNAL ENTRIES
-- ============================================
INSERT INTO journal_entries (user_id, title, content, mood, mood_score, tags, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Morning prep - feeling focused',
   'Reviewed my trading plan for today. Key levels marked on NQ. Max loss is 2R. I will not trade after 11am if I hit my target. Feeling calm and ready.',
   'good', 4, ARRAY['Pre-Trade'], NOW() - INTERVAL '1 day'),

  ('11111111-1111-1111-1111-111111111111',
   'Post session review',
   'Took 2 trades today. First was a clean winner following my plan. Second I hesitated on entry and got a smaller fill. Overall green day. Key lesson: trust the setup.',
   'great', 5, ARRAY['Post-Trade'], NOW() - INTERVAL '1 day' + INTERVAL '6 hours'),

  ('11111111-1111-1111-1111-111111111111',
   'Tilt reflection from last week',
   'Looking back at the FOMO urge from Monday. The breathing exercise really helped. I noticed that FOMO hits hardest when I see a move in the first 15 minutes. New rule: no entries in the first 5 minutes.',
   'neutral', 3, ARRAY['Tilt Reflection'], NOW() - INTERVAL '3 days'),

  ('22222222-2222-2222-2222-222222222222',
   'Day 7 milestone!',
   'One full week tilt-free! This is the longest I have gone without revenge trading. The daily pledge really helps set my mindset.',
   'great', 5, ARRAY['Milestone'], NOW()),

  ('11111111-1111-1111-1111-111111111111',
   'Draft: weekly review',
   'Starting my weekly review. Need to compile stats...',
   NULL, NULL, ARRAY[]::TEXT[], NOW());


-- ============================================
-- BREATHING SESSIONS
-- ============================================
INSERT INTO breathing_sessions (user_id, exercise_type, duration_seconds, completed, calm_before, calm_after, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '4-7-8', 120, TRUE, 3, 7, NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', '4-7-8', 90, TRUE, 2, 6, NOW() - INTERVAL '10 days'),
  ('11111111-1111-1111-1111-111111111111', 'box', 180, TRUE, 4, 8, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', '4-7-8', 60, FALSE, 3, NULL, NOW() - INTERVAL '3 days');


-- ============================================
-- GAME SESSIONS
-- ============================================
INSERT INTO game_sessions (user_id, game_type, score, duration_seconds, difficulty, completed, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'memory', 850, 45, 'hard', TRUE, NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'stroop', 1200, 60, 'hard', TRUE, NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'math_blitz', 920, 30, 'medium', TRUE, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'memory', 600, 38, 'medium', TRUE, NOW() - INTERVAL '2 days');


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
   'wins', NOW() - INTERVAL '2 hours'),

  ('22222222-2222-2222-2222-222222222222',
   'First week done!',
   'Day 7 and I have not revenge traded once. The daily pledge is my secret weapon. Writing it down every morning changes my mindset completely.',
   'wins', NOW() - INTERVAL '1 hour'),

  ('11111111-1111-1111-1111-111111111111',
   'How do you handle slow market days?',
   'Slow days are my biggest tilt trigger. I get bored and force trades. Anyone have strategies for staying disciplined when nothing is happening?',
   'questions', NOW() - INTERVAL '3 days');


-- ============================================
-- PODS (Accountability Groups)
-- ============================================
INSERT INTO pods (name, description, creator_id, max_members, is_public) VALUES
  ('NQ Scalpers Anonymous', 'Accountability group for NQ futures scalpers working on discipline', '11111111-1111-1111-1111-111111111111', 8, TRUE);

INSERT INTO pod_members (pod_id, user_id, role)
SELECT p.id, '11111111-1111-1111-1111-111111111111', 'admin'
FROM pods p WHERE p.name = 'NQ Scalpers Anonymous'
ON CONFLICT (pod_id, user_id) DO NOTHING;

INSERT INTO pod_members (pod_id, user_id, role)
SELECT p.id, '22222222-2222-2222-2222-222222222222', 'member'
FROM pods p WHERE p.name = 'NQ Scalpers Anonymous'
ON CONFLICT (pod_id, user_id) DO NOTHING;


-- ============================================
-- MILESTONE UNLOCKS (Alex's streak milestones up to 23 days)
-- ============================================
INSERT INTO milestone_unlocks (user_id, milestone_id, progress, unlocked_at)
SELECT '11111111-1111-1111-1111-111111111111', m.id, 100.00, NOW() - INTERVAL '1 day'
FROM milestones m
WHERE m.category = 'streak' AND (m.requirement->>'target')::INTEGER <= 23
ON CONFLICT (user_id, milestone_id) DO NOTHING;


-- ============================================
-- CHECKLIST ITEMS (Pre-trade defaults for Alex)
-- ============================================
INSERT INTO checklist_items (user_id, title, is_default, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Review trading plan', TRUE, 1),
  ('11111111-1111-1111-1111-111111111111', 'Check economic calendar', TRUE, 2),
  ('11111111-1111-1111-1111-111111111111', 'Set max loss for the day', TRUE, 3),
  ('11111111-1111-1111-1111-111111111111', 'Mark key support/resistance levels', TRUE, 4),
  ('11111111-1111-1111-1111-111111111111', 'Rate my emotional state 1-5', FALSE, 5);
