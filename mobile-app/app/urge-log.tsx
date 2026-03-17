import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { logUrge } from '../services/urges';
import { TILT_TRIGGERS, COPING_STRATEGIES, URGE_OUTCOMES } from '../constants/config';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { formatIntensity, getIntensityLabel } from '../utils/formatting';

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
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  intensityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  intensityValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.accent.teal,
  } as TextStyle,
  intensityLabel: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  slider: {
    width: '100%',
    height: 40,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  triggerButton: {
    width: '48%',
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  triggerButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  triggerText: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  triggerTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  input: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
    minHeight: 80,
  } as TextStyle,
  copingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  copingButton: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },
  copingButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  copingText: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  copingTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  outcomeGrid: {
    gap: spacing[2],
  },
  outcomeButton: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  outcomeButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  outcomeText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  outcomeTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  buttons: {
    gap: spacing[3],
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  saveButton: {
    width: '100%',
  },
});

export default function UrgeLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [intensity, setIntensity] = useState(5);
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [triggerDetails, setTriggerDetails] = useState('');
  const [selectedCopingStrategies, setSelectedCopingStrategies] = useState<string[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopingToggle = (strategy: string) => {
    setSelectedCopingStrategies((prev) =>
      prev.includes(strategy) ? prev.filter((s) => s !== strategy) : [...prev, strategy]
    );
  };

  const handleSave = async () => {
    if (!selectedTrigger || !triggerDetails || !selectedOutcome) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);

    try {
      await logUrge(user.id, {
        intensity: Math.round(intensity),
        trigger_type: selectedTrigger,
        trigger_details: triggerDetails,
        coping_strategies: selectedCopingStrategies,
        outcome: selectedOutcome as any,
        notes,
      });

      track('urge_logged', {
        intensity: Math.round(intensity),
        trigger_type: selectedTrigger,
        outcome: selectedOutcome,
      });

      Alert.alert('Success', 'Urge logged successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log urge. Please try again.');
      console.error('Log urge error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Urge</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Intensity (1-10)</Text>
            <View style={styles.intensityDisplay}>
              <Text style={styles.intensityValue}>
                {formatIntensity(Math.round(intensity))}
              </Text>
              <View>
                <Text style={styles.intensityValue}>{Math.round(intensity)}</Text>
                <Text style={styles.intensityLabel}>{getIntensityLabel(Math.round(intensity))}</Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor={colors.accent.teal}
              maximumTrackTintColor={colors.dark.tertiary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Trigger Type</Text>
            <View style={styles.triggerGrid}>
              {TILT_TRIGGERS.map((trigger) => (
                <TouchableOpacity
                  key={trigger}
                  style={[
                    styles.triggerButton,
                    selectedTrigger === trigger && styles.triggerButtonActive,
                  ]}
                  onPress={() => setSelectedTrigger(trigger)}
                >
                  <Text
                    style={[
                      styles.triggerText,
                      selectedTrigger === trigger && styles.triggerTextActive,
                    ]}
                  >
                    {trigger}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What Triggered It?</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe what triggered this urge..."
              placeholderTextColor={colors.dark.text.muted}
              value={triggerDetails}
              onChangeText={setTriggerDetails}
              multiline
              editable={!loading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Coping Strategies Used</Text>
            <View style={styles.copingGrid}>
              {COPING_STRATEGIES.map((strategy) => (
                <TouchableOpacity
                  key={strategy}
                  style={[
                    styles.copingButton,
                    selectedCopingStrategies.includes(strategy) && styles.copingButtonActive,
                  ]}
                  onPress={() => handleCopingToggle(strategy)}
                >
                  <Text
                    style={[
                      styles.copingText,
                      selectedCopingStrategies.includes(strategy) && styles.copingTextActive,
                    ]}
                  >
                    {strategy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Outcome</Text>
            <View style={styles.outcomeGrid}>
              {URGE_OUTCOMES.map((outcome) => (
                <TouchableOpacity
                  key={outcome}
                  style={[
                    styles.outcomeButton,
                    selectedOutcome === outcome && styles.outcomeButtonActive,
                  ]}
                  onPress={() => setSelectedOutcome(outcome)}
                >
                  <Text
                    style={[
                      styles.outcomeText,
                      selectedOutcome === outcome && styles.outcomeTextActive,
                    ]}
                  >
                    {outcome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Additional Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Any other thoughts or feelings..."
              placeholderTextColor={colors.dark.text.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              editable={!loading}
            />
          </View>

          <View style={styles.buttons}>
            <Button
              title="Log Urge"
              onPress={handleSave}
              loading={loading}
              size="lg"
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
