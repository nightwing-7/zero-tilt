import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const heartbeatOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const navigateToSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ZERO TILT</Text>
        </View>

        {/* Animated Heartbeat Line */}
        <Animated.View style={[styles.heartbeatContainer, { opacity: heartbeatOpacity }]}>
          <Svg width={width * 0.6} height={40} viewBox={`0 0 ${width * 0.6} 40`}>
            <Path
              d={`M 10 20 L 20 20 L 25 5 L 30 35 L 35 15 L 40 25 L 50 20 L ${width * 0.6 - 10} 20`}
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* Tagline */}
        <Text style={styles.tagline}>Master your trading psychology</Text>

        {/* Bottom section with buttons and text */}
        <View style={styles.bottomSection}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={navigateToSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={navigateToSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>

          {/* Bottom Text */}
          <Text style={styles.bottomText}>Join 50,000+ disciplined traders</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: 12,
    fontFamily: 'System',
  },
  heartbeatContainer: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
    color: '#f5f5f5',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 60,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    marginBottom: 32,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#666666',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  bottomText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
});

export default WelcomeScreen;
