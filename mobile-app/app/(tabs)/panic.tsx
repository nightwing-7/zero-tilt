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
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  loop,
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../hooks/useAnalytics';
import { logBreathingSession } from '../../services/breathing';
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
});

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function PanicScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();

  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [seconds, setSeconds] = useState(BREATHING_PATTERN.inhale);
  const [cycles, setCycles] = useState(0);
  const [calmBefore, setCalmBefore] = useState(5);
  const [totalDuration, setTotalDuration] = useState(0);

  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (!isRunning) {
      scale.value = 0.8;
      return;
    }

    const phaseMap = {
      inhale: { duration: BREATHING_PATTERN.inhale, nextPhase: 'hold' as BreathingPhase },
      hold: { duration: BREATHING_PATTERN.hold, nextPhase: 'exhale' as BreathingPhase },
      exhale: { duration: BREATHING_PATTERN.exhale, nextPhase: 'rest' as BreathingPhase },
      rest: { duration: 1, nextPhase: 'inhale' as BreathingPhase },
    };

    const animateScale = () => {
      if (phase === 'inhale') {
        scale.value = withTiming(1.2, {
          duration: (BREATHING_PATTERN.inhale - 1) * 1000,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (phase === 'exhale') {
        scale.value = withTiming(0.8, {
          duration: (BREATHING_PATTERN.exhale - 1) * 1000,
          easing: Easing.inOut(Easing.ease),
        });
      }
    };

    animateScale();

    const phaseConfig = phaseMap[phase];
    const timer = setTimeout(() => {
      if (phase === 'rest') {
        setCycles((prev) => prev + 1);
        if (cycles >= 4) {
          handleComplete();
          return;
        }
      }
      setPhase(phaseConfig.nextPhase);
      setSeconds(phaseConfig.nextPhase === 'inhale' ? BREATHING_PATTERN.inhale : phaseMap[phaseConfig.nextPhase].duration);
    }, phaseConfig.duration * 1000);

    const countdownInterval = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
      setTotalDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [isRunning, phase, cycles]);

  const handleStart = () => {
    if (!isRunning) {
      setCalmBefore(5);
      setCycles(0);
      setPhase('inhale');
      setSeconds(BREATHING_PATTERN.inhale);
      setTotalDuration(0);
      setIsRunning(true);
      track('breathing_session_started');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleComplete = async () => {
    setIsRunning(false);

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await logBreathingSession(user.id, {
        exercise_type: '4-7-8 Breathing',
        duration_seconds: totalDuration,
        calm_before: calmBefore,
        calm_after: 7,
      });

      track('breathing_session_completed', {
        duration_seconds: totalDuration,
        cycles: cycles,
      });

      Alert.alert(
        'Well Done!',
        'You completed a breathing session. Did it help?',
        [
          {
            text: 'Log Urge',
            onPress: () => router.push('/urge-log'),
          },
          {
            text: 'Back to Dashboard',
            onPress: () => router.push('/(tabs)/dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Error logging breathing session:', error);
      Alert.alert('Error', 'Failed to save breathing session');
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
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

      <View style={styles.content}>
        {!isRunning ? (
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
          </>
        ) : (
          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.circle, animatedStyle]}>
              <Text style={styles.timerText}>{seconds}</Text>
            </Animated.View>

            <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
            <Text style={styles.cycleText}>Cycle {cycles + 1} of 5</Text>
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        {!isRunning ? (
          <Button
            title="Start Exercise"
            onPress={handleStart}
            size="lg"
            style={styles.startButton}
          />
        ) : (
          <>
            <Button
              title="Stop"
              onPress={handleStop}
              variant="danger"
              size="lg"
              style={styles.startButton}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
