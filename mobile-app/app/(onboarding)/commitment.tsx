import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useRoute, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../hooks/useAnalytics';
import { completeOnboarding } from '../../services/profile';
import { signPledge } from '../../services/pledges';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { DEFAULT_PLEDGE_TEXT } from '../../constants/config';
import { Button } from '../../components/ui/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.dark.tertiary,
    borderRadius: 2,
    marginBottom: spacing[6],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.accent.teal,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
  } as TextStyle,
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginBottom: spacing[6],
  } as TextStyle,
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
  signatureSection: {
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
    paddingBottom: spacing[4],
  },
  commitButton: {
    width: '100%',
  },
});

export default function CommitmentScreen() {
  const route = useRoute();
  const router = useRouter();
  const { user } = useAuth();
  const { track, identify } = useAnalytics();

  const params = useMemo(() => ({
    traderName: route.params?.traderName as string || '',
    age: parseInt(route.params?.age as string || '0'),
    tradingStyles: JSON.parse((route.params?.tradingStyles as string) || '[]'),
    markets: JSON.parse((route.params?.markets as string) || '[]'),
    experienceLevel: route.params?.experienceLevel as string || '',
    tiltRiskLevel: parseInt(route.params?.tiltRiskLevel as string || '0'),
    tiltSymptoms: JSON.parse((route.params?.tiltSymptoms as string) || '[]'),
    goals: JSON.parse((route.params?.goals as string) || '[]'),
  }), [route.params]);

  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommit = async () => {
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
      await completeOnboarding(user.id, {
        trader_name: params.traderName,
        age: params.age,
        trading_style: params.tradingStyles,
        markets: params.markets,
        experience_level: params.experienceLevel,
        tilt_risk_level: params.tiltRiskLevel,
        tilt_symptoms: params.tiltSymptoms,
        goals: params.goals,
      });

      await signPledge(user.id, DEFAULT_PLEDGE_TEXT, signature);

      identify(user.id, {
        trader_name: params.traderName,
        experience_level: params.experienceLevel,
        tilt_risk_level: params.tiltRiskLevel,
      });

      track('onboarding_completed', {
        trader_name: params.traderName,
        experience_level: params.experienceLevel,
        tilt_risk_level: params.tiltRiskLevel,
      });

      track('pledge_signed');

      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Your Daily Pledge</Text>
        <Text style={styles.subtitle}>Commit to mastering your psychology</Text>

        <View style={styles.pledgeBox}>
          <Text style={styles.pledgeText}>{DEFAULT_PLEDGE_TEXT}</Text>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.sectionLabel}>Sign Your Pledge</Text>
          <TextInput
            style={styles.signatureInput}
            placeholder="Type your name to sign..."
            placeholderTextColor={colors.dark.text.muted}
            value={signature}
            onChangeText={setSignature}
          />
        </View>

        <View style={styles.buttons}>
          <Button
            title="I Commit"
            onPress={handleCommit}
            loading={loading}
            size="lg"
            style={styles.commitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
