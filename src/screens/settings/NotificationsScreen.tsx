import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';

export default function NotificationsScreen({ navigation }: any) {
  const [preMarket, setPreMarket] = useState(true);
  const [postMarket, setPostMarket] = useState(true);
  const [dailyCheckin, setDailyCheckin] = useState(true);
  const [urgeCooldown, setUrgeCooldown] = useState(true);
  const [streakMilestones, setStreakMilestones] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [communityPosts, setCommunityPosts] = useState(true);
  const [directMessages, setDirectMessages] = useState(true);

  interface NotificationItem {
    label: string;
    description: string;
    state: boolean;
    setState: (value: boolean) => void;
  }

  const notifications: NotificationItem[] = [
    {
      label: 'Pre-Market Reminder',
      description: 'Get reminded before market opens',
      state: preMarket,
      setState: setPreMarket,
    },
    {
      label: 'Post-Market Reflection',
      description: 'Daily review of your trading day',
      state: postMarket,
      setState: setPostMarket,
    },
    {
      label: 'Daily Check-in',
      description: 'One-minute mood and performance check',
      state: dailyCheckin,
      setState: setDailyCheckin,
    },
    {
      label: 'Urge Cooldown Alert',
      description: 'Reminder to take a break when needed',
      state: urgeCooldown,
      setState: setUrgeCooldown,
    },
    {
      label: 'Streak Milestones',
      description: 'Celebrate your streak achievements',
      state: streakMilestones,
      setState: setStreakMilestones,
    },
    {
      label: 'Weekly Report',
      description: 'Comprehensive weekly summary',
      state: weeklyReport,
      setState: setWeeklyReport,
    },
    {
      label: 'Community Posts',
      description: 'Updates from traders you follow',
      state: communityPosts,
      setState: setCommunityPosts,
    },
    {
      label: 'Direct Messages',
      description: 'Messages from other traders',
      state: directMessages,
      setState: setDirectMessages,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Notification Items */}
      <View style={styles.section}>
        {notifications.map((notification, index) => (
          <View
            key={notification.label}
            style={[
              styles.notificationItem,
              index === notifications.length - 1 && styles.lastItem,
            ]}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationLabel}>{notification.label}</Text>
              <Text style={styles.notificationDescription}>
                {notification.description}
              </Text>
            </View>
            <Switch
              style={styles.toggle}
              value={notification.state}
              onValueChange={notification.setState}
              trackColor={{ false: '#2a2a2d', true: '#10b981' }}
              thumbColor={notification.state ? '#ffffff' : '#6B7280'}
            />
          </View>
        ))}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  section: {
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
    backgroundColor: '#0f0f11',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  toggle: {
    marginLeft: 8,
  },
  spacer: {
    height: 20,
  },
});
