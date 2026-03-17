import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  NotificationPreferences,
  registerForPushNotifications,
  savePushToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  schedulePledgeReminder,
  scheduleStreakReminder,
  cancelAllNotifications,
} from '../services/notifications';

export function useNotifications() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!user) return;

      try {
        // Register for push notifications
        const token = await registerForPushNotifications();
        if (token) {
          setPushToken(token);
          await savePushToken(user.id, token);
        }

        // Load preferences
        const prefs = await getNotificationPreferences(user.id);
        setPreferences(prefs);

        // Schedule reminders based on preferences
        if (prefs?.pledge_reminder) {
          await schedulePledgeReminder(prefs.pledge_reminder_time || '08:00');
        }
        if (prefs?.streak_reminder) {
          await scheduleStreakReminder(prefs.streak_reminder_time || '20:00');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [user]);

  const updatePreference = useCallback(async (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => {
    if (!user) return false;

    const updates = { [key]: value };
    const success = await updateNotificationPreferences(user.id, updates);

    if (success) {
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      track('settings_notification_changed', {
        setting_name: key,
        is_enabled: typeof value === 'boolean' ? value : true,
      });

      // Reschedule notifications based on updated preferences
      if (key === 'pledge_reminder') {
        if (value) {
          await schedulePledgeReminder(preferences?.pledge_reminder_time || '08:00');
        } else {
          // Cancel pledge reminders
        }
      }

      if (key === 'streak_reminder') {
        if (value) {
          await scheduleStreakReminder(preferences?.streak_reminder_time || '20:00');
        }
      }
    }

    return success;
  }, [user, preferences, track]);

  const disableAll = useCallback(async () => {
    await cancelAllNotifications();
    if (user) {
      await updateNotificationPreferences(user.id, {
        pledge_reminder: false,
        streak_reminder: false,
        milestone_alerts: false,
        community_notifications: false,
        message_notifications: false,
        weekly_summary: false,
      });
    }
  }, [user]);

  return {
    preferences,
    pushToken,
    loading,
    updatePreference,
    disableAll,
  };
}
