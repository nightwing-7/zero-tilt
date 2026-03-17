import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ViewStyle,
  TextStyle,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { getTodaysPledge, signPledge } from '../services/pledges';
import { DEFAULT_PLEDGE_TEXT } from '../constants/config';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Button } from '../components/ui/Button';

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
  pledgeBox: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  pledgeText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    lineHeight: 24,
  } as TextStyle,
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  signatureInput: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
    minHeight: 50,
  } as TextStyle,
  buttons: {
    gap: spacing[3],
    marginTop: spacing[8],
  },
  signButton: {
    width: '100%',
  },
  alreadySigned: {
    backgroundColor: colors.dark.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
  alreadySignedText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.accent.teal,
  } as TextStyle,
  alreadySignedSubtext: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginTop: spacing[2],
  } as TextStyle,
});

export default function DailyPledgeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [pledgedToday, setPledgedToday] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkPledge = async () => {
      if (!user?.id) return;

      try {
        const pledge = await getTodaysPledge(user.id);
        setPledgedToday(!!pledge);
      } catch (error) {
        console.error('Error checking pledge:', error);
      } finally {
        setInitializing(false);
      }
    };

    checkPledge();
  }, [user?.id]);

  const handleSign = async () => {
    if (!signature.trim()) {
      Alert.alert('Error', 'Please sign the pledge');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);

    try {
      await signPledge(user.id, DEFAULT_PLEDGE_TEXT, signature);

      track('pledge_signed', { method: 'manual' });

      Alert.alert('Success', 'Thank you for signing your pledge!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign pledge. Please try again.');
      console.error('Sign pledge error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Pledge</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Pledge</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.pledgeBox}>
            <Text style={styles.pledgeText}>{DEFAULT_PLEDGE_TEXT}</Text>
          </View>

          {pledgedToday ? (
            <View style={styles.alreadySigned}>
              <Text style={styles.alreadySignedText}>✓ Already Signed</Text>
              <Text style={styles.alreadySignedSubtext}>
                You've already signed your pledge today
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Sign Pledge</Text>
                <TextInput
                  style={styles.signatureInput}
                  placeholder="Type your name to sign..."
                  placeholderTextColor={colors.dark.text.muted}
                  value={signature}
                  onChangeText={setSignature}
                  editable={!loading}
                />
              </View>

              <View style={styles.buttons}>
                <Button
                  title="Sign Pledge"
                  onPress={handleSign}
                  loading={loading}
                  size="lg"
                  style={styles.signButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => router.back()}
                  variant="secondary"
                  size="lg"
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
