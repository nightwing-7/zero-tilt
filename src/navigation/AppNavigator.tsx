import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import {
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text,
} from 'react-native';

// Icons
import {
  HomeIcon,
  AnalyticsIcon,
  CommunityIcon,
  JournalIcon,
  ProfileIcon,
} from '@/components/icons/NavIcons';

// Auth
import { WelcomeScreen, SignUpScreen, SignInScreen } from '@/screens/auth';

// Onboarding
import { OnboardingFlow } from '@/screens/onboarding';

// Main tab screens
import {
  DashboardScreen,
  AnalyticsScreen,
  CommunityScreen,
  JournalScreen,
  ProfileScreen,
} from '@/screens/main';

// Modal screens
import {
  PanicButtonScreen,
  UrgeTrackerScreen,
  GamesScreen,
  CoachScreen,
} from '@/screens/modals';

import {
  GoalsTrackingScreen,
  PreTradeChecklistScreen,
  PledgeScreen,
} from '@/screens/main';

// Settings screens
import {
  EditProfileScreen,
  NotificationsScreen,
  PrivacyScreen,
  HelpScreen,
  SubscriptionScreen,
} from '@/screens/settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();

// Custom Tab Bar Component
function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const tabConfig = [
    { name: 'Home', Icon: HomeIcon, label: 'Home' },
    { name: 'Analytics', Icon: AnalyticsIcon, label: 'Analytics' },
    { name: 'Community', Icon: CommunityIcon, label: 'Community' },
    { name: 'Journal', Icon: JournalIcon, label: 'Journal' },
    { name: 'Profile', Icon: ProfileIcon, label: 'Profile' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 73,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
      }}
    >
      {tabConfig.map((tab, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[state.routes[index].key];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };

        return (
          <View
            key={tab.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.7}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.sm,
              }}
            >
              <tab.Icon
                size={24}
                color={isFocused ? colors.emerald[500] : colors.textDim}
              />
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: isFocused ? fontWeight.semibold : fontWeight.medium,
                  color: isFocused ? colors.emerald[500] : colors.textDim,
                  marginTop: spacing.xs,
                  fontFamily: 'Inter',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold,
          fontFamily: 'Inter',
        },
        headerBackTitle: 'Back',
      }}
    >
      <SettingsStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <SettingsStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <SettingsStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <SettingsStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy' }}
      />
      <SettingsStack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Help & Support' }}
      />
    </SettingsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
          height: 73,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ title: 'Journal' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.emerald[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack - Welcome → SignUp → SignIn
          <Stack.Group screenOptions={{ presentation: 'card' }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Auth" component={SignInScreen} />
          </Stack.Group>
        ) : !profile?.onboarding_completed ? (
          // Onboarding Stack - no tab bar
          <Stack.Group screenOptions={{ presentation: 'card' }}>
            <Stack.Screen name="Onboarding" component={OnboardingFlow} />
          </Stack.Group>
        ) : (
          // Main App - tabs with modals
          <>
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Modal Stack - presented over tabs */}
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: {
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.bold,
                  fontFamily: 'Inter',
                },
              }}
            >
              <Stack.Screen
                name="UrgeTracker"
                component={UrgeTrackerScreen}
                options={{ title: 'Urge Tracker' }}
              />
              <Stack.Screen
                name="PanicButton"
                component={PanicButtonScreen}
                options={{ title: 'Reset' }}
              />
              <Stack.Screen
                name="PreTradeChecklist"
                component={PreTradeChecklistScreen}
                options={{ title: 'Pre-Trade Checklist' }}
              />
              <Stack.Screen
                name="Games"
                component={GamesScreen}
                options={{ title: 'Games' }}
              />
              <Stack.Screen
                name="GoalsTracking"
                component={GoalsTrackingScreen}
                options={{ title: 'Goals' }}
              />
              <Stack.Screen
                name="Pledge"
                component={PledgeScreen}
                options={{ title: 'Daily Pledge' }}
              />
              <Stack.Screen
                name="Coach"
                component={CoachScreen}
                options={{ title: 'AI Coach' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsNavigator}
                options={{ title: 'Settings' }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
