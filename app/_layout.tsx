import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppPreferencesProvider, useAppPreferences } from '../src/context/AppPreferencesContext';
import { FavouritesProvider } from '../src/context/FavouritesContext';
import { getDatabase } from '../src/database/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootNavigation() {
  const { theme, colors } = useAppPreferences();

  useEffect(() => {
    getDatabase().catch(err => console.error('Database init failure:', err));
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.forestGreen },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.warmIvory },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="books/[book]" options={{ headerShown: true, title: 'Songbook' }} />
        <Stack.Screen name="song/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppPreferencesProvider>
        <FavouritesProvider>
          <RootNavigation />
        </FavouritesProvider>
      </AppPreferencesProvider>
    </SafeAreaProvider>
  );
}