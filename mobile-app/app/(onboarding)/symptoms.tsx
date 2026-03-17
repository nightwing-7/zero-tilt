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
} from 'react-native';
import { useRoute, useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { TILT_TRIGGERS } from '../../constants/config';
import { Button } from '../../components/ui/Button';

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
    width: '60%',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  symptomButton: {
    width: '48%',
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  symptomButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  symptomText: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  symptomTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
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

export default function SymptomsScreen() {
  const route = useRoute();
  const router = useRouter();

  const params = useMemo(() => ({
    traderName: route.params?.traderName as string || '',
    age: route.params?.age as string || '',
    tradingStyles: JSON.parse((route.params?.tradingStyles as string) || '[]'),
    markets: JSON.parse((route.params?.markets as string) || '[]'),
    experienceLevel: route.params?.experienceLevel as string || '',
    tiltRiskLevel: parseInt(route.params?.tiltRiskLevel as string || '0'),
  }), [route.params]);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleNext = () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Error', 'Please select at least one tilt symptom');
      return;
    }

    router.push({
      pathname: '/(onboarding)/goals',
      params: {
        ...params,
        tiltSymptoms: JSON.stringify(selectedSymptoms),
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

        <Text style={styles.title}>Your Tilt Symptoms</Text>
        <Text style={styles.subtitle}>Select the behaviors you experience when tilted</Text>

        <View style={styles.grid}>
          {TILT_TRIGGERS.map((trigger) => (
            <TouchableOpacity
              key={trigger}
              style={[
                styles.symptomButton,
                selectedSymptoms.includes(trigger) && styles.symptomButtonActive,
              ]}
              onPress={() => handleSymptomToggle(trigger)}
            >
              <Text
                style={[
                  styles.symptomText,
                  selectedSymptoms.includes(trigger) && styles.symptomTextActive,
                ]}
              >
                {trigger}
              </Text>
            </TouchableOpacity>
          ))}
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
