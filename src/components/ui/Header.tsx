import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

const colors = {
  background: '#111113',
  textPrimary: '#ffffff',
  textMuted: '#a0a0a0',
  glass: 'rgba(255, 255, 255, 0.1)',
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header = React.forwardRef<View, HeaderProps>(
  ({ title, subtitle, onBack, rightAction }, ref) => {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 16,
      } as ViewStyle,
      headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      } as ViewStyle,
      leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
      } as ViewStyle,
      backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,
      backButtonText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
      } as TextStyle,
      titleContainer: {
        flex: 1,
      } as ViewStyle,
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        fontFamily: 'Inter',
      } as TextStyle,
      subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 4,
        fontFamily: 'Inter',
      } as TextStyle,
      rightSection: {
        marginLeft: 8,
      } as ViewStyle,
    });

    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            {onBack && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
        </View>
      </View>
    );
  }
);

Header.displayName = 'Header';

export default Header;
export { Header };
