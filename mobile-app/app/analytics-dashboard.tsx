import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { ProGate } from '../components/ProGate';
import {
  getUrgeAnalytics,
  getStreakAnalytics,
  getRelapseAnalytics,
  getWeeklySummary,
  UrgeAnalytics,
  StreakAnalytics,
  RelapseAnalytics,
  WeeklySummary,
} from '../services/advancedAnalytics';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Tab = 'overview' | 'urges' | 'streaks' | 'relapses';

export default function AnalyticsDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [tab, setTab] = useState<Tab>('overview');
  const [urgeStats, setUrgeStats] = useState<UrgeAnalytics | null>(null);
  const [streakStats, setStreakStats] = useState<StreakAnalytics | null>(null);
  const [relapseStats, setRelapseStats] = useState<RelapseAnalytics | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track('analytics_viewed', { active_sub_tab: tab });
    loadData();
  }, []);

  async function loadData() {
    if (!user) return;
    try {
      const [urges, streaks, relapses, weekly] = await Promise.all([
        getUrgeAnalytics(user.id, 30),
        getStreakAnalytics(user.id),
        getRelapseAnalytics(user.id),
        getWeeklySummary(user.id),
      ]);
      setUrgeStats(urges);
      setStreakStats(streaks);
      setRelapseStats(relapses);
      setSummary(weekly);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const switchTab = (newTab: Tab) => {
    track('analytics_tab_switched', { from_tab: tab, to_tab: newTab });
    setTab(newTab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {(['overview', 'urges', 'streaks', 'relapses'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => switchTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'overview' && summary && (
          <>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.summaryGrid}>
              <SummaryCard emoji="🔥" label="Streak" value={`${streakStats?.currentStreak || 0} days`} />
              <SummaryCard emoji="✊" label="Urges Resisted" value={`${summary.urgesResisted}/${summary.urgesLogged}`} />
              <SummaryCard emoji="📔" label="Journal Entries" value={`${summary.journalEntries}`} />
              <SummaryCard emoji="🫁" label="Breathing Sessions" value={`${summary.breathingSessions}`} />
              <SummaryCard emoji="✅" label="Pledges Signed" value={`${summary.pledgesSigned}`} />
              <SummaryCard emoji="😊" label="Avg Mood" value={summary.moodAverage > 0 ? `${summary.moodAverage}/5` : 'N/A'} />
            </View>

            <ProGate feature="advanced_analytics">
              <View style={styles.insightCard}>
                <Text style={styles.insightTitle}>Quick Insights</Text>
                {urgeStats && urgeStats.totalUrges > 0 && (
                  <Text style={styles.insightText}>
                    Your resist rate is {urgeStats.resistRate}% over the past 30 days.
                    {urgeStats.resistRate >= 70
                      ? ' Great discipline!'
                      : ' Focus on using coping strategies.'}
                  </Text>
                )}
                {streakStats && streakStats.currentStreak > streakStats.averageStreak && (
                  <Text style={styles.insightText}>
                    Your current streak ({streakStats.currentStreak} days) is above your average ({streakStats.averageStreak} days). Keep it up!
                  </Text>
                )}
                {relapseStats && relapseStats.byTrigger.length > 0 && (
                  <Text style={styles.insightText}>
                    Top relapse trigger: {relapseStats.byTrigger[0].trigger} ({relapseStats.byTrigger[0].count} times)
                  </Text>
                )}
              </View>
            </ProGate>
          </>
        )}

        {tab === 'urges' && urgeStats && (
          <ProGate feature="urge_analytics">
            <>
              <Text style={styles.sectionTitle}>Urge Trends (30 Days)</Text>

              <View style={styles.statsRow}>
                <StatBox label="Total Urges" value={urgeStats.totalUrges} />
                <StatBox label="Resist Rate" value={`${urgeStats.resistRate}%`} color={urgeStats.resistRate >= 60 ? colors.accent.green : colors.accent.red} />
                <StatBox label="Avg Intensity" value={urgeStats.avgIntensity.toFixed(1)} />
              </View>

              {/* Day of week breakdown */}
              <Text style={styles.chartTitle}>By Day of Week</Text>
              <View style={styles.barChart}>
                {urgeStats.byDayOfWeek.map((day) => (
                  <View key={day.day} style={styles.barItem}>
                    <View style={[styles.bar, { height: Math.max(4, (day.count / Math.max(...urgeStats.byDayOfWeek.map(d => d.count), 1)) * 80) }]} />
                    <Text style={styles.barLabel}>{DAY_NAMES[day.day]}</Text>
                    <Text style={styles.barValue}>{day.count}</Text>
                  </View>
                ))}
              </View>

              {/* Time of day breakdown */}
              {urgeStats.byTimeOfDay.length > 0 && (
                <>
                  <Text style={styles.chartTitle}>Peak Hours</Text>
                  {urgeStats.byTimeOfDay.slice(0, 5).map((item) => (
                    <View key={item.hour} style={styles.hourRow}>
                      <Text style={styles.hourLabel}>
                        {item.hour.toString().padStart(2, '0')}:00
                      </Text>
                      <View style={styles.hourBar}>
                        <View style={[styles.hourBarFill, { width: `${(item.count / Math.max(...urgeStats.byTimeOfDay.map(d => d.count), 1)) * 100}%` }]} />
                      </View>
                      <Text style={styles.hourValue}>{item.count}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Trigger breakdown */}
              {urgeStats.byTrigger.length > 0 && (
                <>
                  <Text style={styles.chartTitle}>By Trigger</Text>
                  {urgeStats.byTrigger.map((trigger) => (
                    <View key={trigger.trigger} style={styles.triggerRow}>
                      <Text style={styles.triggerName}>{trigger.trigger}</Text>
                      <Text style={styles.triggerCount}>{trigger.count}x</Text>
                      <Text style={[
                        styles.triggerResist,
                        { color: trigger.resistRate >= 60 ? colors.accent.green : colors.accent.red },
                      ]}>
                        {trigger.resistRate}% resisted
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </>
          </ProGate>
        )}

        {tab === 'streaks' && streakStats && (
          <ProGate feature="streak_analytics">
            <>
              <Text style={styles.sectionTitle}>Streak History</Text>
              <View style={styles.statsRow}>
                <StatBox label="Current" value={streakStats.currentStreak} color={colors.accent.teal} />
                <StatBox label="Best" value={streakStats.bestStreak} color={colors.accent.amber} />
                <StatBox label="Average" value={streakStats.averageStreak} />
              </View>

              <Text style={styles.chartTitle}>All Streaks</Text>
              {streakStats.streakHistory.slice(0, 10).map((streak, i) => (
                <View key={i} style={styles.streakRow}>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakDate}>{streak.startDate}</Text>
                    {streak.isActive && <Text style={styles.activeBadge}>ACTIVE</Text>}
                  </View>
                  <View style={styles.streakBarContainer}>
                    <View style={[
                      styles.streakBar,
                      {
                        width: `${(streak.days / Math.max(streakStats.bestStreak, 1)) * 100}%`,
                        backgroundColor: streak.isActive ? colors.accent.teal : colors.dark.bg.tertiary,
                      },
                    ]} />
                  </View>
                  <Text style={styles.streakDays}>{streak.days}d</Text>
                </View>
              ))}
            </>
          </ProGate>
        )}

        {tab === 'relapses' && relapseStats && (
          <ProGate feature="relapse_analytics">
            <>
              <Text style={styles.sectionTitle}>Relapse Patterns</Text>
              <View style={styles.statsRow}>
                <StatBox label="Total Relapses" value={relapseStats.totalRelapses} />
                <StatBox label="Avg Days Lost" value={relapseStats.averageDaysLost} />
              </View>

              {relapseStats.byTrigger.length > 0 && (
                <>
                  <Text style={styles.chartTitle}>By Trigger</Text>
                  {relapseStats.byTrigger.map((trigger) => (
                    <View key={trigger.trigger} style={styles.triggerRow}>
                      <Text style={styles.triggerName}>{trigger.trigger}</Text>
                      <Text style={styles.triggerCount}>{trigger.count}x</Text>
                      <Text style={styles.triggerResist}>~{trigger.avgDaysLost}d lost</Text>
                    </View>
                  ))}
                </>
              )}

              {relapseStats.byEmotion.length > 0 && (
                <>
                  <Text style={styles.chartTitle}>By Emotional State</Text>
                  {relapseStats.byEmotion.map((emotion) => (
                    <View key={emotion.emotion} style={styles.triggerRow}>
                      <Text style={styles.triggerName}>{emotion.emotion}</Text>
                      <Text style={styles.triggerCount}>{emotion.count}x</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          </ProGate>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statBoxValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: { color: colors.accent.teal },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  tabScroll: { maxHeight: 48, marginBottom: spacing[2] },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginLeft: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.bg.secondary,
  },
  tabActive: { backgroundColor: colors.accent.teal },
  tabText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  tabTextActive: { color: '#fff', fontWeight: typography.weights.semibold as any },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  sectionTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary, marginBottom: spacing[4] },
  chartTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold as any, color: colors.dark.text.secondary, marginTop: spacing[6], marginBottom: spacing[3] },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  summaryCard: {
    width: '47%',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  summaryEmoji: { fontSize: 24, marginBottom: spacing[1] },
  summaryValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  summaryLabel: { color: colors.dark.text.muted, fontSize: typography.sizes.xs, marginTop: spacing[1] },
  statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  statBox: { flex: 1, backgroundColor: colors.dark.bg.secondary, borderRadius: borderRadius.lg, padding: spacing[4], alignItems: 'center' },
  statBoxValue: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  statBoxLabel: { color: colors.dark.text.muted, fontSize: typography.sizes.xs, marginTop: spacing[1] },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingTop: spacing[4] },
  barItem: { alignItems: 'center', gap: spacing[1] },
  bar: { width: 24, backgroundColor: colors.accent.teal, borderRadius: borderRadius.sm },
  barLabel: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  barValue: { color: colors.dark.text.tertiary, fontSize: typography.sizes.xs },
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  hourLabel: { color: colors.dark.text.muted, fontSize: typography.sizes.xs, width: 40 },
  hourBar: { flex: 1, height: 12, backgroundColor: colors.dark.bg.tertiary, borderRadius: borderRadius.sm },
  hourBarFill: { height: 12, backgroundColor: colors.accent.blue, borderRadius: borderRadius.sm },
  hourValue: { color: colors.dark.text.muted, fontSize: typography.sizes.xs, width: 20, textAlign: 'right' },
  triggerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.dark.bg.tertiary },
  triggerName: { color: colors.dark.text.primary, flex: 1 },
  triggerCount: { color: colors.dark.text.tertiary, marginRight: spacing[3] },
  triggerResist: { color: colors.dark.text.muted, fontSize: typography.sizes.sm },
  insightCard: { backgroundColor: colors.dark.bg.secondary, borderRadius: borderRadius.lg, padding: spacing[4], marginTop: spacing[4] },
  insightTitle: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any, marginBottom: spacing[2] },
  insightText: { color: colors.dark.text.secondary, fontSize: typography.sizes.sm, lineHeight: 20, marginBottom: spacing[2] },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  streakInfo: { width: 100, flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  streakDate: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  activeBadge: { color: colors.accent.teal, fontSize: 8, fontWeight: typography.weights.bold as any },
  streakBarContainer: { flex: 1, height: 16, backgroundColor: colors.dark.bg.secondary, borderRadius: borderRadius.sm },
  streakBar: { height: 16, borderRadius: borderRadius.sm },
  streakDays: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm, width: 30, textAlign: 'right' },
});
