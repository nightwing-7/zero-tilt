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

export const analyticsEvents = {
  APP_OPENED: 'app_opened',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PLEDGE_SIGNED: 'pledge_signed',
  PANIC_BUTTON_PRESSED: 'panic_button_pressed',
  URGE_LOGGED: 'urge_logged',
  JOURNAL_ENTRY_SAVED: 'journal_entry_saved',
  BREATHING_SESSION_STARTED: 'breathing_session_started',
  BREATHING_SESSION_COMPLETED: 'breathing_session_completed',
  MILESTONE_UNLOCKED: 'milestone_unlocked',
  PROFILE_UPDATED: 'profile_updated',
  LOGOUT: 'logout',
};
