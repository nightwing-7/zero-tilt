import React from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { preferences, loading, updatePreference } = useNotifications();

  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Daily Reminders</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pledge Reminder</Text>
            <Text style={styles.settingDesc}>Remind you to sign your daily pledge</Text>
          </View>
          <Switch
            value={preferences.pledge_reminder}
            onValueChange={(v) => updatePreference('pledge_reminder', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Streak Reminder</Text>
            <Text style={styles.settingDesc}>Remind you to check in and keep your streak</Text>
          </View>
          <Switch
            value={preferences.streak_reminder}
            onValueChange={(v) => updatePreference('streak_reminder', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>

        <Text style={styles.sectionTitle}>Activity Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Milestone Alerts</Text>
            <Text style={styles.settingDesc}>Get notified when you unlock achievements</Text>
          </View>
          <Switch
            value={preferences.milestone_alerts}
            onValueChange={(v) => updatePreference('milestone_alerts', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Community Notifications</Text>
            <Text style={styles.settingDesc}>Comments and likes on your posts</Text>
          </View>
          <Switch
            value={preferences.community_notifications}
            onValueChange={(v) => updatePreference('community_notifications', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Message Notifications</Text>
            <Text style={styles.settingDesc}>Friend requests and direct messages</Text>
          </View>
          <Switch
            value={preferences.message_notifications}
            onValueChange={(v) => updatePreference('message_notifications', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>

        <Text style={styles.sectionTitle}>Reports</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Weekly Summary</Text>
            <Text style={styles.settingDesc}>Receive a weekly progress report</Text>
          </View>
          <Switch
            value={preferences.weekly_summary}
            onValueChange={(v) => updatePreference('weekly_summary', v)}
            trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  loadingText: { color: colors.dark.text.tertiary, textAlign: 'center', marginTop: spacing[10] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backButton: { color: colors.accent.teal },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  content: { padding: spacing[4] },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.dark.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing[6],
    marginBottom: spacing[3],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  settingInfo: { flex: 1, marginRight: spacing[3] },
  settingLabel: { color: colors.dark.text.primary, fontWeight: typography.weights.medium as any, marginBottom: spacing[1] },
  settingDesc: { color: colors.dark.text.muted, fontSize: typography.sizes.sm },
});
