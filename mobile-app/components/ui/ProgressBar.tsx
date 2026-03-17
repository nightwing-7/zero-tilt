import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.dark.tertiary,
    borderRadius: borderRadius.full,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent.teal,
  },
});

export function ProgressBar({
  percentage,
  height = 8,
  color = colors.accent.teal,
  backgroundColor = colors.dark.tertiary,
  animated = true,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(percentage, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = percentage;
    }
  }, [percentage, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min(progress.value, 100)}%`,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
