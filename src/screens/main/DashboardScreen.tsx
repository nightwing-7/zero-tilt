import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, G, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';

type RootStackParamList = {
  DashboardScreen: undefined;
  PanicButton: undefined;
  PreTradeChecklist: undefined;
  UrgeTracker: undefined;
  GoalsTracking: undefined;
  Journal: undefined;
  Coach: undefined;
  Pledge: undefined;
  Home: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface User {
  id: string;
  name?: string;
  trader_name?: string;
}

interface Goal {
  id: string;
  label: string;
  icon: string;
  color?: string;
  is_active: boolean;
}

interface JournalEntry {
  id: string;
  title: string;
  mood: string;
  created_at: string;
}

interface StreakData {
  days: number;
  best: number;
  relapses: number;
}

// Rank badges mapping
const RANK_BADGES: Record<string, { name: string; emoji: string; color: string }> = {
  Rookie: { name: 'Rookie', emoji: '🌱', color: '#64748b' },
  Apprentice: { name: 'Apprentice', emoji: '📚', color: '#3b82f6' },
  Warrior: { name: 'Warrior', emoji: '⚔️', color: '#8b5cf6' },
  Veteran: { name: 'Veteran', emoji: '🏅', color: '#f59e0b' },
  Master: { name: 'Master', emoji: '👑', color: '#ec4899' },
  Legend: { name: 'Legend', emoji: '⭐', color: '#10b981' },
};

// Brain rewiring phases
const PHASES = [
  { start: 0, end: 10, label: 'Awareness', color: '#64748b' },
  { start: 10, end: 30, label: 'Resistance', color: '#3b82f6' },
  { start: 30, end: 60, label: 'Reconditioning', color: '#8b5cf6' },
  { start: 60, end: 90, label: 'Mastery', color: '#f59e0b' },
  { start: 90, end: Infinity, label: 'Fully Rewired', color: '#10b981' },
];

const MOOD_OPTIONS = [
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😊', label: 'Good', value: 'good' },
  { emoji: '🔥', label: 'Fired Up', value: 'fired_up' },
];

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - spacing.lg * 2 - spacing.md) / 2;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    days: 0,
    best: 0,
    relapses: 0,
  });
  const [rank, setRank] = useState('Rookie');
  const [pledgedToday, setPledgedToday] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const getRank = (days: number): string => {
    if (days <= 2) return 'Rookie';
    if (days <= 6) return 'Apprentice';
    if (days <= 13) return 'Warrior';
    if (days <= 29) return 'Veteran';
    if (days <= 59) return 'Master';
    return 'Legend';
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || 'Trader',
        trader_name: authUser.user_metadata?.trader_name || authUser.user_metadata?.name || 'Trader',
      });

      // Get streak data from streaks table
      const { data: currentStreakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_current', true)
        .single();

      const { data: allStreaks } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      const currentDays = currentStreakData
        ? Math.floor((Date.now() - new Date(currentStreakData.started_at).getTime()) / 86400000)
        : 0;
      const bestDays = allStreaks
        ? Math.max(...allStreaks.map((s) => s.days || 0), 0)
        : 0;
      const relapseCount = allStreaks
        ? allStreaks.filter((s) => !s.is_current && s.ended_reason).length
        : 0;

      setStreakData({
        days: currentDays,
        best: bestDays,
        relapses: relapseCount,
      });

      setRank(getRank(currentDays));

      // Check daily pledge
      const today = new Date().toISOString().split('T')[0];
      const { data: pledgeData } = await supabase
        .from('daily_pledges')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('pledge_date', today)
        .single();

      setPledgedToday(!!pledgeData);

      // Load active goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, label, icon, color, is_active')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .limit(5);

      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTakePledge = async () => {
    try {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('daily_pledges').insert({
        user_id: user.id,
        pledge_date: today,
      });

      if (!error) {
        setPledgedToday(true);
      }
    } catch (error) {
      console.error('Error taking pledge:', error);
    }
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    // Could save mood to database here
    setTimeout(() => {
      navigation.navigate('Journal' as any);
    }, 300);
  };

  // SVG Icons
  const SettingsIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="1.5" fill={colors.textPrimary} />
      <Circle cx="19.5" cy="12" r="1.5" fill={colors.textPrimary} />
      <Circle cx="4.5" cy="12" r="1.5" fill={colors.textPrimary} />
    </Svg>
  );

  const ShieldIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 4L6 8V14C6 22 16 28 16 28C16 28 26 22 26 14V8L16 4Z"
        stroke={colors.emerald[500]}
        strokeWidth="1.5"
        fill="none"
      />
    </Svg>
  );

  const CompassIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="12" stroke={colors.emerald[500]} strokeWidth="1.5" fill="none" />
      <Path d="M16 8L20 16L16 24L12 16Z" fill={colors.emerald[500]} />
      <Circle cx="16" cy="16" r="2" fill={colors.emerald[500]} />
    </Svg>
  );

  const PulseIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M4 16H8L12 8L16 20L20 12H28"
        stroke={colors.amber[500]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  const ClockIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="12" stroke={colors.red[500]} strokeWidth="1.5" fill="none" />
      <Path d="M16 12V16H20" stroke={colors.red[500]} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  // Components
  const RankBadgeCard = () => {
    const badge = RANK_BADGES[rank] || RANK_BADGES.Rookie;
    return (
      <View style={styles.rankBadgeGradient}>
        <Defs>
          <LinearGradient id="rankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.emerald[500]} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={colors.emerald[500]} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <View
          style={[
            styles.rankCard,
            {
              backgroundColor: `${colors.emerald[500]}15`,
              borderColor: colors.emerald[500],
            },
          ]}
        >
          <View style={styles.rankBadgeContent}>
            <Text style={styles.rankEmoji}>{badge.emoji}</Text>
            <View style={styles.rankTextContainer}>
              <Text style={styles.rankName}>{badge.name}</Text>
              <Text style={styles.tiltFreeText}>{streakData.days} days tilt-free</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const BrainRewiringProgress = () => {
    const progress = Math.min(streakData.days, 90);
    const progressPercent = (progress / 90) * 100;
    const currentPhase = PHASES.find(
      (phase) => streakData.days >= phase.start && streakData.days < phase.end
    ) || PHASES[4];

    return (
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Brain Rewiring Progress</Text>
          <Text style={styles.progressDays}>
            {streakData.days}/90 days
          </Text>
        </View>

        {/* Progress bar with gradient */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: currentPhase.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Phase labels */}
        <View style={styles.phasesContainer}>
          {PHASES.slice(0, -1).map((phase) => (
            <View key={phase.label} style={styles.phaseItem}>
              <Text style={styles.phaseLabel}>{phase.label}</Text>
              <Text style={styles.phaseRange}>
                {phase.start}-{phase.end}d
              </Text>
            </View>
          ))}
          <View style={styles.phaseItem}>
            <Text style={styles.phaseLabel}>Fully Rewired</Text>
            <Text style={styles.phaseRange}>90d+</Text>
          </View>
        </View>

        {/* Current phase indicator */}
        <View
          style={[
            styles.currentPhaseIndicator,
            { backgroundColor: currentPhase.color },
          ]}
        >
          <Text style={styles.currentPhaseText}>{currentPhase.label}</Text>
        </View>
      </View>
    );
  };

  const QuickActionButton = ({
    icon: IconComponent,
    label,
    onPress,
  }: {
    icon: React.FC;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionIconContainer}>
        <IconComponent />
      </View>
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const QuickActionGrid = () => (
    <View style={styles.actionsGrid}>
      <View style={styles.actionRow}>
        <View style={styles.actionCol}>
          <QuickActionButton
            icon={ShieldIcon}
            label="Pledge"
            onPress={() => navigation.navigate('Pledge' as any)}
          />
        </View>
        <View style={styles.actionCol}>
          <QuickActionButton
            icon={CompassIcon}
            label="Coach"
            onPress={() => navigation.navigate('Coach' as any)}
          />
        </View>
      </View>
      <View style={styles.actionRow}>
        <View style={styles.actionCol}>
          <QuickActionButton
            icon={PulseIcon}
            label="Urge Alert"
            onPress={() => navigation.navigate('UrgeTracker')}
          />
        </View>
        <View style={styles.actionCol}>
          <QuickActionButton
            icon={ClockIcon}
            label="Reset"
            onPress={() => navigation.navigate('PanicButton')}
          />
        </View>
      </View>
    </View>
  );

  const DailyCheckInCard = () => (
    <View style={styles.checkInCard}>
      <Text style={styles.checkInTitle}>How's your trading mindset today?</Text>
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.moodButtonSelected,
            ]}
            onPress={() => handleMoodSelect(mood.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const GoalIndicator = ({ goal }: { goal: Goal }) => {
    return (
      <TouchableOpacity
        style={styles.goalIndicator}
        onPress={() => navigation.navigate('GoalsTracking')}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.goalCircle,
            {
              borderColor: goal.color || colors.emerald[500],
              borderWidth: 2,
              overflow: 'hidden',
            },
          ]}
        >
          <Text style={styles.goalIcon}>{goal.icon}</Text>
        </View>
        <Text
          style={styles.goalLabel}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {goal.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const StreakHistoryCard = () => (
    <View style={styles.streakHistoryCard}>
      <View style={styles.streakHistoryRow}>
        <View style={styles.streakHistoryItem}>
          <Text style={styles.streakHistoryLabel}>Current Streak</Text>
          <Text style={styles.streakHistoryValue}>{streakData.days}</Text>
          <Text style={styles.streakHistoryUnit}>days</Text>
        </View>
        <View style={styles.streakHistoryDivider} />
        <View style={styles.streakHistoryItem}>
          <Text style={styles.streakHistoryLabel}>Best Streak</Text>
          <Text style={styles.streakHistoryValue}>{streakData.best}</Text>
          <Text style={styles.streakHistoryUnit}>days</Text>
        </View>
        <View style={styles.streakHistoryDivider} />
        <View style={styles.streakHistoryItem}>
          <Text style={styles.streakHistoryLabel}>Relapses</Text>
          <Text style={styles.streakHistoryValue}>{streakData.relapses}</Text>
          <Text style={styles.streakHistoryUnit}>times</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.emerald[500]}
          />
        }
      >
        {/* Header with greeting and settings */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting}, {user?.trader_name || 'Trader'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as any)}
            activeOpacity={0.7}
          >
            <SettingsIcon />
          </TouchableOpacity>
        </View>

        {/* Rank Badge Card */}
        <RankBadgeCard />

        {/* Brain Rewiring Progress */}
        <BrainRewiringProgress />

        {/* Quick Action Buttons */}
        <QuickActionGrid />

        {/* Daily Check-in */}
        <DailyCheckInCard />

        {/* Active Goals */}
        {goals.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.goalsScroll}
              contentContainerStyle={styles.goalsContent}
            >
              {goals.map((goal) => (
                <GoalIndicator key={goal.id} goal={goal} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Streak History Card */}
        <StreakHistoryCard />

        {/* Bottom padding */}
        <View style={{ height: spacing.xxl }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    marginTop: spacing.lg,
  } as ViewStyle,
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,

  // Rank Badge Card
  rankBadgeGradient: {
    marginBottom: spacing.xl,
  } as ViewStyle,
  rankCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.emerald[500]}15`,
  } as ViewStyle,
  rankBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  } as ViewStyle,
  rankEmoji: {
    fontSize: 48,
  } as TextStyle,
  rankTextContainer: {
    flex: 1,
  } as ViewStyle,
  rankName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.xs,
  } as TextStyle,
  tiltFreeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  } as TextStyle,

  // Progress Section
  progressSection: {
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,
  progressDays: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  } as TextStyle,
  progressBarContainer: {
    marginBottom: spacing.xl,
  } as ViewStyle,
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  } as ViewStyle,
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  } as ViewStyle,
  phasesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  } as ViewStyle,
  phaseItem: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  phaseLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.xs,
  } as TextStyle,
  phaseRange: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Inter',
  } as TextStyle,
  currentPhaseIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    alignSelf: 'flex-start',
  } as ViewStyle,
  currentPhaseText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.background,
    fontFamily: 'Inter',
  } as TextStyle,

  // Quick Actions Grid
  actionsGrid: {
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  } as ViewStyle,
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  } as ViewStyle,
  actionCol: {
    flex: 1,
  } as ViewStyle,
  actionButton: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  actionIconContainer: {
    marginBottom: spacing.md,
  } as ViewStyle,
  actionButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    textAlign: 'center',
  } as TextStyle,

  // Daily Check-in Card
  checkInCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  checkInTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  } as ViewStyle,
  moodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  } as ViewStyle,
  moodButtonSelected: {
    backgroundColor: `${colors.emerald[500]}20`,
    borderColor: colors.emerald[500],
    borderWidth: 1,
  } as ViewStyle,
  moodEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  } as TextStyle,
  moodLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  } as TextStyle,

  // Goals Section
  goalsSection: {
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.md,
  } as TextStyle,
  goalsScroll: {
    marginHorizontal: -spacing.lg,
  } as ViewStyle,
  goalsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  } as ViewStyle,
  goalIndicator: {
    alignItems: 'center',
    width: 80,
  } as ViewStyle,
  goalCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  goalIcon: {
    fontSize: 28,
  } as TextStyle,
  goalLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: spacing.xs,
  } as TextStyle,
  goalProgress: {
    fontSize: fontSize.xs,
    color: colors.emerald[500],
    fontWeight: fontWeight.semibold,
    fontFamily: 'Inter',
  } as TextStyle,

  // Streak History Card
  streakHistoryCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  } as ViewStyle,
  streakHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  streakHistoryItem: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  streakHistoryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.xs,
  } as TextStyle,
  streakHistoryValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.emerald[500],
    fontFamily: 'Inter',
  } as TextStyle,
  streakHistoryUnit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: spacing.xs,
  } as TextStyle,
  streakHistoryDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.cardBorder,
  } as ViewStyle,
});

export default DashboardScreen;
