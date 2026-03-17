import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

const colors = {
  emerald: '#10b981',
  red: '#ef4444',
  textPrimary: '#ffffff',
  textMuted: '#a0a0a0',
};

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  style?: ViewStyle;
}

const StatCard = React.forwardRef<View, StatCardProps>(
  ({ icon, label, value, highlight = false, style }, ref) => {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: highlight
          ? colors.red
          : 'rgba(255, 255, 255, 0.06)',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,
      icon: {
        fontSize: 32,
        marginBottom: 8,
      } as TextStyle,
      label: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 6,
        fontFamily: 'Inter',
        fontWeight: '500',
      } as TextStyle,
      value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: highlight ? colors.red : colors.emerald,
        fontFamily: 'Inter',
      } as TextStyle,
    });

    return (
      <View ref={ref} style={[styles.container, style]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
export { StatCard };
