import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { initializeSentry } from '../services/sentry';
import { initializeAnalytics, track, identifyUser } from '../services/analytics';
import { useAuth } from '../hooks/useAuth';
import { setupAppStateListener, startAppSession } from '../services/appSession';

const RootLayout = () => {
  const { user, session, profile, loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      initializeSentry();
      await initializeAnalytics();

      if (user) {
        identifyUser(user.id, {
          email: user.email,
          subscription_tier: 'free',
          onboarding_completed: profile?.has_completed_onboarding || false,
        });
        track('app_opened', { is_cold_start: true });
        await startAppSession(user.id, Platform.OS);
      }

      setAuthReady(true);
    };

    init();
  }, []);

  // Setup app state listener for session tracking
  useEffect(() => {
    if (user) {
      const cleanup = setupAppStateListener(user.id);
      return cleanup;
    }
  }, [user]);

  if (!authReady || loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        contentStyle: { backgroundColor: '#0f172a' },
      }}
    >
      {session && user ? (
        <>
          {!profile?.has_completed_onboarding ? (
            <Stack.Screen
              name="(onboarding)"
              options={{ animationEnabled: false }}
            />
          ) : (
            <Stack.Screen
              name="(tabs)"
              options={{ animationEnabled: false }}
            />
          )}

          {/* Modal Screens */}
          <Stack.Screen name="daily-pledge" options={{ presentation: 'modal' }} />
          <Stack.Screen name="urge-log" options={{ presentation: 'modal' }} />
          <Stack.Screen name="journal-entry" options={{ presentation: 'modal' }} />
          <Stack.Screen name="milestones" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="coaching" options={{ presentation: 'modal' }} />

          {/* Full Screens */}
          <Stack.Screen name="post-detail" />
          <Stack.Screen name="social-profile" />
          <Stack.Screen name="analytics-dashboard" />
          <Stack.Screen name="friends" />
          <Stack.Screen name="clans" />
          <Stack.Screen name="notification-settings" />
          <Stack.Screen name="privacy-settings" />
        </>
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{ animationEnabled: false }}
        />
      )}
    </Stack>
  );
};

export default Sentry.wrap(RootLayout);
