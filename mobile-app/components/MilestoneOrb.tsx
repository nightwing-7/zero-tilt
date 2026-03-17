import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors, typography, spacing } from '../constants/theme';

interface MilestoneOrbProps {
  icon: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  isUnlocked: boolean;
  progress?: number;
  size?: number;
}

const tierColors: Record<string, string> = {
  bronze: '#b87d3b',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    borderWidth: 3,
    borderColor: colors.dark.border,
    borderRadius: 9999,
  },
  icon: {
    fontSize: typography.sizes['3xl'],
    textAlign: 'center',
  } as TextStyle,
  lockedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: typography.sizes.lg,
    color: colors.dark.text.muted,
  } as TextStyle,
  name: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    textAlign: 'center',
    maxWidth: 80,
  } as TextStyle,
  progressText: {
    fontSize: typography.sizes['2xs'],
    color: colors.dark.text.tertiary,
    marginTop: spacing[1],
  } as TextStyle,
});

export function MilestoneOrb({
  icon,
  name,
  tier,
  isUnlocked,
  progress = 0,
  size = 80,
}: MilestoneOrbProps) {
  const tierColor = tierColors[tier];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            backgroundColor: isUnlocked
              ? tierColor
              : colors.dark.tertiary,
            borderColor: isUnlocked
              ? tierColor
              : colors.dark.border,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>

        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{name}</Text>

      {!isUnlocked && progress > 0 && (
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
}
