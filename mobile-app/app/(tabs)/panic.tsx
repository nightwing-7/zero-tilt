import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { usePanic } from '../../hooks/usePanic';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../constants/theme';
import { BREATHING_PATTERN } from '../../constants/config';

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  phaseText: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.dark.text.primary,
    marginBottom: spacing[3],
  } as TextStyle,
  timerText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
  } as TextStyle,
  cycleText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginTop: spacing[3],
  } as TextStyle,
  instructionsBox: {
    backgroundColor: colors.dark.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  instructionsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
  } as TextStyle,
  instructionsText: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    lineHeight: 20,
  } as TextStyle,
  buttons: {
    gap: spacing[3],
    width: '100%',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  startButton: {
    width: '100%',
  },
  calmSlider: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  } as ViewStyle,
  calmLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  calmValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.accent.teal,
    marginBottom: spacing[2],
  } as TextStyle,
  calmButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.accent.teal,
    borderRadius: 8,
    marginRight: spacing[2],
  } as ViewStyle,
  calmButtonActive: {
    backgroundColor: colors.dark.border,
  } as ViewStyle,
  calmButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.dark.bg.primary,
  } as TextStyle,
});

export default function PanicScreen() {
  const router = useRouter();
  const {
    isBreathing,
    currentPhase,
    cycleCount,
    totalCycles,
    secondsRemaining,
    calmBefore,
    calmAfter,
    startBreathing,
    stopBreathing,
    completeBreathing,
    setCalmAfter,
    logUrge,
  } = usePanic();

  const [showCalmBeforeInput, setShowCalmBeforeInput] = useState(false);
  const [selectedCalmBefore, setSelectedCalmBefore] = useState(5);
  const [showCalmAfterInput, setShowCalmAfterInput] = useState(false);
  const [selectedCalmAfter, setSelectedCalmAfter] = useState(5);

  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (!isBreathing) {
      scale.value = 0.8;
      return;
    }

    const animateScale = () => {
      if (currentPhase === 'inhale') {
        scale.value = withTiming(1.2, {
          duration: (BREATHING_PATTERN.inhale - 1) * 1000,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (currentPhase === 'exhale') {
        scale.value = withTiming(0.8, {
          duration: (BREATHING_PATTERN.exhale - 1) * 1000,
          easing: Easing.inOut(Easing.ease),
        });
      }
    };

    animateScale();
  }, [isBreathing, currentPhase]);

  const handleStartBreathing = async () => {
    await startBreathing(selectedCalmBefore);
    setShowCalmBeforeInput(false);
  };

  const handleCompleteBreathing = async () => {
    setCalmAfter(selectedCalmAfter);
    await completeBreathing();
    setShowCalmAfterInput(true);
  };

  const handleAfterBreathing = () => {
    Alert.alert(
      'Well Done!',
      'You completed a breathing session. What would you like to do?',
      [
        {
          text: 'Log Urge',
          onPress: async () => {
            await logUrge(5, 'breathing', 'Logged after breathing exercise');
            router.push('/urge-log');
          },
        },
        {
          text: 'Back to Dashboard',
          onPress: () => router.push('/(tabs)/dashboard'),
        },
      ]
    );
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'rest':
        return 'Rest';
      default:
        return '';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Breathing Exercise</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!isBreathing && !showCalmAfterInput ? (
          <>
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>4-7-8 Breathing</Text>
              <Text style={styles.instructionsText}>
                A proven breathing technique to calm your nervous system and regain control.
                {'\n\n'}
                1. Breathe in for 4 seconds{'\n'}
                2. Hold for 7 seconds{'\n'}
                3. Breathe out for 8 seconds{'\n'}
                4. Repeat 5 times
              </Text>
            </View>

            <View style={styles.calmSlider}>
              <Text style={styles.calmLabel}>How calm are you now? (1-10)</Text>
              <Text style={styles.calmValue}>{selectedCalmBefore}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.calmButton,
                      selectedCalmBefore === num && styles.calmButtonActive,
                    ]}
                    onPress={() => setSelectedCalmBefore(num)}
                  >
                    <Text style={styles.calmButtonText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : isBreathing ? (
          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.circle, animatedStyle]}>
              <Text style={styles.timerText}>{secondsRemaining}</Text>
            </Animated.View>

            <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
            <Text style={styles.cycleText}>Cycle {cycleCount + 1} of {totalCycles}</Text>
          </View>
        ) : showCalmAfterInput ? (
          <View style={styles.calmSlider}>
            <Text style={styles.calmLabel}>How calm are you now? (1-10)</Text>
            <Text style={styles.calmValue}>{selectedCalmAfter}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.calmButton,
                    selectedCalmAfter === num && styles.calmButtonActive,
                  ]}
                  onPress={() => setSelectedCalmAfter(num)}
                >
                  <Text style={styles.calmButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.buttons}>
        {!isBreathing && !showCalmAfterInput ? (
          <Button
            title="Start Exercise"
            onPress={handleStartBreathing}
            size="lg"
            style={styles.startButton}
          />
        ) : isBreathing ? (
          <>
            <Button
              title="Complete"
              onPress={handleCompleteBreathing}
              size="lg"
              style={styles.startButton}
            />
            <Button
              title="Stop"
              onPress={stopBreathing}
              variant="secondary"
              size="lg"
              style={styles.startButton}
            />
          </>
        ) : showCalmAfterInput ? (
          <Button
            title="Finish"
            onPress={handleAfterBreathing}
            size="lg"
            style={styles.startButton}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
