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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Phase = 0 | 1 | 2 | 3;

const INTENSITY_LEVELS = [
  { level: 1, label: 'Mild', color: '#3b82f6' },
  { level: 2, label: 'Moderate', color: '#8b5cf6' },
  { level: 3, label: 'Strong', color: '#f59e0b' },
  { level: 4, label: 'Intense', color: '#ef4444' },
  { level: 5, label: 'Maximum', color: '#dc2626' },
];

const TRIGGERS = [
  'FOMO',
  'Revenge Trading',
  'Loss Chasing',
  'Overconfidence',
  'Boredom',
  'Stress',
  'Market News',
  'Social Media',
  'Peer Pressure',
  'Other',
];

const LOCATIONS = ['Home', 'Office', 'Mobile', 'Other'];

const RESPONSES = [
  'Breathing',
  'Journaling',
  'Walking away',
  'Talking to someone',
  'Reviewing plan',
  'Playing a game',
  'Waiting it out',
  'Other',
];

interface UrgeLog {
  user_id: string;
  intensity: number;
  intensity_label: string;
  trigger_type: string;
  location: string;
  is_alone: boolean | null;
  responses: string[];
  resisted: boolean;
  breathing_completed: boolean;
  duration_seconds: number | null;
  notes: string | null;
  created_at?: string;
}

const UrgeTrackerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();

  // State
  const [step, setStep] = useState<Step>(0);
  const [intensity, setIntensity] = useState(3);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isAlone, setIsAlone] = useState<boolean | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>(0);
  const [countdown, setCountdown] = useState(4);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = new Animated.Value(1);

  // Box breathing animation
  useEffect(() => {
    if (step !== 4) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setPhase((p) => {
            const nextPhase = ((p + 1) % 4) as Phase;
            if (nextPhase === 0) {
              setBreathingCycles((c) => c + 1);
            }
            return nextPhase;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Animate breathing
  useEffect(() => {
    let toValue = 1;
    switch (phase) {
      case 0: // Inhale
        toValue = 1.1;
        break;
      case 1: // Hold
        toValue = 1.1;
        break;
      case 2: // Exhale
        toValue = 0.9;
        break;
      case 3: // Hold
        toValue = 0.9;
        break;
    }

    Animated.timing(scaleAnim, {
      toValue,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [phase]);

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 0:
        return 'Inhale';
      case 1:
        return 'Hold';
      case 2:
        return 'Exhale';
      case 3:
        return 'Hold';
    }
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 0:
        return colors.emerald[500];
      case 1:
      case 3:
        return colors.amber[500][500];
      case 2:
        return colors.blue[500][500];
      default:
        return colors.emerald[500];
    }
  };

  const toggleResponse = (response: string) => {
    const newSet = new Set(selectedResponses);
    if (newSet.has(response)) {
      newSet.delete(response);
    } else {
      newSet.add(response);
    }
    setSelectedResponses(newSet);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return true; // Intensity always has a value
      case 1:
        return selectedTrigger !== null;
      case 2:
        return location !== null && isAlone !== null;
      case 3:
        return true;
      case 4:
        return breathingCycles >= 2;
      case 5:
        return true;
      case 6:
        return selectedResponses.size > 0;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < 7) {
      setStep((step + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const urgeLog: UrgeLog = {
        user_id: user.id,
        intensity: intensity,
        intensity_label:
          INTENSITY_LEVELS.find((l) => l.level === intensity)?.label || 'Unknown',
        trigger_type: selectedTrigger || 'Unknown',
        location: location || 'Unknown',
        is_alone: isAlone,
        responses: Array.from(selectedResponses),
        resisted: true,
        breathing_completed: breathingCycles >= 2,
        duration_seconds: null,
        notes: null,
      };

      const { error } = await supabase.from('urge_logs').insert([urgeLog]);

      if (error) throw error;

      // Navigate back after successful submission
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting urge log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress dots
  const ProgressDots = () => (
    <View style={styles.progressDots}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
        <View
          key={dot}
          style={[
            styles.dot,
            dot === step && styles.dotActive,
            dot < step && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );

  // Checkbox component
  const Checkbox = ({ checked }: { checked: boolean }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
        stroke={checked ? colors.emerald[500] : colors.textDim}
        strokeWidth="2"
        fill={checked ? colors.emerald[500] : 'transparent'}
      />
      {checked && (
        <Path
          d="M8 12L11 15L16 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Step Counter */}
        <View style={styles.header}>
          <Text style={styles.stepCounter}>
            Step {step + 1} of 8
          </Text>
          <Text style={styles.stepTitle}>
            {step === 0 && 'How strong is the urge?'}
            {step === 1 && 'What triggered it?'}
            {step === 2 && 'Where are you right now?'}
            {step === 3 && 'You\'re winning'}
            {step === 4 && 'Take a breath'}
            {step === 5 && 'You are in control'}
            {step === 6 && 'What helped?'}
            {step === 7 && 'Review & Submit'}
          </Text>
        </View>

        {/* Progress Dots */}
        <ProgressDots />

        {/* Step Content */}
        <View style={styles.content}>
          {/* Step 0: Intensity */}
          {step === 0 && (
            <View>
              <Text style={styles.sectionLabel}>Rate the intensity</Text>
              <View style={styles.intensityContainer}>
                {INTENSITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.level}
                    style={[
                      styles.intensityButton,
                      intensity === level.level && styles.intensityButtonActive,
                    ]}
                    onPress={() => setIntensity(level.level as any)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        intensity === level.level &&
                          styles.intensityButtonTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.intensityScale}>
                <View
                  style={{
                    width: `${(intensity / 5) * 100}%`,
                    height: 4,
                    backgroundColor: INTENSITY_LEVELS[intensity - 1].color,
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          )}

          {/* Step 1: Trigger */}
          {step === 1 && (
            <View>
              <Text style={styles.sectionLabel}>Select the trigger</Text>
              <View style={styles.triggerGrid}>
                {TRIGGERS.map((trigger) => (
                  <TouchableOpacity
                    key={trigger}
                    style={[
                      styles.triggerButton,
                      selectedTrigger === trigger && styles.triggerButtonActive,
                    ]}
                    onPress={() => setSelectedTrigger(trigger)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.triggerButtonText,
                        selectedTrigger === trigger &&
                          styles.triggerButtonTextActive,
                      ]}
                    >
                      {trigger}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Context */}
          {step === 2 && (
            <View>
              <Text style={styles.sectionLabel}>Where are you?</Text>
              <View style={styles.buttonGroup}>
                {LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.contextButton,
                      location === loc && styles.contextButtonActive,
                    ]}
                    onPress={() => setLocation(loc)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.contextButtonText,
                        location === loc && styles.contextButtonTextActive,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
                Are you alone?
              </Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.contextButton,
                    isAlone === true && styles.contextButtonActive,
                  ]}
                  onPress={() => setIsAlone(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.contextButtonText,
                      isAlone === true && styles.contextButtonTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contextButton,
                    isAlone === false && styles.contextButtonActive,
                  ]}
                  onPress={() => setIsAlone(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.contextButtonText,
                      isAlone === false && styles.contextButtonTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Awareness */}
          {step === 3 && (
            <View style={styles.awarenessContainer}>
              <Svg width={80} height={80} viewBox="0 0 80 80">
                <Circle cx="40" cy="40" r="38" stroke={colors.emerald[500]} strokeWidth="2" fill="none" />
                <Path
                  d="M40 25V45L52 57"
                  stroke={colors.emerald[500]}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.awarenessTitle}>You're already winning</Text>
              <Text style={styles.awarenessText}>
                By recognizing this urge, you've taken the first step toward mastery. Your awareness is your superpower.
              </Text>
            </View>
          )}

          {/* Step 4: Breathing */}
          {step === 4 && (
            <View style={styles.breathingContainer}>
              <Text style={styles.breathingLabel}>Box Breathing Exercise</Text>
              <Text style={styles.breathingSubtext}>
                Complete 2 cycles (4 cycles of 4 seconds each)
              </Text>

              <Animated.View
                style={[
                  styles.breathingCircle,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.breathingCount}>{countdown}</Text>
              </Animated.View>

              <Text style={styles.breathingPhase}>{getPhaseLabel()}</Text>
              <Text style={styles.breathingCycles}>
                Cycles completed: {breathingCycles}/2
              </Text>

              {breathingCycles >= 2 && (
                <View style={styles.breathingComplete}>
                  <Text style={styles.breathingCompleteText}>✓ Complete</Text>
                </View>
              )}
            </View>
          )}

          {/* Step 5: Control */}
          {step === 5 && (
            <View style={styles.controlContainer}>
              <Svg width={80} height={80} viewBox="0 0 80 80">
                <Path
                  d="M40 15C26.2 15 15 26.2 15 40C15 53.8 26.2 65 40 65C53.8 65 65 53.8 65 40"
                  stroke={colors.emerald[500]}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M40 30L45 40L40 50"
                  stroke={colors.emerald[500]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.controlTitle}>You are in control</Text>
              <Text style={styles.controlText}>
                Your emotions don't control your actions. You have the power to choose your next move.
              </Text>
            </View>
          )}

          {/* Step 6: Response */}
          {step === 6 && (
            <View>
              <Text style={styles.sectionLabel}>What helped you?</Text>
              <View style={styles.responseGrid}>
                {RESPONSES.map((response) => {
                  const isSelected = selectedResponses.has(response);
                  return (
                    <TouchableOpacity
                      key={response}
                      style={[
                        styles.responseButton,
                        isSelected && styles.responseButtonActive,
                      ]}
                      onPress={() => toggleResponse(response)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.responseCheckbox}>
                        <Checkbox checked={isSelected} />
                      </View>
                      <Text
                        style={[
                          styles.responseButtonText,
                          isSelected && styles.responseButtonTextActive,
                        ]}
                      >
                        {response}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 7: Summary */}
          {step === 7 && (
            <View>
              <Text style={styles.summaryTitle}>Review Your Urge Log</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Intensity</Text>
                  <Text style={styles.summaryValue}>
                    {INTENSITY_LEVELS.find((l) => l.level === intensity)?.label}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Trigger</Text>
                  <Text style={styles.summaryValue}>{selectedTrigger}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Location</Text>
                  <Text style={styles.summaryValue}>{location}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Alone</Text>
                  <Text style={styles.summaryValue}>
                    {isAlone === true ? 'Yes' : isAlone === false ? 'No' : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Breathing Cycles</Text>
                  <Text style={styles.summaryValue}>{breathingCycles}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Responses</Text>
                  <Text style={styles.summaryValue}>
                    {selectedResponses.size > 0
                      ? Array.from(selectedResponses).join(', ')
                      : 'None selected'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, step === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={step === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          {step < 7 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                !canProceed() && styles.navButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, styles.navButtonPrimaryText]}>
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, styles.navButtonPrimaryText]}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: spacing.lg }} />
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
    paddingTop: spacing.lg,
  } as ViewStyle,

  // Header
  header: {
    marginBottom: spacing.xxl,
  } as ViewStyle,
  stepCounter: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.sm,
  } as TextStyle,
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,

  // Progress Dots
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  } as ViewStyle,
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textDim,
  } as ViewStyle,
  dotActive: {
    backgroundColor: colors.emerald[500],
    width: 12,
    height: 12,
    borderRadius: 6,
  } as ViewStyle,
  dotCompleted: {
    backgroundColor: colors.emerald[500],
    opacity: 0.6,
  } as ViewStyle,

  // Content
  content: {
    flex: 1,
    marginBottom: spacing.xxl,
  } as ViewStyle,
  sectionLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.lg,
  } as TextStyle,

  // Intensity
  intensityContainer: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.xl,
  } as ViewStyle,
  intensityButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  intensityButtonActive: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  } as ViewStyle,
  intensityButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,
  intensityButtonTextActive: {
    color: colors.background,
  } as TextStyle,
  intensityScale: {
    height: 8,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  } as ViewStyle,

  // Trigger
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  } as ViewStyle,
  triggerButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    width: '48%',
    alignItems: 'center',
  } as ViewStyle,
  triggerButtonActive: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  } as ViewStyle,
  triggerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    textAlign: 'center',
  } as TextStyle,
  triggerButtonTextActive: {
    color: colors.background,
  } as TextStyle,

  // Context
  buttonGroup: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  } as ViewStyle,
  contextButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  contextButtonActive: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  } as ViewStyle,
  contextButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,
  contextButtonTextActive: {
    color: colors.background,
  } as TextStyle,

  // Awareness
  awarenessContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  } as ViewStyle,
  awarenessTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginVertical: spacing.lg,
  } as TextStyle,
  awarenessText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
  } as TextStyle,

  // Breathing
  breathingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  } as ViewStyle,
  breathingLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.sm,
  } as TextStyle,
  breathingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.xxl,
  } as TextStyle,
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.emerald[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  } as ViewStyle,
  breathingCount: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.background,
    fontFamily: 'Inter',
  } as TextStyle,
  breathingPhase: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.md,
  } as TextStyle,
  breathingCycles: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  } as TextStyle,
  breathingComplete: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: `${colors.emerald[500]}20`,
    borderColor: colors.emerald[500],
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  breathingCompleteText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.emerald[500],
    fontFamily: 'Inter',
  } as TextStyle,

  // Control
  controlContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  } as ViewStyle,
  controlTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginVertical: spacing.lg,
  } as TextStyle,
  controlText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
  } as TextStyle,

  // Response
  responseGrid: {
    gap: spacing.md,
  } as ViewStyle,
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  } as ViewStyle,
  responseButtonActive: {
    backgroundColor: `${colors.emerald[500]}20`,
    borderColor: colors.emerald[500],
  } as ViewStyle,
  responseCheckbox: {
    width: 24,
  } as ViewStyle,
  responseButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,
  responseButtonTextActive: {
    color: colors.emerald[500],
  } as TextStyle,

  // Summary
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.lg,
  } as TextStyle,
  summaryCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  } as ViewStyle,
  summaryItem: {
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  } as ViewStyle,
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.xs,
  } as TextStyle,
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.emerald[500],
    fontFamily: 'Inter',
  } as TextStyle,

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  } as ViewStyle,
  navButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  navButtonPrimary: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  } as ViewStyle,
  navButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  navButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  } as TextStyle,
  navButtonPrimaryText: {
    color: colors.background,
  } as TextStyle,
});

export default UrgeTrackerScreen;
export { UrgeTrackerScreen };
