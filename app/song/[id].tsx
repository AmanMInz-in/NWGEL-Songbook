import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { useFavourites } from '../../src/context/FavouritesContext';
import { getSongById, getAdjacentSongIds } from '../../src/database/db';
import { Song } from '../../src/types/song';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { FadeInView } from '../../src/components/Motion';

export default function SongReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSize, setFontSize, isDistractionFree, setDistractionFree } = useAppPreferences();
  const { isFavourite, toggleFavourite, addRecentSong } = useFavourites();

  const [song, setSong] = useState<Song | null>(null);
  const [uiLanguage, setUiLanguage] = useState<'hi' | 'hinglish'>('hi');
  const [nav, setNav] = useState<{ prevId: string | null; nextId: string | null }>({
    prevId: null,
    nextId: null,
  });
  const labels = uiLanguage === 'hi'
    ? {
        loading: 'भजन लोड हो रहा है...',
        hymn: 'भजन',
        verse: 'अंतरा',
        chorus: 'मुखड़ा',
        previous: 'पिछला',
        next: 'अगला',
      }
    : {
        loading: 'Bhajan load ho raha hai...',
        hymn: 'Bhajan',
        verse: 'Antara',
        chorus: 'Mukhda',
        previous: 'Pichhla',
        next: 'Agla',
      };

  // Keep screen awake while in reader mode for worship services
  useKeepAwake();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const s = await getSongById(id);
      if (s) {
        setSong(s);
        addRecentSong(s.id);
        const adj = await getAdjacentSongIds(s.bookId, s.number);
        setNav(adj);
      }
    }
    loadData();
  }, [id]);

  if (!song) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.safeArea, { backgroundColor: colors.warmIvory }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.secondaryText }}>{labels.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bookName = song.bookId === 'kurukh-dandi' ? 'Kurukh Dandi' : 'Sakshi Vani';
  const favourited = isFavourite(song.id);

  const handleShare = async () => {
    try {
      const summary = `${bookName} - Hymn #${song.number}: ${song.title}\nNWGEL Church Songbook`;
      await Share.share({ message: summary });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.warmIvory }]}
    >
      {/* Top App Bar (Hidden in Distraction-Free mode) */}
      {!isDistractionFree && (
        <View style={[styles.topBar, { borderBottomColor: colors.borders }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.iconButton, { backgroundColor: colors.white }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text numberOfLines={1} style={[styles.bookLabel, { color: colors.secondaryText }]}>{bookName.toUpperCase()}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => setDistractionFree(true)}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Enter distraction-free mode"
            >
              <Ionicons name="expand-outline" size={22} color={colors.primaryText} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFontSize(Math.min(30, fontSize + 2))}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Increase lyric text size"
            >
              <Ionicons name="text" size={20} color={colors.primaryText} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavourite(song.id)}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel={favourited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Ionicons
                name={favourited ? 'heart' : 'heart-outline'}
                size={24}
                color={favourited ? colors.mutedGold : colors.primaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Share hymn"
            >
              <Ionicons name="share-social-outline" size={22} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Exit Button for Distraction Free Mode */}
      {isDistractionFree && (
        <TouchableOpacity
          onPress={() => setDistractionFree(false)}
          style={[styles.floatingExit, { backgroundColor: colors.forestGreen }]}
        >
          <Ionicons name="contract-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Lyrics Content View */}
      <ScrollView
        key={song.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView delay={40}>
          <View style={[styles.languageSwitch, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="हिंदी गीत देखें"
              accessibilityState={{ selected: uiLanguage === 'hi' }}
              onPress={() => setUiLanguage('hi')}
              style={[
                styles.languageOption,
                uiLanguage === 'hi' && { backgroundColor: colors.forestGreen },
              ]}
            >
              <Text style={[
                styles.languageText,
                { color: uiLanguage === 'hi' ? colors.onBrand : colors.secondaryText },
              ]}>
                हिन्दी
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Hinglish lyrics are coming soon"
              accessibilityState={{ selected: uiLanguage === 'hinglish' }}
              onPress={() => setUiLanguage('hinglish')}
              style={[
                styles.languageOption,
                uiLanguage === 'hinglish' && { backgroundColor: colors.forestGreen },
              ]}
            >
              <Text style={[
                styles.languageText,
                { color: uiLanguage === 'hinglish' ? colors.onBrand : colors.secondaryText },
              ]}>
                Hinglish
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.songHeader}>
            <View style={[styles.songNumberPill, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="musical-note" size={13} color={colors.mutedGold} />
              <Text style={[styles.songNumber, { color: colors.mutedGold }]}>{labels.hymn} {song.number}</Text>
            </View>
            <Text style={[styles.songTitle, { color: colors.primaryText }]}>{song.title}</Text>
            {song.category && (
              <Text style={[styles.songCategory, { color: colors.secondaryText }]}>{song.category}</Text>
            )}
          </View>

          <View style={styles.decorativeLine}>
            <View style={[styles.decorativeSide, { backgroundColor: colors.borders }]} />
            <Ionicons name="leaf-outline" size={16} color={colors.mutedGold} />
            <View style={[styles.decorativeSide, { backgroundColor: colors.borders }]} />
          </View>
        </FadeInView>

        {uiLanguage === 'hinglish' ? (
          <View style={[styles.comingSoonNotice, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
            <Ionicons name="hourglass-outline" size={22} color={colors.mutedGold} />
            <Text style={[styles.comingSoonText, { color: colors.secondaryText }]}>
              Hinglish lyrics are coming soon.
            </Text>
          </View>
        ) : song.sections.map((section, index) => {
          const isChorus = section.type === 'chorus' || section.type === 'refrain';
          return (
            <FadeInView key={`${song.id}-${index}`} delay={100 + index * 75}>
            <View
              style={[
                styles.sectionBlock,
                isChorus && [
                  styles.chorusBlock,
                  { backgroundColor: colors.cardBackground, borderColor: colors.mutedGold },
                ],
              ]}
            >
              {isChorus ? (
                <View style={styles.chorusHeading}>
                  <View style={[styles.chorusLabel, { backgroundColor: colors.warmIvory }]}>
                    <Ionicons name="repeat" size={13} color={colors.mutedGold} />
                    <Text style={[styles.chorusTag, { color: colors.mutedGold }]}>
                      {labels.chorus}
                    </Text>
                  </View>
                  <View style={[styles.chorusDivider, { backgroundColor: colors.borders }]} />
                </View>
              ) : (
                <Text style={[styles.sectionTag, { color: colors.secondaryText }]}>
                  {`${labels.verse} ${section.number || index + 1}`}
                </Text>
              )}
              <Text
                style={[
                  styles.lyricsText,
                  {
                    color: colors.primaryText,
                    fontSize: fontSize,
                    lineHeight: fontSize * 1.6,
                    ...(isChorus && styles.chorusLyrics),
                  },
                ]}
              >
                {section.text}
              </Text>
            </View>
            </FadeInView>
          );
        })}
      </ScrollView>

      {/* Bottom Prev / Next Song Navigation */}
      <View style={[styles.bottomNav, { borderTopColor: colors.borders, backgroundColor: colors.white }]}>
        <TouchableOpacity
          disabled={!nav.prevId}
          onPress={() => nav.prevId && router.replace(`/song/${nav.prevId}`)}
          style={[styles.navButton, { backgroundColor: colors.warmIvory }]}
        >
          <Ionicons name="chevron-back" size={20} color={nav.prevId ? colors.primaryText : colors.secondaryText} />
          <Text style={[styles.navText, { color: nav.prevId ? colors.primaryText : colors.secondaryText }]}>{labels.previous}</Text>
        </TouchableOpacity>

        <View style={[styles.navIndicator, { backgroundColor: colors.warmIvory }]}>
          <Text style={[styles.indicatorText, { color: colors.secondaryText }]}>#{song.number}</Text>
        </View>

        <TouchableOpacity
          disabled={!nav.nextId}
          onPress={() => nav.nextId && router.replace(`/song/${nav.nextId}`)}
          style={[styles.navButton, { backgroundColor: colors.warmIvory }]}
        >
          <Text style={[styles.navText, { color: nav.nextId ? colors.primaryText : colors.secondaryText }]}>{labels.next}</Text>
          <Ionicons name="chevron-forward" size={20} color={nav.nextId ? colors.primaryText : colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  bookLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 35,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 4,
  },
  floatingExit: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 22,
  },
  languageOption: {
    flex: 1,
    minWidth: 75,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  comingSoonNotice: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  songHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  songNumberPill: {
    minHeight: 29,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderRadius: 15,
    marginBottom: 12,
  },
  songNumber: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  songTitle: {
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.65,
    paddingHorizontal: 5,
    marginBottom: 7,
  },
  songCategory: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    width: 108,
    alignSelf: 'center',
    marginBottom: 24,
  },
  decorativeSide: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  sectionBlock: {
    marginBottom: 19,
    paddingHorizontal: 3,
  },
  chorusBlock: {
    marginHorizontal: -3,
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 17,
    borderRadius: 19,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 11,
    elevation: 2,
  },
  chorusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  chorusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  chorusTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  chorusDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 10,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  lyricsText: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  chorusLyrics: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  bottomNav: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderTopWidth: 1,
    paddingVertical: 7,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 13,
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navIndicator: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 13,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '700',
  },
});