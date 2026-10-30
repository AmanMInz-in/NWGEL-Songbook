import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppPreferencesProvider, useAppPreferences } from '../src/context/AppPreferencesContext';
import { FavouritesProvider } from '../src/context/FavouritesContext';
import { getDatabase } from '../src/database/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_DURATION_MS = 1500;
const splashStartedAt = Date.now();

SplashScreen.preventAutoHideAsync().catch(err => console.error('Splash screen prevent-auto-hide failure:', err));

function RootNavigation() {
  const { theme, colors } = useAppPreferences();

  useEffect(() => {
    getDatabase().catch(err => console.error('Database init failure:', err));
  }, []);

  useEffect(() => {
    const remainingDuration = Math.max(0, SPLASH_DURATION_MS - (Date.now() - splashStartedAt));
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(err => console.error('Splash screen hide failure:', err));
    }, remainingDuration);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' || theme === 'ocean' ? 'light' : 'dark'} />
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