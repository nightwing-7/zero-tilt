import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

const colors = {
  emerald: '#10b981',
};

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

const ProgressBar = React.forwardRef<View, ProgressBarProps>(
  ({ progress, color = colors.emerald, height = 5, style }, ref) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [progress, animatedValue]);

    const styles = StyleSheet.create({
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        height,
        borderRadius: height / 2,
        overflow: 'hidden',
        width: '100%',
      } as ViewStyle,
      fill: {
        backgroundColor: color,
        height: '100%',
        borderRadius: height / 2,
      } as ViewStyle,
    });

    const fillWidth = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <View ref={ref} style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: fillWidth,
            },
          ]}
        />
      </View>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
export { ProgressBar };
