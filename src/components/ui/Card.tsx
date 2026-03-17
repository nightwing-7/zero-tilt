import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card = React.forwardRef<View, CardProps>(
  ({ children, style, onPress }, ref) => {
    const styles = StyleSheet.create({
      card: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        padding: 16,
      },
    });

    const cardStyle = [styles.card, style];

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={cardStyle}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View ref={ref} style={cardStyle}>
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export { Card };
