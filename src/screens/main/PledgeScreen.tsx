import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type RootStackParamList = {
  Pledge: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DailyPledge {
  id: string;
  user_id: string;
  pledge_date: string;
  pledged: boolean;
}

const PLEDGE_TEXT =
  'I pledge to follow my trading plan, respect my risk limits, and walk away when emotions take over.';

const PledgeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [pledgeSigned, setPledgeSigned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pastPledges, setPastPledges] = useState<DailyPledge[]>([]);
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    loadUserAndPledgeData();
  }, []);

  const loadUserAndPledgeData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUserId(authUser.id);
        await loadTodaysPledge(authUser.id);
        await loadPastPledges(authUser.id);
      }
    } catch (error) {
      console.error('Error loading pledge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysPledge = async (uid: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_pledges')
        .select('*')
        .eq('user_id', uid)
        .eq('pledge_date', today)
        .single();

      if (data) {
        setPledgeSigned(true);
      } else {
        setPledgeSigned(false);
      }
    } catch (error) {
      console.error('Error loading today\'s pledge:', error);
      setPledgeSigned(false);
    }
  };

  const loadPastPledges = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('daily_pledges')
        .select('*')
        .eq('user_id', uid)
        .order('pledge_date', { ascending: false })
        .limit(10);

      if (data) {
        setPastPledges(data);
      }
    } catch (error) {
      console.error('Error loading past pledges:', error);
    }
  };

  const handleSignPledge = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('daily_pledges').insert({
        user_id: userId,
        pledge_date: today,
        pledged: true,
      });

      if (!error) {
        setPledgeSigned(true);
        // Animate the checkmark
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.elastic(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        // Reload pledges
        await loadPastPledges(userId);
      }
    } catch (error) {
      console.error('Error signing pledge:', error);
    }
  };

  // Checkmark SVG
  const CheckmarkIcon = ({ animated }: { animated?: boolean }) => (
    <Animated.View
      style={{
        transform: [{ scale: animated ? scaleAnim : 1 }],
        opacity: animated ? opacityAnim : 1,
      }}
    >
      <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
        <Circle cx="32" cy="32" r="30" fill={colors.emerald[500]} />
        <Path
          d="M20 32L28 40L44 24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );

  // Shield Icon
  const ShieldIcon = () => (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 4L12 10V22C12 32 24 40 24 40C24 40 36 32 36 22V10L24 4Z"
        stroke={colors.emerald[500]}
        strokeWidth="2"
        fill={`${colors.emerald[500]}15`}
      />
    </Svg>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Pledge</Text>
          <Text style={styles.headerSubtitle}>Commit to your trading discipline</Text>
        </View>

        {/* Today's Pledge Card */}
        <View
          style={[
            styles.pledgeCard,
            pledgeSigned && styles.pledgeCardSigned,
          ]}
        >
          {/* Icon */}
          <View style={styles.pledgeIconContainer}>
            {pledgeSigned ? (
              <CheckmarkIcon animated={true} />
            ) : (
              <ShieldIcon />
            )}
          </View>

          {/* Pledge Text */}
          <Text style={styles.pledgeText}>{PLEDGE_TEXT}</Text>

          {/* Sign Button or Badge */}
          {pledgeSigned ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Pledge Active</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signButton}
              onPress={handleSignPledge}
              activeOpacity={0.7}
            >
              <Text style={styles.signButtonText}>Sign Your Pledge</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Motivational Section */}
        <View style={styles.motivationalSection}>
          <Text style={styles.motivationalTitle}>Why This Matters</Text>
          <View style={styles.motivationalCard}>
            <Text style={styles.motivationalText}>
              Taking the pledge strengthens your commitment. Each day you sign, you're rewiring your brain toward disciplined trading and emotional control.
            </Text>
          </View>
        </View>

        {/* Past Pledges */}
        {pastPledges.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Pledge History</Text>
            <View style={styles.historyList}>
              {pastPledges.slice(0, 7).map((pledge, index) => {
                const pledgeDate = new Date(pledge.pledge_date);
                const dateStr = pledgeDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                const dayStr = pledgeDate.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <View key={pledge.id} style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <Text style={styles.historyItemDay}>{dayStr}</Text>
                      <Text style={styles.historyItemDate}>{dateStr}</Text>
                    </View>
                    <View style={styles.historyItemCheck}>
                      <Text style={styles.historyItemCheckmark}>✓</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  // Header
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.sm,
  } as TextStyle,
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  } as TextStyle,

  // Pledge Card
  pledgeCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  pledgeCardSigned: {
    backgroundColor: `${colors.emerald[500]}10`,
    borderColor: colors.emerald[500],
  } as ViewStyle,
  pledgeIconContainer: {
    marginBottom: spacing.lg,
  } as ViewStyle,
  pledgeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  } as TextStyle,

  // Sign Button
  signButton: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  signButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.background,
    fontFamily: 'Inter',
  } as TextStyle,

  // Active Badge
  activeBadge: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  activeBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.background,
    fontFamily: 'Inter',
  } as TextStyle,

  // Motivational Section
  motivationalSection: {
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  motivationalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.md,
  } as TextStyle,
  motivationalCard: {
    backgroundColor: `${colors.emerald[500]}10`,
    borderColor: colors.emerald[500],
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  } as ViewStyle,
  motivationalText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 20,
  } as TextStyle,

  // History Section
  historySection: {
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  historyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.md,
  } as TextStyle,
  historyList: {
    gap: spacing.sm,
  } as ViewStyle,
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  } as ViewStyle,
  historyItemDay: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    minWidth: 40,
  } as TextStyle,
  historyItemDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  } as TextStyle,
  historyItemCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.emerald[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  historyItemCheckmark: {
    fontSize: fontSize.lg,
    color: colors.emerald[500],
    fontWeight: fontWeight.bold,
    fontFamily: 'Inter',
  } as TextStyle,
});

export default PledgeScreen;
