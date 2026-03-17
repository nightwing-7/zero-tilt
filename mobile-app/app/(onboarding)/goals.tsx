import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

const DEFAULT_GOALS = [
  'Follow trading plan',
  'Proper risk management',
  'No revenge trades',
  'Journal every trade',
  'Stick to stop losses',
  'Max trades per day',
];

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
    width: '80%',
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
  goalsList: {
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  goalButton: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  goalButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  goalText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  goalTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  customGoalSection: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  customInput: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
    marginBottom: spacing[2],
  } as TextStyle,
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});

export default function GoalsScreen() {
  const route = useRoute();
  const router = useRouter();

  const params = useMemo(() => ({
    traderName: route.params?.traderName as string || '',
    age: route.params?.age as string || '',
    tradingStyles: JSON.parse((route.params?.tradingStyles as string) || '[]'),
    markets: JSON.parse((route.params?.markets as string) || '[]'),
    experienceLevel: route.params?.experienceLevel as string || '',
    tiltRiskLevel: parseInt(route.params?.tiltRiskLevel as string || '0'),
    tiltSymptoms: JSON.parse((route.params?.tiltSymptoms as string) || '[]'),
  }), [route.params]);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim()) {
      const allGoals = [...selectedGoals, customGoal.trim()];
      setSelectedGoals(allGoals);
      setCustomGoal('');
    }
  };

  const handleNext = () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Error', 'Please select at least one goal');
      return;
    }

    router.push({
      pathname: '/(onboarding)/commitment',
      params: {
        ...params,
        goals: JSON.stringify(selectedGoals),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Your Trading Goals</Text>
        <Text style={styles.subtitle}>Select goals to focus on this month</Text>

        <View style={styles.goalsList}>
          {DEFAULT_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalButton,
                selectedGoals.includes(goal) && styles.goalButtonActive,
              ]}
              onPress={() => handleGoalToggle(goal)}
            >
              <Text
                style={[
                  styles.goalText,
                  selectedGoals.includes(goal) && styles.goalTextActive,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customGoalSection}>
          <Text style={styles.sectionLabel}>Add Custom Goal</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <TextInput
              style={[styles.customInput, { flex: 1 }]}
              placeholder="Your custom goal..."
              placeholderTextColor={colors.dark.text.muted}
              value={customGoal}
              onChangeText={setCustomGoal}
            />
            <Button
              title="Add"
              onPress={handleAddCustomGoal}
              variant="secondary"
              size="md"
            />
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            size="lg"
            style={styles.backButton}
          />
          <Button
            title="Next"
            onPress={handleNext}
            size="lg"
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
