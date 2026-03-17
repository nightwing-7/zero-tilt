import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface NotificationPreferences {
  user_id: string;
  pledge_reminder: boolean;
  pledge_reminder_time: string; // HH:mm
  streak_reminder: boolean;
  streak_reminder_time: string;
  milestone_alerts: boolean;
  community_notifications: boolean;
  message_notifications: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    const token = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14b8a6',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function savePushToken(
  userId: string,
  token: string
): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

// Local notifications for reminders
export async function schedulePledgeReminder(time: string): Promise<string | null> {
  try {
    await cancelScheduledNotification('pledge-reminder');

    const [hours, minutes] = time.split(':').map(Number);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Sign Your Pledge',
        body: 'Start your trading day with intention. Sign your daily commitment.',
        data: { screen: 'daily-pledge', type: 'pledge_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
      identifier: 'pledge-reminder',
    });

    return id;
  } catch (error) {
    console.error('Error scheduling pledge reminder:', error);
    return null;
  }
}

export async function scheduleStreakReminder(time: string): Promise<string | null> {
  try {
    await cancelScheduledNotification('streak-reminder');

    const [hours, minutes] = time.split(':').map(Number);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Check In to Keep Your Streak',
        body: "Don't lose your progress! Open ZERO TILT and check in today.",
        data: { screen: 'dashboard', type: 'streak_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
      identifier: 'streak-reminder',
    });

    return id;
  } catch (error) {
    console.error('Error scheduling streak reminder:', error);
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

export async function cancelScheduledNotification(
  identifier: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Milestone notification
export async function notifyMilestoneUnlocked(
  milestoneName: string,
  tier: string
): Promise<void> {
  await sendLocalNotification(
    'Achievement Unlocked!',
    `You earned "${milestoneName}" (${tier})! Keep building your discipline.`,
    { screen: 'milestones', type: 'milestone_unlocked' }
  );
}

// Community notification
export async function notifyNewComment(
  postTitle: string,
  commenterName: string
): Promise<void> {
  await sendLocalNotification(
    'New Comment',
    `${commenterName} commented on "${postTitle}"`,
    { screen: 'community', type: 'new_comment' }
  );
}

// Friend request notification
export async function notifyFriendRequest(
  requesterName: string
): Promise<void> {
  await sendLocalNotification(
    'Friend Request',
    `${requesterName} wants to connect with you`,
    { screen: 'friends', type: 'friend_request' }
  );
}
