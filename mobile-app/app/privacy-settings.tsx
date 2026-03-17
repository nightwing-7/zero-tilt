import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { getPrivacySettings, updatePrivacySettings, PrivacySettings } from '../services/privacy';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    if (!user) return;
    const data = await getPrivacySettings(user.id);
    setSettings(data);
    setLoading(false);
  }

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    if (!user || !settings) return;
    const success = await updatePrivacySettings(user.id, { [key]: value });
    if (success) {
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      track('settings_privacy_changed', { setting_name: key, is_enabled: value });
    }
  };

  const handleExportData = () => {
    track('data_export_requested');
    Alert.alert(
      'Export Data',
      'Your data will be prepared and sent to your email address. This may take a few minutes.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    track('account_delete_requested');
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data, streaks, journal entries, and milestones will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE to confirm account deletion.',
              [{ text: 'Cancel', style: 'cancel' }]
            );
          },
        },
      ]
    );
  };

  if (loading || !settings) {
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
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>

        <SettingRow
          label="Show Profile"
          desc="Allow other users to see your profile"
          value={settings.show_profile}
          onToggle={(v) => handleToggle('show_profile', v)}
        />
        <SettingRow
          label="Show Streak"
          desc="Display your streak on your profile"
          value={settings.show_streak}
          onToggle={(v) => handleToggle('show_streak', v)}
        />
        <SettingRow
          label="Show on Leaderboard"
          desc="Appear in clan and global leaderboards"
          value={settings.show_leaderboard}
          onToggle={(v) => handleToggle('show_leaderboard', v)}
        />
        <SettingRow
          label="Show Milestones"
          desc="Display your achievements publicly"
          value={settings.show_milestones}
          onToggle={(v) => handleToggle('show_milestones', v)}
        />

        <Text style={styles.sectionTitle}>Social</Text>

        <SettingRow
          label="Allow Friend Requests"
          desc="Let other traders send you friend requests"
          value={settings.allow_friend_requests}
          onToggle={(v) => handleToggle('allow_friend_requests', v)}
        />
        <SettingRow
          label="Allow Messages"
          desc="Receive direct messages from friends"
          value={settings.allow_messages}
          onToggle={(v) => handleToggle('allow_messages', v)}
        />

        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
          <Text style={styles.actionText}>Export My Data</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
          <Text style={styles.dangerText}>Delete My Account</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, desc, value, onToggle }: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.dark.bg.tertiary, true: colors.accent.teal }}
      />
    </View>
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
  content: { padding: spacing[4], paddingBottom: spacing[10] },
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  actionText: { color: colors.accent.teal, fontWeight: typography.weights.medium as any },
  actionArrow: { color: colors.dark.text.muted },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  dangerText: { color: colors.accent.red, fontWeight: typography.weights.medium as any },
});
