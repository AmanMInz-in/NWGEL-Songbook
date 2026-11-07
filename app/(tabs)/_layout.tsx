import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';

export default function TabLayout() {
  const { colors } = useAppPreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E8CA94',
        tabBarInactiveTintColor: '#C5D8CF',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: 'rgba(197, 216, 207, 0.16)',
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 9,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#081C15',
          shadowOpacity: 0.28,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              tint="dark"
              intensity={70}
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(8, 28, 21, 0.88)' },
              ]}
            />
          </View>
        ),
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