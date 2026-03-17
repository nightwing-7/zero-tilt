import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { StreakRing } from './StreakRing';
import { Card } from './ui/Card';
import { colors, spacing, typography } from '../constants/theme';
import { formatDate } from '../utils/dates';

interface StreakTrackerProps {
  currentDays: number;
  bestStreak: number;
  startDate?: string;
  rank?: string;
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  content: {
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
  },
  ringContainer: {
    marginBottom: spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing[4],
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.tertiary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
  } as TextStyle,
  infoValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.accent.teal,
  } as TextStyle,
  rankBadge: {
    position: 'absolute',
    top: -10,
    right: spacing[4],
    backgroundColor: colors.accent.amber,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
  },
  rankText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.dark.bg.primary,
    textTransform: 'uppercase',
  } as TextStyle,
});

export function StreakTracker({
  currentDays,
  bestStreak,
  startDate,
  rank = 'Rookie',
}: StreakTrackerProps) {
  return (
    <Card style={styles.card}>
      {rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <StreakRing days={currentDays} maxDays={Math.max(bestStreak, currentDays || 365)} />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Best Streak</Text>
            <Text style={styles.infoValue}>{bestStreak}</Text>
          </View>

          {startDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>{formatDate(startDate)}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}
