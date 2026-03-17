import React from 'react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.teal,
        tabBarInactiveTintColor: colors.dark.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.dark.bg.secondary,
          borderTopColor: colors.dark.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => <TabIcon emoji="📔" color={color} />,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: 'Panic',
          tabBarLabel: 'Panic',
          tabBarIcon: ({ color }) => <TabIcon emoji="🚨" color={color} />,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} />,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} />,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'More',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
        } as BottomTabNavigationOptions}
      />
    </Tabs>
  );
}

// Proper Text component for tab icons
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}
