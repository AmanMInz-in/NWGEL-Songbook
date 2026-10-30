export const Palette = {
  forestGreen: '#173D32',
  forestGreenDark: '#0E2720',
  warmIvory: '#F7F4EC',
  mutedGold: '#815817',
  mutedGoldLight: '#E8CA94',
  primaryText: '#202C25',
  secondaryText: '#626D66',
  white: '#FFFFFF',
  onBrand: '#FFFFFF',
  borders: '#E8E3D8',
  cardBackground: '#FFFFFF',
  danger: '#BA3C3C',
};

export const DarkPalette = {
  forestGreen: '#1D4738',
  forestGreenDark: '#11291F',
  warmIvory: '#111A15',
  mutedGold: '#E7BD68',
  mutedGoldLight: '#F0D799',
  primaryText: '#F5F1E7',
  secondaryText: '#B6C2B9',
  white: '#1B2720',
  onBrand: '#F5F1E7',
  borders: '#34463A',
  cardBackground: '#202C24',
  danger: '#E57373',
};

export const OceanPalette = {
  forestGreen: '#1F5268',
  forestGreenDark: '#163A4A',
  warmIvory: '#F0F5F6',
  mutedGold: '#80531C',
  mutedGoldLight: '#E8CA94',
  primaryText: '#1E2C33',
  secondaryText: '#586A72',
  white: '#FFFFFF',
  onBrand: '#FFFFFF',
  borders: '#D9E3E6',
  cardBackground: '#FFFFFF',
  danger: '#BA3C3C',
};

export const SepiaPalette = {
  forestGreen: '#63452F',
  forestGreenDark: '#45301F',
  warmIvory: '#F6F1E7',
  mutedGold: '#744C1A',
  mutedGoldLight: '#E4C18A',
  primaryText: '#342B23',
  secondaryText: '#6F6253',
  white: '#FFFCF6',
  onBrand: '#FFFCF6',
  borders: '#E5DAC6',
  cardBackground: '#FFFCF6',
  danger: '#BA3C3C',
};

export type AppTheme = 'light' | 'dark' | 'ocean' | 'sepia';
export type ThemeColors = typeof Palette;

export const Typography = {
  fontFamilyRegular: 'System',
  fontFamilyBold: 'System',
  titleLarge: 28,
  titleMedium: 22,
  titleSmall: 18,
  bodyLarge: 18,
  bodyRegular: 16,
  bodySmall: 14,
  caption: 12,
};