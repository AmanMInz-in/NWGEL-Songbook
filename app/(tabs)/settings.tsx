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

  const openExternalLink = async (url: string, label: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn(`Could not open ${label}`, error);
    }
  };

  const openInstagram = async (username: string) => {
    await openExternalLink(
      `https://www.instagram.com/${username}/`,
      `Instagram profile for ${username}`,
    );
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
      <Text style={[styles.pageTitle, { color: colors.primaryText }]}>Settings</Text>

      <FadeInView style={styles.section}>
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

      <FadeInView delay={90} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>ABOUT THIS SONGBOOK</Text>
        <View style={[styles.card, styles.aboutCard, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <View style={styles.aboutHeading}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="book" size={19} color={colors.primaryText} />
            </View>
            <View style={styles.aboutHeadingCopy}>
              <Text style={[styles.churchName, { color: colors.primaryText }]}>Digital Songbook</Text>
              <Text style={[styles.aboutMeta, { color: colors.secondaryText }]}>Independent · Open source</Text>
            </View>
          </View>
          <Text style={[styles.aboutText, { color: colors.secondaryText }]}>
            An offline-friendly songbook bringing together the Sakshi Vani and Kurukh Dandi hymn collections.
          </Text>
          <Text style={[styles.aboutDisclaimer, { color: colors.secondaryText }]}>
            Independently created and maintained by its contributors, this is not an official publication of any church. Hymn texts are presented for reference and worship; rights and attribution remain with their respective owners.
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

      <FadeInView delay={180} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}> About Developers </Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <View style={styles.authorHeading}>
            <View style={[styles.rowIconWrap, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="person-outline" size={18} color={colors.primaryText} />
            </View>
            <View style={styles.developerCopy}>
              <Text style={[styles.rowText, { color: colors.primaryText }]}>Aman Minz</Text>
              <Text style={[styles.rowHint, { color: colors.secondaryText }]}>
                Lead Developer, Software Architect & Database Designer
              </Text>
            </View>
          </View>
          <Text style={[styles.authorDescription, { color: colors.secondaryText }]}>
            Designed and built the application architecture, database schemas, indexing, and offline synchronization. Implemented the UI/UX, search, and app features, and digitized and structured the Sakshi Vani song database.
          </Text>
          <View style={styles.profileLinks}>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Open Aman Minz's GitHub profile"
              onPress={() => openExternalLink('https://github.com/AmanMInz-in', "Aman Minz's GitHub profile")}
              style={[styles.profileLink, { backgroundColor: colors.warmIvory }]}
            >
              <Ionicons name="logo-github" size={16} color={colors.primaryText} />
              <Text style={[styles.profileLinkText, { color: colors.primaryText }]}>GitHub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Open Aman Minz's LinkedIn profile"
              onPress={() => openExternalLink('https://linkedin.com/in/amanminz', "Aman Minz's LinkedIn profile")}
              style={[styles.profileLink, { backgroundColor: colors.warmIvory }]}
            >
              <Ionicons name="logo-linkedin" size={16} color={colors.primaryText} />
              <Text style={[styles.profileLinkText, { color: colors.primaryText }]}>LinkedIn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Open Aman Minz's Instagram profile"
              onPress={() => openInstagram('amannminz')}
              style={[styles.profileLink, { backgroundColor: colors.warmIvory }]}
            >
              <Ionicons name="logo-instagram" size={16} color={colors.primaryText} />
              <Text style={[styles.profileLinkText, { color: colors.primaryText }]}>Instagram</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.borders }]} />
          <View style={styles.authorHeading}>
            <View style={[styles.rowIconWrap, { backgroundColor: colors.warmIvory }]}>
              <Ionicons name="person-outline" size={18} color={colors.primaryText} />
            </View>
            <View style={styles.developerCopy}>
              <Text style={[styles.rowText, { color: colors.primaryText }]}>Adarsh Toppo</Text>
              <Text style={[styles.rowHint, { color: colors.secondaryText }]}>
                Hymnal Archivist & Content Contributor
              </Text>
            </View>
          </View>
          <Text style={[styles.authorDescription, { color: colors.secondaryText }]}>
            Gathered, transcribed, and structured the Kurukh Dandi hymns, and collaborated on reviewing, proofreading, and verifying Sakshi Vani lyrics.
          </Text>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Open Adarsh Toppo's Instagram profile"
            onPress={() => openInstagram('adarshh.q')}
            style={[styles.profileLink, styles.adarshProfileLink, { backgroundColor: colors.warmIvory }]}
          >
            <Ionicons name="logo-instagram" size={16} color={colors.primaryText} />
            <Text style={[styles.profileLinkText, { color: colors.primaryText }]}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      <Text style={[styles.acknowledgmentNote, { color: colors.secondaryText }]}>
        Dedicated to preserving hymn traditions and serving the worshippers who cherish them.
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
    paddingTop: 18,
    paddingBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 22,
  },
  section: {
    marginBottom: 20,
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
  authorHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorDescription: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  profileLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 12,
  },
  profileLink: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    paddingHorizontal: 10,
  },
  adarshProfileLink: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  profileLinkText: {
    fontSize: 11,
    fontWeight: '700',
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
  aboutDisclaimer: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
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
  acknowledgmentNote: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: -5,
    marginBottom: 13,
  },
});
