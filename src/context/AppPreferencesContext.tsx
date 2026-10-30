import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppTheme,
  DarkPalette,
  OceanPalette,
  Palette,
  SepiaPalette,
  ThemeColors,
} from '../constants/theme';

interface AppPreferencesContextType {
  theme: AppTheme;
  fontSize: number;
  isDistractionFree: boolean;
  colors: ThemeColors;
  setTheme: (theme: AppTheme) => void;
  setFontSize: (size: number) => void;
  setDistractionFree: (value: boolean) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextType | undefined>(undefined);

const PREFS_THEME_KEY = '@nwgel_theme_v1';
const PREFS_FONT_KEY = '@nwgel_font_size_v1';

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('light');
  const [fontSize, setFontSizeState] = useState<number>(18);
  const [isDistractionFree, setDistractionFree] = useState<boolean>(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const savedTheme = await AsyncStorage.getItem(PREFS_THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'ocean' || savedTheme === 'sepia') {
          setThemeState(savedTheme);
        }

        const savedFontSize = await AsyncStorage.getItem(PREFS_FONT_KEY);
        if (savedFontSize) setFontSizeState(Number(savedFontSize));
      } catch (e) {
        console.warn('Failed to load user preferences', e);
      }
    }
    loadPreferences();
  }, []);

  const setTheme = async (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    try {
      await AsyncStorage.setItem(PREFS_THEME_KEY, nextTheme);
    } catch (error) {
      console.warn('Failed to save theme preference', error);
    }
  };

  const setFontSize = async (size: number) => {
    setFontSizeState(size);
    await AsyncStorage.setItem(PREFS_FONT_KEY, size.toString());
  };

  const colors: ThemeColors = {
    light: Palette,
    dark: DarkPalette,
    ocean: OceanPalette,
    sepia: SepiaPalette,
  }[theme];

  return (
    <AppPreferencesContext.Provider
      value={{
        theme,
        fontSize,
        isDistractionFree,
        colors,
        setTheme,
        setFontSize,
        setDistractionFree
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  return context;
};