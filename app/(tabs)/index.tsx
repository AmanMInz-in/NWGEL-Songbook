import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences, useThemeColorStyle } from '../../src/context/AppPreferencesContext';
import { useFavourites } from '../../src/context/FavouritesContext';
import { PressableScale } from '../../src/components/Motion';
import { getSongById } from '../../src/database/db';
import { BookMeta, Song, SongbookId } from '../../src/types/song';
import kurukhDandiData from '../../src/data/kurukhDandi.json';
import sakshiVaniData from '../../src/data/sakshiVani.json';
import Reanimated from 'react-native-reanimated';

const AnimatedSafeAreaView = Reanimated.createAnimatedComponent(SafeAreaView);

const BOOKS: (Pick<BookMeta, 'id' | 'title' | 'subtitle' | 'language'> & {
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
})[] = [
  {
    id: 'kurukh-dandi',
    title: 'Kurukh Dandi',
    subtitle: 'कुड़ुख़ डंडी',
    language: 'KURUKH',
    count: kurukhDandiData.length,
    icon: 'musical-notes-outline',
  },
  {
    id: 'sakshi-vani',
    title: 'Sakshi Vani',
    subtitle: 'साक्षी वाणी',
    language: 'HINDI',
    count: sakshiVaniData.length,
    icon: 'book-outline',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();
  const backgroundStyle = useThemeColorStyle('warmIvory');
  const { recentSongs } = useFavourites();
  const [recentHymns, setRecentHymns] = useState<Song[]>([]);

  useEffect(() => {
    let active = true;

    async function loadRecentHymns() {
      try {
        const songs = await Promise.all(recentSongs.map(getSongById));
        if (active) setRecentHymns(songs.filter((song): song is Song => song !== null));
      } catch (error) {
        console.error('Could not load recently opened hymns:', error);
      }
    }

    loadRecentHymns();
    return () => {
      active = false;
    };
  }, [recentSongs]);

  const openBook = (book: SongbookId) => {
    router.push({ pathname: '/books/[book]', params: { book } });
  };

  const openSong = (song: Song) => {
    router.push(`/song/${song.id}`);
  };

  return (
    <AnimatedSafeAreaView
      edges={['top']}
      style={[styles.safeArea, backgroundStyle]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.forestGreen }]}>
          <View style={styles.brandMark}>
            <Ionicons name="book-outline" size={23} color={colors.mutedGoldLight} />
          </View>
          <Text style={styles.brand}>NWGEL</Text>
          <Text style={styles.eyebrow}>YOUR SONGBOOK, ALWAYS WITH YOU</Text>
          <Text style={styles.headline}>Find a song.{'\n'}Keep the moment.</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Search songs and lyrics"
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/search')}
          style={[
            styles.searchButton,
            { backgroundColor: colors.cardBackground, borderColor: colors.borders },
          ]}
        >
          <Ionicons name="search-outline" size={19} color={colors.secondaryText} />
          <Text style={[styles.searchText, { color: colors.secondaryText }]}>
            Search songs, numbers, or lyrics
          </Text>
          <Ionicons name="arrow-forward" size={17} color={colors.mutedGold} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionEyebrow, { color: colors.secondaryText }]}>THE COLLECTION</Text>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Songbooks</Text>
          </View>
        </View>

        <View style={styles.bookGrid}>
          {BOOKS.map(book => (
            <View key={book.id} style={styles.bookCardPressable}>
              <PressableScale
                accessibilityLabel={`Open ${book.title}, ${book.count} hymns`}
                onPress={() => openBook(book.id)}
                style={[
                  styles.bookCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.borders },
                ]}
              >
                <View style={styles.bookCardTop}>
                  <Text style={[styles.bookLanguage, { color: colors.secondaryText }]}>{book.language}</Text>
                  <Ionicons name="open-outline" size={17} color={colors.mutedGold} />
                </View>
                <View style={[styles.bookIcon, { backgroundColor: colors.warmIvory }]}>
                  <Ionicons name={book.icon} size={30} color={colors.mutedGold} />
                </View>
                <Text style={[styles.bookTitle, { color: colors.primaryText }]}>{book.title}</Text>
                <Text style={[styles.bookSubtitle, { color: colors.secondaryText }]}>{book.subtitle}</Text>
                <Text style={[styles.bookCount, { color: colors.mutedGold }]}>
                  {book.count} {book.count === 1 ? 'HYMN' : 'HYMNS'}
                </Text>
              </PressableScale>
            </View>
          ))}
        </View>

        <View style={styles.recentSection}>
          <View style={styles.recentHeading}>
            <Text style={[styles.sectionEyebrow, { color: colors.secondaryText }]}>PICK UP WHERE YOU LEFT OFF</Text>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Recently opened</Text>
          </View>

          {recentHymns.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {recentHymns.map(song => {
                const book = BOOKS.find(item => item.id === song.bookId);
                return (
                  <View key={song.id} style={styles.recentCardPressable}>
                    <PressableScale
                      accessibilityLabel={`Open hymn ${song.number}: ${song.title}`}
                      onPress={() => openSong(song)}
                      style={[
                        styles.recentCard,
                        { backgroundColor: colors.cardBackground, borderColor: colors.borders },
                      ]}
                    >
                      <View style={styles.recentMeta}>
                        <Text style={[styles.recentNumber, { color: colors.mutedGold }]}>NO. {song.number}</Text>
                        <Text style={[styles.recentBook, { color: colors.secondaryText }]}>{book?.title ?? song.bookId}</Text>
                      </View>
                      <Text numberOfLines={2} style={[styles.recentTitle, { color: colors.primaryText }]}>{song.title}</Text>
                      <View style={[styles.recentAction, { borderTopColor: colors.borders }]}>
                        <Text style={[styles.recentActionText, { color: colors.secondaryText }]}>CONTINUE READING</Text>
                        <Ionicons name="arrow-forward" size={15} color={colors.mutedGold} />
                      </View>
                    </PressableScale>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/search')}
              style={[
                styles.emptyRecent,
                { borderColor: colors.borders, backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons name="headset-outline" size={20} color={colors.mutedGold} />
              <Text style={[styles.emptyRecentText, { color: colors.secondaryText }]}>Songs you open will appear here.</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.mutedGold} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingTop: 14, paddingBottom: 36 },
  header: {
    marginHorizontal: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'flex-start',
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,202,148,0.12)',
    marginBottom: 14,
  },
  brand: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  eyebrow: {
    color: '#E3EAE5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 22,
  },
  headline: {
    fontFamily: 'serif',
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1.1,
    marginTop: 8,
  },
  searchButton: {
    minHeight: 54,
    marginHorizontal: 20,
    marginTop: 22,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  searchText: { flex: 1, fontSize: 13, fontWeight: '500' },
  sectionHeader: { marginHorizontal: 22, marginTop: 30, marginBottom: 14 },
  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.25,
    marginBottom: 5,
  },
  sectionTitle: { fontFamily: 'serif', fontSize: 23, fontWeight: '700', letterSpacing: -0.5 },
  bookGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  bookCardPressable: { flex: 1 },
  bookCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 192,
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  bookCardTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookLanguage: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  bookIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 19,
    marginBottom: 14,
  },
  bookTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  bookSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  bookCount: { fontSize: 9, fontWeight: '700', letterSpacing: 0.9, marginTop: 12 },
  recentSection: { marginTop: 34 },
  recentHeading: { paddingHorizontal: 22, marginBottom: 14 },
  recentList: { paddingHorizontal: 20, gap: 12 },
  recentCardPressable: { width: 248 },
  recentCard: {
    width: 248,
    minHeight: 142,
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  recentMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  recentNumber: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  recentBook: { fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  recentTitle: { fontFamily: 'serif', fontSize: 17, lineHeight: 23, fontWeight: '600', marginVertical: 12 },
  recentAction: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentActionText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  emptyRecent: {
    marginHorizontal: 20,
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  emptyRecentText: { flex: 1, fontSize: 12, fontWeight: '600' },
});
