import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';

export default function TabLayout() {
  const { colors } = useAppPreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.mutedGold,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borders,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 9,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#15271F',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.forestGreen,
        },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favourites',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}