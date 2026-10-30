import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '../../src/components/Motion';
import { AppTheme } from '../../src/constants/theme';

const THEME_OPTIONS: {
  id: AppTheme;
  label: string;
  background: string;
  primary: string;
  accent: string;
}[] = [
  { id: 'light', label: 'Classic', background: '#F7F4EC', primary: '#173D32', accent: '#815817' },
  { id: 'dark', label: 'Night', background: '#111A15', primary: '#1D4738', accent: '#E7BD68' },
  { id: 'ocean', label: 'Ocean', background: '#F0F5F6', primary: '#1F5268', accent: '#80531C' },
  { id: 'sepia', label: 'Sepia', background: '#F6F1E7', primary: '#63452F', accent: '#744C1A' },
];

export default function SettingsScreen() {
  const { colors, theme, setTheme, fontSize, setFontSize } = useAppPreferences();

  const openInstagram = async (username: string) => {
    try {
      await Linking.openURL(`https://www.instagram.com/${username}/`);
    } catch (error) {
      console.warn(`Could not open Instagram profile for ${username}`, error);
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.warmIvory }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <FadeInView>
        <LinearGradient
          colors={[colors.forestGreen, colors.forestGreenDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="options-outline" size={22} color="#E6C58E" />
          </View>
          <Text style={styles.heroEyebrow}>MAKE IT YOURS</Text>
          <Text style={styles.heroTitle}>A comfortable way to read.</Text>
          <Text style={styles.heroSubtitle}>Tune your songbook to the moment.</Text>
        </LinearGradient>
      </FadeInView>

      <FadeInView delay={90} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <Text style={[styles.rowHint, styles.themeHint, { color: colors.secondaryText }]}>
            Choose a theme for your songbook.
          </Text>
          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`${option.label} theme`}
                accessibilityState={{ selected: theme === option.id }}
                onPress={() => setTheme(option.id)}
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.warmIvory, borderColor: theme === option.id ? colors.mutedGold : colors.borders },
                ]}
              >
                <View
                  accessibilityElementsHidden
                  style={[styles.themeSwatch, { backgroundColor: option.background, borderColor: colors.borders }]}
                >
                  <View style={[styles.themeSwatchDot, { backgroundColor: option.primary }]} />
                  <View style={[styles.themeSwatchDot, { backgroundColor: option.accent }]} />
                </View>
                <Text style={[styles.rowText, { color: colors.primaryText }]}>{option.label}</Text>
                {theme === option.id && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.mutedGold} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borders }]} />

          <View style={styles.rowColumn}>
            <View style={styles.rowLabel}>
              <View style={[styles.rowIconWrap, { backgroundColor: colors.warmIvory }]}>
                <Ionicons name="text-outline" size={18} color={colors.primaryText} />
              </View>
              <View>
                <Text style={[styles.rowText, { color: colors.primaryText }]}>Reading size</Text>
                <Text style={[styles.rowHint, { color: colors.secondaryText }]}>
                  Adjust lyrics to your comfort · {fontSize} pt
                </Text>
              </View>
            </View>
            <View style={styles.fontSizeControls}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Decrease reading size"
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                style={[styles.sizeButton, { borderColor: colors.borders, backgroundColor: colors.warmIvory }]}
              >
                <Text style={[styles.sizeButtonText, { color: colors.primaryText }]}>A−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setFontSize(18)}
                style={[styles.resetButton, { borderColor: colors.borders, backgroundColor: colors.warmIvory }]}
              >
                <Text style={[styles.resetText, { color: colors.secondaryText }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Increase reading size"
                onPress={() => setFontSize(Math.min(28, fontSize + 2))}
                style={[styles.sizeButton, { borderColor: colors.borders, backgroundColor: colors.warmIvory }]}
              >
                <Text style={[styles.sizeButtonText, { color: colors.primaryText }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={180} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>ABOUT THIS SONGBOOK</Text>
        <View style={[styles.card, styles.aboutCard, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <View style={styles.aboutHeading}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="book" size={19} color={colors.primaryText} />
            </View>
            <View style={styles.aboutHeadingCopy}>
              <Text style={[styles.churchName, { color: colors.primaryText }]}>NWGEL Songbook</Text>
              <Text style={[styles.aboutMeta, { color: colors.secondaryText }]}>Made for worship, wherever you are</Text>
            </View>
          </View>
          <Text style={[styles.aboutText, { color: colors.secondaryText }]}>
            A digital home for the Kurukh Dandi and Sakshi Vani hymnals, created to support worship and devotion.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borders }]} />

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.secondaryText }]}>App version</Text>
            <Text style={[styles.metaVal, { color: colors.primaryText }]}>1.0.0</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.secondaryText }]}>Song collections</Text>
            <Text style={[styles.metaVal, { color: colors.mutedGold }]}>Kurukh · Hindi</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={260} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>DEVELOPERS</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Open Aman Minz's Instagram profile"
            onPress={() => openInstagram('amannminz')}
            style={styles.developerRow}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="person-outline" size={18} color={colors.primaryText} />
            </View>
            <View style={styles.developerCopy}>
              <Text style={[styles.rowText, { color: colors.primaryText }]}>Aman Minz</Text>
              <Text style={[styles.rowHint, { color: colors.secondaryText }]}>@amannminz</Text>
            </View>
            <Ionicons name="logo-instagram" size={20} color={colors.mutedGold} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.borders }]} />
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Open Adarsh Toppo's Instagram profile"
            onPress={() => openInstagram('adarshh.q')}
            style={styles.developerRow}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="person-outline" size={18} color={colors.primaryText} />
            </View>
            <View style={styles.developerCopy}>
              <Text style={[styles.rowText, { color: colors.primaryText }]}>Adarsh Toppo</Text>
              <Text style={[styles.rowHint, { color: colors.secondaryText }]}>@adarshh.q</Text>
            </View>
            <Ionicons name="logo-instagram" size={20} color={colors.mutedGold} />
          </TouchableOpacity>
        </View>
      </FadeInView>

      <Text style={[styles.footerNote, { color: colors.secondaryText }]}>
        NORTH WESTERN GOSSNER EVANGELICAL LUTHERAN CHURCH
      </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 19,
    paddingTop: 13,
    paddingBottom: 28,
  },
  hero: {
    borderRadius: 23,
    padding: 19,
    marginBottom: 24,
  },
  heroIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 15,
  },
  heroEyebrow: {
    color: '#E4C18A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 9,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  themeHint: {
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  themeOption: {
    minHeight: 46,
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
  },
  themeSwatch: {
    width: 34,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 7,
  },
  themeSwatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  developerRow: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerCopy: {
    flex: 1,
  },
  rowColumn: {
    paddingTop: 2,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  rowText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowHint: {
    fontSize: 10,
    marginTop: 3,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
    marginLeft: 49,
  },
  sizeButton: {
    width: 40,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  resetButton: {
    minWidth: 58,
    height: 35,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },
  aboutCard: {
    padding: 17,
  },
  aboutHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  aboutHeadingCopy: {
    flex: 1,
  },
  churchName: {
    fontSize: 15,
    fontWeight: '800',
  },
  aboutMeta: {
    fontSize: 10,
    marginTop: 3,
  },
  aboutText: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: -4,
  },
});
