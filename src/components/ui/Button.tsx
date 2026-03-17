import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

const colors = {
  emerald: '#10b981',
  emeraldDark: '#059669',
  red: '#ef4444',
  textPrimary: '#ffffff',
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      title,
      onPress,
      variant = 'primary',
      disabled = false,
      loading = false,
      style,
      icon,
    },
    ref
  ) => {
    const getBackgroundColor = () => {
      switch (variant) {
        case 'primary':
          return colors.emerald;
        case 'danger':
          return colors.red;
        case 'outline':
          return 'transparent';
        case 'ghost':
          return 'transparent';
        default:
          return colors.emerald;
      }
    };

    const getBorderStyle = () => {
      if (variant === 'outline') {
        return {
          borderWidth: 1.5,
          borderColor: colors.emerald,
        };
      }
      return {};
    };

    const styles = StyleSheet.create({
      button: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: getBackgroundColor(),
        ...getBorderStyle(),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        opacity: disabled ? 0.5 : 1,
      },
      text: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter',
      } as TextStyle,
    });

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.button, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {icon && !loading && icon}
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
