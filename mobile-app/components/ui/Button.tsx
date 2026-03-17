import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  size?: Size;
  style?: ViewStyle;
  testID?: string;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
  primary: {
    backgroundColor: colors.accent.teal,
  },
  primaryText: {
    color: colors.dark.bg.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent.teal,
  },
  secondaryText: {
    color: colors.accent.teal,
  },
  danger: {
    backgroundColor: colors.accent.red,
  },
  dangerText: {
    color: '#fff',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.accent.teal,
  },
  disabled: {
    opacity: 0.5,
  },
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 52,
  },
  smText: {
    fontSize: typography.sizes.sm,
  },
  mdText: {
    fontSize: typography.sizes.base,
  },
  lgText: {
    fontSize: typography.sizes.lg,
  },
});

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  style,
  testID,
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[size as keyof typeof styles],
    styles[variant as keyof typeof styles],
    disabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    styles[`${variant}Text` as keyof typeof styles],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary'
              ? colors.dark.bg.primary
              : variant === 'danger'
                ? '#fff'
                : colors.accent.teal
          }
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
