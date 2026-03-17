import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { initializeSentry } from '../services/sentry';
import { initializeAnalytics, track, identifyUser } from '../services/analytics';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../services/profile';

const RootLayout = () => {
  const { user, session, profile, loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      initializeSentry();
      await initializeAnalytics();

      if (user) {
        identifyUser(user.id, { email: user.email });
        track('app_opened');
      }

      setAuthReady(true);
    };

    init();
  }, []);

  if (!authReady || loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {session && user ? (
        <>
          {!profile?.has_completed_onboarding ? (
            <Stack.Screen
              name="(onboarding)"
              options={{
                animationEnabled: false,
              }}
            />
          ) : (
            <Stack.Screen
              name="(tabs)"
              options={{
                animationEnabled: false,
              }}
            />
          )}

          <Stack.Screen
            name="daily-pledge"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="urge-log"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="journal-entry"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="milestones"
            options={{
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{
            animationEnabled: false,
          }}
        />
      )}
    </Stack>
  );
};

export default Sentry.wrap(RootLayout);
