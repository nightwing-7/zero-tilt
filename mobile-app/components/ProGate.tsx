import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription } from '../hooks/useSubscription';
import { useAnalytics } from '../hooks/useAnalytics';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { isPro } = useSubscription();
  const { track } = useAnalytics();
  const router = useRouter();

  if (isPro) return <>{children}</>;

  const handleGate = () => {
    track('feature_gate_hit', { feature_name: feature });
    router.push('/paywall');
  };

  if (fallback) return <>{fallback}</>;

  return (
    <TouchableOpacity onPress={handleGate} style={styles.container}>
      <View style={styles.lockedCard}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Pro Feature</Text>
        <Text style={styles.description}>
          Upgrade to Pro to unlock {feature.replace(/_/g, ' ')}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>UPGRADE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function FreeLimitBanner({
  feature,
  remaining,
  total,
}: {
  feature: string;
  remaining: number;
  total: number;
}) {
  const router = useRouter();

  if (remaining > 0) {
    return (
      <View style={styles.limitBanner}>
        <Text style={styles.limitText}>
          {remaining} of {total} free {feature} remaining this week
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.limitBannerFull}
      onPress={() => router.push('/paywall')}
    >
      <Text style={styles.limitTextFull}>
        Free {feature} limit reached. Upgrade to Pro for unlimited access.
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[2],
  },
  lockedCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderStyle: 'dashed',
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.dark.text.primary,
    marginBottom: spacing[1],
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  badge: {
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as any,
  },
  limitBanner: {
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
  },
  limitText: {
    color: colors.dark.text.secondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  limitBannerFull: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.accent.amber,
  },
  limitTextFull: {
    color: colors.accent.amber,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
