import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
  } as TextStyle,
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[3],
  } as TextStyle,
  settingItem: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.primary,
    fontWeight: '500',
  } as TextStyle,
  settingValue: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
  } as TextStyle,
  arrow: {
    fontSize: typography.sizes.lg,
  } as TextStyle,
  profileCard: {
    padding: 0,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: typography.sizes['2xl'],
  } as TextStyle,
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.dark.text.primary,
  } as TextStyle,
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    marginTop: spacing[1],
  } as TextStyle,
  logoutButton: {
    width: '100%',
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { track } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      track('screen_viewed', { screen_name: 'settings' });
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          track('logout');
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Card style={styles.profileCard}>
            <View style={styles.profileContent}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile?.trader_name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
          </Card>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Current Plan</Text>
              <Text style={styles.settingValue}>Free</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Upgrade</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms & Privacy</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
