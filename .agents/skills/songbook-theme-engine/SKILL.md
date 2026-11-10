---
name: songbook-theme-engine
description: >-
  Guides theme creation, color contrast auditing, and reader typography for the NWGEL Songbook app.
  Use when adding new themes, adjusting color palettes, or modifying reader layouts.
---

# Songbook Theme Engine & Reader Guidelines

This skill defines the visual language, sacred hymnal aesthetics, and contrast rules for the NWGEL Songbook mobile app.

## 1. Supported Worship Themes
All palettes reside in `src/constants/theme.ts` and must provide identical token keys (`ThemeColors`):

| Theme ID | Name | Primary Usage | Background Token | Primary Text | Accent Token |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `light` | **Classic** | Daytime / bright church service | `#F7F4EC` (warm ivory) | `#202C25` | `#815817` (gold) |
| `dark` | **Night** | Evening worship / low light | `#111A15` (deep pine) | `#F5F1E7` | `#E7BD68` |
| `midnight` | **Midnight OLED** | Dark sanctuaries & AMOLED power saving | `#000000` (true black) | `#F5F5F7` | `#E5C378` |
| `sepia` | **Sepia** | Ancient scripture / parchment reading | `#F6F1E7` (aged vellum) | `#342B23` | `#744C1A` |
| `ocean` | **Ocean** | Calm contemplative prayer | `#F0F5F6` (arctic tint) | `#1E2C33` | `#80531C` |
| `velvet` | **Royal Velvet** | Liturgical seasons & Communion | `#FDF8F8` (communion ivory) | `#2D1F21` | `#8C6226` (altar gold) |

## 2. Scripture & Lyric Typography Rules
1. **Devanagari Leading**: Always maintain a line-height multiplier between `1.65` and `1.75` times font size to avoid clipping vowel diacritics (matras: `ी`, `ू`, `ै`, `ं`).
2. **Chorus (`मुखड़ा` / `Chorus`) Visual Distinction**:
   - Give the chorus block a distinctive left accent border using `colors.mutedGold` (`borderLeftWidth: 4`).
   - Use the `repeat` icon badge with `labels.chorus`.
3. **Contrast Requirements**:
   - Ensure `primaryText` against `warmIvory` / `cardBackground` satisfies minimum WCAG AA (4.5:1 ratio) for worshippers of all ages.

## 3. Theme Synchronization Checklist
When adding or altering a theme:
1. Update `src/constants/theme.ts` (`Palette` definition and `AppTheme` union type).
2. Register the palette in `src/context/AppPreferencesContext.tsx` (`palettes` map and `loadPreferences` validator).
3. Add the theme option card to `THEME_OPTIONS` in `app/(tabs)/settings.tsx`.
4. Run `npm.cmd run type-check` to verify complete type safety.
