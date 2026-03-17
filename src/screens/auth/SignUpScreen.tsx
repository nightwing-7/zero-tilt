import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

interface SignUpScreenProps {
  navigation: any;
}

const AppleLogoSVG: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <Path d="M17.05 13.5c-.1-1.8 1.52-2.68 1.59-2.74-1.1-1.6-2.8-1.8-3.4-1.82-1.4-.15-2.8.85-3.5.85-.8 0-2-.83-3.3-.83-1.7 0-3.2 1.1-4.1 2.8-1.7 3 1.2 7.4 2.4 8.8 1 1.3 2.1 2.8 3.6 2.75 1.4-.05 2-.9 3.8-.9 1.8 0 2.3.9 3.8.9 1.5-.05 2.5-1.35 3.5-2.65 1.1-1.5 1.6-3 1.6-3.05-.03-.02-3.1-1.2-3.2-4.8zm-2.9-8.7c.8-.95.8-2.2.8-2.2-.8.05-1.8.5-2.4 1.1-.5.6-1 1.5-.85 2.4.95.08 1.95-.35 2.45-1.3z" />
  </Svg>
);

const GoogleLogoSVG: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const ChevronRightSVG: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const goBack = () => {
    navigation.goBack();
  };

  const handleAppleSignUp = () => {
    // Apple OAuth flow
    console.log('Apple Sign Up pressed');
  };

  const handleGoogleSignUp = () => {
    // Google OAuth flow
    console.log('Google Sign Up pressed');
  };

  const handleSkipForNow = () => {
    navigation.navigate('Onboarding' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.6}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Title and Subtitle */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Become a Zero Tilt trader</Text>
          <Text style={styles.subtitle}>Join traders protecting their capital</Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Apple Button */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAppleSignUp}
            activeOpacity={0.8}
          >
            <AppleLogoSVG size={20} />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleGoogleSignUp}
            activeOpacity={0.8}
          >
            <GoogleLogoSVG size={20} />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Skip for Now Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipForNow}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
            <ChevronRightSVG size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
});

export default SignUpScreen;
