import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography, spacing } from '../constants/theme';

interface StreakRingProps {
  days: number;
  maxDays?: number;
  size?: number;
  strokeWidth?: number;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    textAlign: 'center',
  },
  days: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700',
    color: colors.accent.teal,
  } as TextStyle,
  label: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.tertiary,
    marginTop: spacing[1],
  } as TextStyle,
});

export function StreakRing({
  days,
  maxDays = 365,
  size = 180,
  strokeWidth = 8,
}: StreakRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useSharedValue(circumference);

  useEffect(() => {
    const progress = Math.min(days / maxDays, 1);
    const offset = circumference - progress * circumference;

    strokeDashoffset.value = withTiming(offset, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [days, circumference]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.dark.tertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Animated.Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent.teal}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedStyle.strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View
        style={[
          styles.text,
          {
            width: size,
            height: size,
            justifyContent: 'center',
          },
        ]}
      >
        <Text style={styles.days}>{days}</Text>
        <Text style={styles.label}>days</Text>
      </View>
    </View>
  );
}
