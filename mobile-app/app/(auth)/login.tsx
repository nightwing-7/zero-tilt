import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../hooks/useAnalytics';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  header: {
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
  } as TextStyle,
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  form: {
    gap: spacing[4],
  },
  inputGroup: {
    gap: spacing[2],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.dark.text.secondary,
  } as TextStyle,
  input: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  } as TextStyle,
  forgotPassword: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.teal,
  } as TextStyle,
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[6],
  },
  signupText: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
  } as TextStyle,
  signupLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.teal,
    fontWeight: '600',
  } as TextStyle,
});

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { track } = useAnalytics();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const success = await signIn(email, password);

      if (success) {
        track('login_successful', { email });
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.dark.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.dark.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />
          </View>

          <View style={styles.signupLink}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLinkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
