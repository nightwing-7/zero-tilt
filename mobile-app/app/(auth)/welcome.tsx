import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ViewStyle, TextStyle } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing[8],
    textAlign: 'center',
  } as TextStyle,
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.dark.text.secondary,
    marginBottom: spacing[12],
    textAlign: 'center',
  } as TextStyle,
  buttons: {
    width: '100%',
    gap: spacing[3],
  },
  signupButton: {
    width: '100%',
  },
  loginButton: {
    width: '100%',
  },
});

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>📈</Text>
        <Text style={styles.title}>ZERO TILT</Text>
        <Text style={styles.subtitle}>Master Your Trading Psychology</Text>

        <View style={styles.buttons}>
          <Link href="/(auth)/signup" asChild>
            <Button title="Create Account" onPress={() => {}} size="lg" />
          </Link>

          <Link href="/(auth)/login" asChild>
            <Button
              title="Sign In"
              onPress={() => {}}
              variant="secondary"
              size="lg"
            />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
