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
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useStreak } from '../../hooks/useStreak';
import { useUrges } from '../../hooks/useUrges';
import { useMilestones } from '../../hooks/useMilestones';
import { usePanic } from '../../hooks/usePanic';
import { useDailyPledge } from '../../hooks/useDailyPledge';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StreakTracker } from '../../components/StreakTracker';
import { JournalCard } from '../../components/JournalCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../constants/theme';
import { getRankFromPoints } from '../../utils/formatting';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  streakSection: {
    marginBottom: spacing[6],
  },
  pledgeCard: {
    marginBottom: spacing[6],
  },
  pledgeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  pledgeStatusText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  pledgeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 12,
    backgroundColor: colors.accent.teal,
  },
  pledgeBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  pledgeButton: {
    width: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  actionButton: {
    flex: 1,
  },
  urgeLimitText: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.tertiary,
    marginTop: spacing[1],
    textAlign: 'center',
  } as TextStyle,
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[3],
  } as TextStyle,
  urgeyList: {
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  urgeItem: {
    backgroundColor: colors.dark.secondary,
    borderRadius: 8,
    padding: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.amber,
  },
  urgeIntensity: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    marginBottom: spacing[1],
  } as TextStyle,
  urgeTrigger: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.primary,
    fontWeight: '500',
  } as TextStyle,
  panicButton: {
    backgroundColor: colors.accent.red,
    paddingVertical: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[4],
    marginHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicText: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: '#fff',
  } as TextStyle,
  milestoneModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  milestoneCard: {
    backgroundColor: colors.dark.bg.primary,
    borderRadius: 16,
    padding: spacing[6],
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent.teal,
  } as ViewStyle,
  milestoneIcon: {
    fontSize: 80,
    marginBottom: spacing[4],
  } as TextStyle,
  milestoneName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  } as TextStyle,
  milestoneDescription: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginBottom: spacing[4],
    textAlign: 'center',
  } as TextStyle,
  milestonePoints: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.accent.teal,
    marginBottom: spacing[4],
  } as TextStyle,
});

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentStreak, bestStreak, refresh: refreshStreak, isCheckedInToday, checkIn } = useStreak();
  const { todaysUrges, refresh: refreshUrges } = useUrges();
  const { newlyUnlocked, clearNewlyUnlocked, checkMilestones } = useMilestones();
  const { track } = useAnalytics();
  const { hasPledged } = useDailyPledge();

  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      track('screen_viewed', { screen_name: 'dashboard' });
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      await Promise.all([refreshStreak(), refreshUrges()]);

      if (hasPledged && !isCheckedInToday && user?.id) {
        try {
          await checkIn();
        } catch (error) {
          console.error('Error checking in:', error);
        }
      }

      if (user?.id) {
        try {
          await checkMilestones();
        } catch (error) {
          console.error('Error checking milestones:', error);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePanic = () => {
    router.push('/(tabs)/panic');
  };

  const handlePledge = () => {
    router.push('/daily-pledge');
  };

  const handleJournal = () => {
    router.push('/journal-entry');
  };

  const handleUrge = () => {
    router.push('/urge-log');
  };

  const handleBreathe = () => {
    router.push('/(tabs)/panic');
  };

  const handleCloseMilestoneModal = () => {
    clearNewlyUnlocked();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.streakSection}>
          <StreakTracker
            currentDays={currentStreak}
            bestStreak={bestStreak}
            rank={getRankFromPoints(currentStreak * 10)}
          />
        </View>

        <Card style={styles.pledgeCard}>
          <View style={styles.pledgeStatus}>
            <Text style={styles.pledgeStatusText}>Daily Pledge</Text>
            {hasPledged && (
              <View style={styles.pledgeBadge}>
                <Text style={styles.pledgeBadgeText}>SIGNED</Text>
              </View>
            )}
          </View>
          <Button
            title={hasPledged ? 'View Pledge' : 'Sign Pledge'}
            onPress={handlePledge}
            variant={hasPledged ? 'secondary' : 'primary'}
          />
        </Card>

        <View style={styles.quickActions}>
          <Button
            title="Journal"
            onPress={handleJournal}
            variant="secondary"
            size="md"
            style={styles.actionButton}
          />
          <Button
            title="Log Urge"
            onPress={handleUrge}
            variant="secondary"
            size="md"
            style={styles.actionButton}
          />
          <Button
            title="Breathe"
            onPress={handleBreathe}
            variant="secondary"
            size="md"
            style={styles.actionButton}
          />
        </View>

        {todaysUrges && todaysUrges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Urges</Text>
            <View style={styles.urgeyList}>
              {todaysUrges.slice(0, 3).map((urge) => (
                <View key={urge.id} style={styles.urgeItem}>
                  <Text style={styles.urgeIntensity}>
                    Intensity: {urge.intensity}/10 • {urge.trigger_type}
                  </Text>
                  <Text style={styles.urgeTrigger}>{urge.trigger_details}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
          <Text style={styles.panicText}>🚨 PANIC BUTTON</Text>
        </TouchableOpacity>
      </ScrollView>

      {newlyUnlocked && newlyUnlocked.length > 0 && (
        <Modal
          visible={newlyUnlocked.length > 0}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseMilestoneModal}
        >
          <View style={styles.milestoneModal}>
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneIcon}>{newlyUnlocked[0].icon || '🏆'}</Text>
              <Text style={styles.milestoneName}>{newlyUnlocked[0].name}</Text>
              <Text style={styles.milestoneDescription}>{newlyUnlocked[0].description}</Text>
              <Text style={styles.milestonePoints}>+{newlyUnlocked[0].points} Points</Text>
              <Button
                title="Awesome!"
                onPress={handleCloseMilestoneModal}
                size="md"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
