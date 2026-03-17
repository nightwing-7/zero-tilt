import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMilestones } from '../hooks/useMilestones';
import { useAnalytics } from '../hooks/useAnalytics';
import { MilestoneOrb } from '../components/MilestoneOrb';
import { Card } from '../components/ui/Card';
import { colors, spacing, typography } from '../constants/theme';

const MILESTONE_CATEGORIES = {
  Streaks: 'Streaks',
  Discipline: 'Discipline',
  Journaling: 'Journaling',
  Psychology: 'Psychology',
  Community: 'Community',
};

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
  categorySection: {
    marginBottom: spacing[8],
  },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[3],
  } as TextStyle,
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing[3],
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
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
    color: colors.dark.text.secondary,
  } as TextStyle,
});

export default function MilestonesScreen() {
  const { milestones, unlocks, loading, refresh } = useMilestones();
  const { track } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      track('screen_viewed', { screen_name: 'milestones' });
      refresh();
    }, [])
  );

  const unlockedCount = unlocks.filter((u) => u.unlocked_at).length;

  const groupedMilestones = Object.values(MILESTONE_CATEGORIES).reduce(
    (acc, category) => {
      acc[category] = milestones.filter((m) => m.category === category);
      return acc;
    },
    {} as Record<string, typeof milestones>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milestones</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Card style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{milestones.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {milestones.length > 0
                  ? Math.round((unlockedCount / milestones.length) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </Card>

        {Object.entries(groupedMilestones).map(([category, categoryMilestones]) => {
          if (categoryMilestones.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.grid}>
                {categoryMilestones.map((milestone) => {
                  const unlock = unlocks.find((u) => u.milestone_id === milestone.id);
                  return (
                    <MilestoneOrb
                      key={milestone.id}
                      icon={milestone.icon}
                      name={milestone.name}
                      tier={milestone.tier as any}
                      isUnlocked={unlock?.unlocked_at !== null && unlock?.unlocked_at !== undefined}
                      progress={unlock?.progress}
                      size={90}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
