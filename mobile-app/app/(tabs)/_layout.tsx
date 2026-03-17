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
          backgroundColor: colors.dark.secondary,
          borderTopColor: colors.dark.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📔</Text>,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: 'Panic',
          tabBarLabel: 'Panic',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🚨</Text>,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        } as BottomTabNavigationOptions}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        } as BottomTabNavigationOptions}
      />
    </Tabs>
  );
}

function Text(props: any) {
  return <>{props.children}</>;
}
