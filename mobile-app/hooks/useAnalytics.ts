import { useCallback } from 'react';
import { track, identifyUser, resetUser, trackScreenView } from '../services/analytics';

export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    track(eventName, properties);
  }, []);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    identifyUser(userId, properties);
  }, []);

  const reset = useCallback(() => {
    resetUser();
  }, []);

  const trackScreen = useCallback((screenName: string) => {
    trackScreenView(screenName);
  }, []);

  return {
    track: trackEvent,
    identify,
    reset,
    trackScreen,
  };
}
