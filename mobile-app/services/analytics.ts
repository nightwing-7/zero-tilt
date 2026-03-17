import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export async function initializeAnalytics(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    await PostHog.initialize(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      captureApplicationLifecycleEvents: true,
      captureDeeplinks: true,
      debug: process.env.NODE_ENV === 'development',
    });

    initialized = true;
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
}

export function track(eventName: string, properties?: Record<string, any>): void {
  try {
    PostHog.capture(eventName, properties || {});
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>): void {
  try {
    PostHog.identify(userId, properties || {});
  } catch (error) {
    console.error('Error identifying user:', error);
  }
}

export function resetUser(): void {
  try {
    PostHog.reset();
  } catch (error) {
    console.error('Error resetting user:', error);
  }
}

export function trackScreenView(screenName: string): void {
  try {
    track('screen_viewed', {
      screen_name: screenName,
    });
  } catch (error) {
    console.error('Error tracking screen view:', error);
  }
}

// Update user properties (called when traits change)
export function updateUserProperties(properties: Record<string, any>): void {
  try {
    PostHog.identify(undefined as any, properties);
  } catch (error) {
    console.error('Error updating user properties:', error);
  }
}

// Complete analytics event catalog matching docs/analytics-events.md
export const analyticsEvents = {
  // Authentication
  AUTH_SIGNUP_STARTED: 'auth_signup_started',
  AUTH_SIGNUP_COMPLETED: 'auth_signup_completed',
  AUTH_SIGNUP_FAILED: 'auth_signup_failed',
  AUTH_LOGIN_STARTED: 'auth_login_started',
  AUTH_LOGIN_COMPLETED: 'auth_login_completed',
  AUTH_LOGIN_FAILED: 'auth_login_failed',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth_password_reset_requested',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_STEP_SKIPPED: 'onboarding_step_skipped',
  ONBOARDING_QUIZ_ANSWERED: 'onboarding_quiz_answered',
  ONBOARDING_SYMPTOMS_SELECTED: 'onboarding_symptoms_selected',
  ONBOARDING_GOALS_SELECTED: 'onboarding_goals_selected',
  ONBOARDING_COMMITMENT_SIGNED: 'onboarding_commitment_signed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',

  // Streaks
  STREAK_VIEWED: 'streak_viewed',
  STREAK_MILESTONE_REACHED: 'streak_milestone_reached',
  STREAK_RELAPSE: 'streak_relapse',
  STREAK_RESET_MANUAL: 'streak_reset_manual',

  // Urges
  URGE_TRACKER_OPENED: 'urge_tracker_opened',
  URGE_LOGGED: 'urge_logged',
  URGE_RESISTED: 'urge_resisted',
  URGE_NOT_RESISTED: 'urge_not_resisted',

  // Panic
  PANIC_BUTTON_PRESSED: 'panic_button_pressed',
  PANIC_BREATHING_STARTED: 'panic_breathing_started',
  PANIC_BREATHING_COMPLETED: 'panic_breathing_completed',
  PANIC_BREATHING_ABANDONED: 'panic_breathing_abandoned',
  PANIC_FLOW_COMPLETED: 'panic_flow_completed',

  // Journal
  JOURNAL_OPENED: 'journal_opened',
  JOURNAL_ENTRY_STARTED: 'journal_entry_started',
  JOURNAL_ENTRY_SAVED: 'journal_entry_saved',
  JOURNAL_ENTRY_EDITED: 'journal_entry_edited',
  JOURNAL_ENTRY_DELETED: 'journal_entry_deleted',

  // Goals
  GOAL_CHECKIN_TOGGLED: 'goal_checkin_toggled',
  GOAL_CREATED: 'goal_created',
  GOAL_DELETED: 'goal_deleted',
  GOALS_DAILY_COMPLETE: 'goals_daily_complete',
  GOALS_WEEKLY_COMPLETE: 'goals_weekly_complete',

  // Daily Pledge
  PLEDGE_SIGNED: 'pledge_signed',
  PLEDGE_VIEWED: 'pledge_viewed',

  // AI Coach
  COACH_OPENED: 'coach_opened',
  COACH_MESSAGE_SENT: 'coach_message_sent',
  COACH_RESPONSE_RECEIVED: 'coach_response_received',
  COACH_ERROR: 'coach_error',
  COACH_CONVERSATION_STARTED: 'coach_conversation_started',
  COACH_RATED: 'coach_rated',

  // Community
  COMMUNITY_OPENED: 'community_opened',
  COMMUNITY_TAB_SWITCHED: 'community_tab_switched',
  POST_CREATED: 'post_created',
  POST_LIKED: 'post_liked',
  POST_UNLIKED: 'post_unliked',
  POST_VIEWED: 'post_viewed',
  COMMENT_CREATED: 'comment_created',
  POD_JOINED: 'pod_joined',
  POD_LEFT: 'pod_left',
  POD_CREATED: 'pod_created',
  FRIEND_REQUEST_SENT: 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',

  // Analytics Screen
  ANALYTICS_VIEWED: 'analytics_viewed',
  ANALYTICS_TAB_SWITCHED: 'analytics_tab_switched',
  ANALYTICS_SHARE_TAPPED: 'analytics_share_tapped',
  ANALYTICS_SHARE_COMPLETED: 'analytics_share_completed',

  // Profile & Settings
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_EDITED: 'profile_edited',
  SETTINGS_NOTIFICATION_CHANGED: 'settings_notification_changed',
  SETTINGS_PRIVACY_CHANGED: 'settings_privacy_changed',
  DATA_EXPORT_REQUESTED: 'data_export_requested',
  ACCOUNT_DELETE_REQUESTED: 'account_delete_requested',

  // Subscription
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_PLAN_SELECTED: 'paywall_plan_selected',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_TRIAL_STARTED: 'subscription_trial_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RESTORED: 'subscription_restored',
  FEATURE_GATE_HIT: 'feature_gate_hit',

  // Navigation
  SCREEN_VIEWED: 'screen_viewed',
  TAB_SWITCHED: 'tab_switched',
  DEEP_LINK_OPENED: 'deep_link_opened',

  // App Lifecycle
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_TAPPED: 'push_notification_tapped',

  // Milestones
  MILESTONE_UNLOCKED: 'milestone_unlocked',

  // Breathing
  BREATHING_SESSION_STARTED: 'breathing_session_started',
  BREATHING_SESSION_COMPLETED: 'breathing_session_completed',
};
