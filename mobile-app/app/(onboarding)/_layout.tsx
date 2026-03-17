import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: colors.dark.bg.primary,
        },
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="about-you" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="commitment" />
    </Stack>
  );
}
