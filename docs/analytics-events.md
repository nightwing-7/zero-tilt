# ZERO TILT — Analytics Events Specification

> PostHog | Version 1.0 | March 2026

## 1. Overview

ZERO TILT uses PostHog for product analytics. Events are tracked client-side via the PostHog React Native SDK. No PII (name, email) is sent to PostHog — users are identified by their Supabase anonymous UUID.

### Setup

```typescript
// lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog('<PROJECT_API_KEY>', {
  host: 'https://us.i.posthog.com',
  enableSessionReplay: true,
});

// Identify user after login (no PII)
posthog.identify(user.id, {
  subscription_tier: 'free',
  tilt_risk_level: 'high',
  trading_experience: 'intermediate',
  onboarding_completed: true,
});
```

### Naming Convention

All events use `snake_case` with the pattern: `<noun>_<verb>`.

Properties use `snake_case`. Boolean properties are prefixed with `is_` or `has_`.

## 2. Event Catalog

### 2.1 Authentication Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `auth_signup_started` | User taps "Sign Up" button | `method: 'email' \| 'google' \| 'apple'` |
| `auth_signup_completed` | Account successfully created | `method, duration_seconds` |
| `auth_signup_failed` | Signup error | `method, error_code, error_message` |
| `auth_login_started` | User taps "Sign In" button | `method` |
| `auth_login_completed` | Successful login | `method, duration_seconds` |
| `auth_login_failed` | Login error | `method, error_code` |
| `auth_logout` | User logs out | — |
| `auth_password_reset_requested` | User requests password reset | — |

### 2.2 Onboarding Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `onboarding_started` | User enters the first onboarding screen | — |
| `onboarding_step_completed` | User completes a step | `step: 'about_you' \| 'quiz' \| 'symptoms' \| 'goals' \| 'commitment' \| 'carousel'` |
| `onboarding_step_skipped` | User skips a step (if allowed) | `step` |
| `onboarding_quiz_answered` | User answers a quiz question | `question_number, answer_value` |
| `onboarding_symptoms_selected` | User submits symptom selection | `symptom_count, symptoms: string[]` |
| `onboarding_goals_selected` | User submits goal selection | `goal_count, has_custom_goal: boolean` |
| `onboarding_commitment_signed` | User signs the pledge | — |
| `onboarding_completed` | User finishes entire onboarding | `duration_seconds, tilt_risk_level` |
| `onboarding_abandoned` | User exits onboarding before completion | `last_step, total_steps_completed` |

### 2.3 Streak Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `streak_viewed` | User sees their streak on dashboard | `current_streak_days, rank` |
| `streak_milestone_reached` | User hits a milestone (7, 14, 30, 60, 90, 180, 365) | `milestone_days, rank, is_personal_best: boolean` |
| `streak_relapse` | User reports a relapse | `streak_days_before_relapse, total_relapses` |
| `streak_reset_manual` | User manually resets streak | `streak_days_before_reset` |

### 2.4 Urge Tracking Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `urge_tracker_opened` | User opens the urge tracker | `source: 'dashboard' \| 'notification' \| 'panic'` |
| `urge_logged` | User submits an urge log | `intensity (1-5), trigger, resisted: boolean, breathing_completed: boolean, response_count` |
| `urge_resisted` | Urge was successfully resisted | `intensity, trigger, coping_strategies: string[]` |
| `urge_not_resisted` | User did not resist the urge | `intensity, trigger` |

### 2.5 Panic Button Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `panic_button_pressed` | User taps the panic button | `source: 'dashboard' \| 'urge_tracker'` |
| `panic_breathing_started` | Breathing exercise begins | — |
| `panic_breathing_completed` | Breathing exercise completed | `duration_seconds, cycles_completed` |
| `panic_breathing_abandoned` | User exits breathing early | `duration_seconds, cycles_completed` |
| `panic_flow_completed` | User exits the full panic flow | `total_duration_seconds, breathing_completed: boolean` |

### 2.6 Journal Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `journal_opened` | User opens journal screen | `entry_count` |
| `journal_entry_started` | User taps "New Entry" | — |
| `journal_entry_saved` | Entry saved successfully | `mood, tag_count, tags: string[], word_count, has_title: boolean` |
| `journal_entry_edited` | Existing entry updated | `entry_age_hours` |
| `journal_entry_deleted` | Entry deleted | — |

### 2.7 Goals Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `goal_checkin_toggled` | User checks/unchecks a goal for the day | `goal_title, is_checked: boolean, is_custom: boolean` |
| `goal_created` | User adds a custom goal | `title` |
| `goal_deleted` | User removes a goal | `is_custom: boolean` |
| `goals_daily_complete` | User completes all goals for the day | `goal_count` |
| `goals_weekly_complete` | User completes all goals for the full week | `goal_count` |

### 2.8 Daily Pledge Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `pledge_signed` | User signs the daily pledge | `is_first_pledge: boolean` |
| `pledge_viewed` | User views the pledge screen | `has_pledged_today: boolean` |

### 2.9 Pre-Trade Checklist Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `checklist_opened` | User opens the pre-trade checklist | `item_count` |
| `checklist_item_toggled` | User checks/unchecks an item | `is_checked: boolean, is_custom: boolean` |
| `checklist_completed` | All items checked for the day | `item_count, duration_seconds` |
| `checklist_item_added` | Custom checklist item created | — |

### 2.10 AI Coach Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `coach_opened` | User opens the coach screen | `is_first_visit: boolean` |
| `coach_message_sent` | User sends a message to coach | `message_length, conversation_message_count` |
| `coach_response_received` | Coach response displayed | `response_time_ms, response_length` |
| `coach_error` | Coach response failed | `error_type` |
| `coach_conversation_started` | New conversation begins | — |
| `coach_rated` | User rates a coach response | `rating: 'helpful' \| 'not_helpful'` |

### 2.11 Game Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `game_started` | User starts a game | `game_type: 'memory' \| 'stroop' \| 'math' \| 'scramble' \| 'findit' \| 'breath'` |
| `game_completed` | Game session ends | `game_type, score, duration_seconds, is_personal_best: boolean` |
| `game_abandoned` | User exits mid-game | `game_type, score_at_exit, duration_seconds` |

### 2.12 Community Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `community_opened` | User opens community tab | `active_tab: 'forum' \| 'chat' \| 'clans' \| 'friends'` |
| `community_tab_switched` | User switches community tab | `from_tab, to_tab` |
| `post_created` | User publishes a post | `category, has_title: boolean, content_length` |
| `post_liked` | User likes a post | `post_category` |
| `post_unliked` | User removes a like | `post_category` |
| `post_viewed` | User opens a post detail | `post_category, comment_count` |
| `comment_created` | User adds a comment | `post_category, comment_length` |
| `pod_joined` | User joins a pod/clan | `pod_id, member_count` |
| `pod_left` | User leaves a pod/clan | `pod_id, days_as_member` |
| `pod_created` | User creates a new pod/clan | `is_public: boolean, max_members` |
| `friend_request_sent` | User sends a friend request | — |
| `friend_request_accepted` | User accepts a friend request | — |

### 2.13 Analytics Screen Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `analytics_viewed` | User opens analytics tab | `active_sub_tab: 'overview' \| 'trends' \| 'goals'` |
| `analytics_tab_switched` | User switches analytics sub-tab | `from_tab, to_tab` |
| `analytics_share_tapped` | User taps "Share Progress" | — |
| `analytics_share_completed` | User shares to a platform | `platform: 'x' \| 'instagram' \| 'tiktok' \| 'copy'` |

### 2.14 Profile & Settings Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `profile_viewed` | User views their profile | — |
| `profile_edited` | User saves profile changes | `fields_changed: string[]` |
| `settings_notification_changed` | User toggles a notification pref | `setting_name, is_enabled: boolean` |
| `settings_privacy_changed` | User toggles a privacy setting | `setting_name, is_enabled: boolean` |
| `data_export_requested` | User requests data export | — |
| `account_delete_requested` | User requests account deletion | — |

### 2.15 Subscription Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `paywall_viewed` | User sees the paywall | `source: 'onboarding' \| 'feature_gate' \| 'settings'` |
| `paywall_plan_selected` | User taps a plan option | `plan: 'monthly' \| 'yearly' \| 'lifetime'` |
| `subscription_started` | Purchase confirmed | `plan, price, has_trial: boolean` |
| `subscription_trial_started` | Free trial begins | `plan, trial_days` |
| `subscription_cancelled` | User cancels subscription | `plan, days_subscribed` |
| `subscription_restored` | User restores purchases | `plan` |
| `feature_gate_hit` | Free user tries to access pro feature | `feature_name` |

### 2.16 Navigation Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `screen_viewed` | Every screen navigation | `screen_name, previous_screen` |
| `tab_switched` | Bottom tab navigation | `tab_name` |
| `deep_link_opened` | App opened via deep link | `url, source` |

### 2.17 App Lifecycle Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `app_opened` | App comes to foreground | `is_cold_start: boolean, time_since_last_open_hours` |
| `app_backgrounded` | App goes to background | `session_duration_seconds` |
| `push_notification_received` | Notification delivered | `notification_type` |
| `push_notification_tapped` | User taps notification | `notification_type, target_screen` |

## 3. User Properties

Set once on identify and updated when they change:

| Property | Type | Description |
|----------|------|-------------|
| `subscription_tier` | string | 'free', 'pro_monthly', 'pro_yearly', 'pro_lifetime' |
| `tilt_risk_level` | string | 'low', 'moderate', 'high', 'severe' |
| `trading_experience` | string | 'beginner' through 'professional' |
| `onboarding_completed` | boolean | |
| `current_rank` | string | 'Spark' through 'Legend' |
| `current_streak_days` | number | Updated daily |
| `total_badges` | number | |
| `trading_style` | string[] | |
| `markets` | string[] | |
| `account_age_days` | number | |

## 4. Key Funnels to Track

### Onboarding Funnel
```
auth_signup_completed → onboarding_started → onboarding_step_completed (about_you)
→ onboarding_step_completed (quiz) → onboarding_step_completed (symptoms)
→ onboarding_step_completed (goals) → onboarding_step_completed (commitment)
→ onboarding_completed
```

### Free-to-Paid Conversion Funnel
```
paywall_viewed → paywall_plan_selected → subscription_started
```

### Daily Engagement Funnel
```
app_opened → streak_viewed → pledge_signed → goal_checkin_toggled
→ journal_entry_saved
```

### Panic Intervention Funnel
```
panic_button_pressed → panic_breathing_started → panic_breathing_completed
→ urge_logged (resisted=true)
```

## 5. Implementation Pattern

```typescript
// hooks/useAnalytics.ts
import { posthog } from '../lib/posthog';

export function useAnalytics() {
  const track = (event: string, properties?: Record<string, any>) => {
    posthog.capture(event, properties);
  };

  const identifyUser = (userId: string, traits: Record<string, any>) => {
    posthog.identify(userId, traits);
  };

  const resetUser = () => {
    posthog.reset();
  };

  return { track, identifyUser, resetUser };
}

// Usage in a screen
function DashboardScreen() {
  const { track } = useAnalytics();

  useEffect(() => {
    track('screen_viewed', { screen_name: 'dashboard' });
    track('streak_viewed', { current_streak_days: streak, rank: currentRank });
  }, []);

  const handleRelapse = () => {
    track('streak_relapse', {
      streak_days_before_relapse: streak,
      total_relapses: relapses + 1,
    });
  };
}
```
