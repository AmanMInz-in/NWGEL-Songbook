import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppPreferencesProvider, useAppPreferences } from '../src/context/AppPreferencesContext';
import { FavouritesProvider } from '../src/context/FavouritesContext';
import { getDatabase } from '../src/database/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_DURATION_MS = 800;

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { theme, colors } = useAppPreferences();

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        await getDatabase();
      } catch (err) {
        console.warn('Database init failure:', err);
      } finally {
        if (isMounted) {
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    init();

    // Safety fallback: ensure splash screen hides within 1.5s no matter what
    const safetyTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' || theme === 'ocean' || theme === 'midnight' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.forestGreen },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.warmIvory },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="books/[book]"
          options={{ headerShown: true, title: 'Songbook', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="song/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
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