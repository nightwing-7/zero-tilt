import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { updateProfile } from '../services/profile';
import { Button } from '../components/ui/Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

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
    marginBottom: spacing[5],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  input: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  } as TextStyle,
  buttons: {
    gap: spacing[3],
    marginTop: spacing[4],
    paddingBottom: spacing[6],
  },
});

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { track } = useAnalytics();

  const [traderName, setTraderName] = useState(profile?.trader_name || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setTraderName(profile.trader_name || '');
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    if (!traderName.trim()) {
      Alert.alert('Error', 'Trader name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user.id, {
        trader_name: traderName.trim(),
        full_name: fullName.trim(),
      });

      track('profile_updated', {
        fields_updated: ['trader_name', 'full_name'],
      });

      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Trader Name</Text>
            <TextInput
              style={styles.input}
              value={traderName}
              onChangeText={setTraderName}
              placeholder="Your trader alias"
              placeholderTextColor={colors.dark.text.muted}
              editable={!loading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={colors.dark.text.muted}
              editable={!loading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { opacity: 0.5 }]}
              value={user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.buttons}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              size="lg"
              style={{ width: '100%' }}
            />
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
