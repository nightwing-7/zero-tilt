import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSubscription } from '../hooks/useSubscription';
import { useAnalytics } from '../hooks/useAnalytics';
import { SubscriptionPackage } from '../services/subscription';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const PRO_FEATURES = [
  { icon: '📔', text: 'Unlimited journal entries' },
  { icon: '🎯', text: 'Unlimited custom goals' },
  { icon: '📊', text: 'Advanced analytics & trends' },
  { icon: '🤖', text: 'Unlimited AI coaching' },
  { icon: '💬', text: 'Unlimited community posts' },
  { icon: '👥', text: 'Create & join unlimited clans' },
  { icon: '🎮', text: 'All 6 mini-games' },
  { icon: '🏆', text: 'Pro-exclusive badges' },
  { icon: '📈', text: 'Full leaderboard access' },
  { icon: '⭐', text: 'Priority support' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { track } = useAnalytics();
  const { offerings, purchase, restore, loading } = useSubscription();

  React.useEffect(() => {
    track('paywall_viewed', { source: source || 'unknown' });
  }, []);

  const handlePurchase = async (pkg: SubscriptionPackage) => {
    try {
      const success = await purchase(pkg);
      if (success) {
        Alert.alert('Welcome to Pro!', 'You now have full access to all ZERO TILT features.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert('Purchase Error', 'There was an issue processing your purchase. Please try again.');
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('Restored!', 'Your Pro subscription has been restored.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
    }
  };

  const yearlyPkg = offerings.find(o => o.packageType === 'ANNUAL');
  const monthlyPkg = offerings.find(o => o.packageType === 'MONTHLY');
  const lifetimePkg = offerings.find(o => o.packageType === 'LIFETIME');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={styles.heroTitle}>Unlock Your{'\n'}Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Master your trading psychology with Pro features
          </Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.planContainer}>
          {yearlyPkg && (
            <TouchableOpacity
              style={[styles.planCard, styles.planCardHighlighted]}
              onPress={() => handlePurchase(yearlyPkg)}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planName}>Pro Yearly</Text>
              <Text style={styles.planPrice}>{yearlyPkg.product.priceString}/year</Text>
              <Text style={styles.planSavings}>Save 50% — $5.00/month</Text>
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>7-day free trial</Text>
              </View>
            </TouchableOpacity>
          )}

          {monthlyPkg && (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handlePurchase(monthlyPkg)}
            >
              <Text style={styles.planName}>Pro Monthly</Text>
              <Text style={styles.planPrice}>{monthlyPkg.product.priceString}/month</Text>
              <Text style={styles.planDetail}>Cancel anytime</Text>
            </TouchableOpacity>
          )}

          {lifetimePkg && (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handlePurchase(lifetimePkg)}
            >
              <Text style={styles.planName}>Pro Lifetime</Text>
              <Text style={styles.planPrice}>{lifetimePkg.product.priceString}</Text>
              <Text style={styles.planDetail}>One-time payment, forever access</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Everything in Pro</Text>
          {PRO_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Already subscribed? Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Payment will be charged to your Apple ID account at confirmation of purchase.
          Subscription automatically renews unless auto-renew is turned off at least 24 hours
          before the end of the current period. By subscribing, you agree to our Terms of Service
          and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  scrollContent: { padding: spacing[4], paddingBottom: spacing[10] },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing[2],
  },
  closeText: { color: colors.dark.text.tertiary, fontSize: 24 },
  heroSection: { alignItems: 'center', marginVertical: spacing[6] },
  heroEmoji: { fontSize: 64, marginBottom: spacing[3] },
  heroTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.dark.text.primary,
    textAlign: 'center',
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[2],
  },
  planContainer: { gap: spacing[3], marginBottom: spacing[6] },
  planCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    borderWidth: 2,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  planCardHighlighted: {
    borderColor: colors.accent.teal,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  bestValueBadge: {
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginBottom: spacing[2],
  },
  bestValueText: { color: '#fff', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold as any },
  planName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.dark.text.primary,
  },
  planPrice: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.dark.text.primary,
    marginTop: spacing[1],
  },
  planSavings: {
    color: colors.accent.teal,
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  planDetail: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm, marginTop: spacing[1] },
  trialBadge: {
    backgroundColor: colors.accent.amber,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginTop: spacing[2],
  },
  trialText: { color: '#000', fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold as any },
  featuresSection: { marginBottom: spacing[6] },
  featuresTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.dark.text.primary,
    marginBottom: spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  featureIcon: { fontSize: 20 },
  featureText: { color: colors.dark.text.secondary, fontSize: typography.sizes.base, flex: 1 },
  restoreButton: { alignItems: 'center', paddingVertical: spacing[4] },
  restoreText: { color: colors.accent.teal, fontSize: typography.sizes.sm },
  termsText: {
    color: colors.dark.text.muted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing[2],
  },
});
