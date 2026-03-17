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
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useStreak } from '../../hooks/useStreak';
import { useJournal } from '../../hooks/useJournal';
import { useUrges } from '../../hooks/useUrges';
import { useMilestones } from '../../hooks/useMilestones';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MilestoneOrb } from '../../components/MilestoneOrb';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
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
  statGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dark.secondary,
    borderRadius: 12,
    padding: spacing[3],
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.accent.teal,
    marginBottom: spacing[1],
  } as TextStyle,
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.tertiary,
    textAlign: 'center',
  } as TextStyle,
  progressItem: {
    marginBottom: spacing[4],
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.dark.text.primary,
  } as TextStyle,
  progressValue: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
  } as TextStyle,
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing[2],
  },
  viewAllButton: {
    width: '100%',
  },
});

export default function ProgressScreen() {
  const router = useRouter();
  const { currentStreak } = useStreak();
  const { entries } = useJournal();
  const { stats: urgeStats, refresh: refreshUrges } = useUrges();
  const { milestones, unlocks, refresh: refreshMilestones } = useMilestones();
  const { track } = useAnalytics();

  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      track('screen_viewed', { screen_name: 'progress' });
      refreshData();
    }, [])
  );

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUrges(), refreshMilestones()]);
    } finally {
      setRefreshing(false);
    }
  };

  const unlockedCount = unlocks.filter((u) => u.unlocked_at).length;
  const topMilestones = milestones.slice(0, 8);

  const handleViewAllMilestones = () => {
    router.push('/milestones');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} />}
      >
        <View style={styles.section}>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{urgeStats?.resistRate || 0}%</Text>
              <Text style={styles.statLabel}>Resist Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Goals</Text>

          <View style={styles.progressItem}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressName}>Journal Entries</Text>
              <Text style={styles.progressValue}>{Math.min(entries.length, 7)}/7</Text>
            </View>
            <ProgressBar percentage={Math.min((entries.length / 7) * 100, 100)} />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressName}>Urges Resisted</Text>
              <Text style={styles.progressValue}>
                {urgeStats?.totalUrges ? `${Math.round((urgeStats.resistRate / 100) * urgeStats.totalUrges)}/${urgeStats.totalUrges}` : '0/0'}
              </Text>
            </View>
            <ProgressBar percentage={urgeStats?.resistRate || 0} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <Text style={[styles.progressValue, { marginBottom: spacing[3] }]}>
            {unlockedCount} of {milestones.length} unlocked
          </Text>

          <View style={styles.milestonesGrid}>
            {topMilestones.map((milestone) => {
              const unlock = unlocks.find((u) => u.milestone_id === milestone.id);
              return (
                <MilestoneOrb
                  key={milestone.id}
                  icon={milestone.icon}
                  name={milestone.name}
                  tier={milestone.tier as any}
                  isUnlocked={unlock?.unlocked_at !== null && unlock?.unlocked_at !== undefined}
                  progress={unlock?.progress}
                  size={70}
                />
              );
            })}
          </View>

          <Button
            title="View All Milestones"
            onPress={handleViewAllMilestones}
            variant="secondary"
            size="lg"
            style={{ marginTop: spacing[4] }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
