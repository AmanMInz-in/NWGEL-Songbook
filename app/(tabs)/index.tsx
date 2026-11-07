import React, { useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { FadeInView } from '../../src/components/Motion';
import { BookMeta } from '../../src/types/song';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING_HORIZONTAL = 20;
const GRID_GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING_HORIZONTAL * 2 - GRID_GAP) / 2;

interface SongbookItem extends Pick<BookMeta, 'id' | 'title'> {
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const BOOKS: SongbookItem[] = [
  {
    id: 'kurukh-dandi',
    title: 'Kurukh Dandi',
    subtitle: 'कुड़ुख़ डंडी',
    icon: 'musical-notes-outline',
  },
  {
    id: 'sakshi-vani',
    title: 'Sakshi Vani',
    subtitle: 'साक्षी वाणी',
    icon: 'book-outline',
  },
];

interface RecentHymn {
  id: string;
  bookId: string;
  songNumber: number;
  title: string;
  subtitle: string;
  bookName: string;
}

// Sample recent items (you can wire this to AsyncStorage or your Context state)
const RECENT_HYMNS: RecentHymn[] = [
  {
    id: 'kd-12',
    bookId: 'kurukh-dandi',
    songNumber: 12,
    title: 'Ninghai Daya Nu',
    subtitle: 'निंघय दया नु',
    bookName: 'Kurukh Dandi',
  },
  {
    id: 'sv-104',
    bookId: 'sakshi-vani',
    songNumber: 104,
    title: 'Tu Raj Kare Prabhu',
    subtitle: 'तू राज करे प्रभु',
    bookName: 'Sakshi Vani',
  },
  {
    id: 'kd-45',
    bookId: 'kurukh-dandi',
    songNumber: 45,
    title: 'Bhaia Bahi Mann',
    subtitle: 'भईया बहिन मन',
    bookName: 'Kurukh Dandi',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();

  const formattedCount = useMemo(
    () => String(BOOKS.length).padStart(2, '0'),
    []
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.forestGreen || '#0E2E23' }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <FadeInView style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="book-outline"
              size={26}
              color={colors.mutedGoldLight || '#E8CA94'}
            />
          </View>
          <Text style={styles.brand}>NWGEL</Text>
          <Text style={styles.subtitle}>CHURCH SONGBOOK</Text>
        </FadeInView>

        {/* Search Bar */}
        <FadeInView delay={100}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Search hymns or lyrics"
            activeOpacity={0.88}
            onPress={() => router.push('/(tabs)/search')}
            style={[styles.searchBar, { backgroundColor: colors.warmIvory || '#F4EFE6' }]}
          >
            <Ionicons name="search" size={20} color={colors.primaryText || '#1B2E24'} />
            <Text style={[styles.searchText, { color: colors.secondaryText || '#5D7367' }]}>
              Search hymns or lyrics
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primaryText || '#1B2E24'} />
          </TouchableOpacity>
        </FadeInView>

        {/* Section Header: Songbooks */}
        <FadeInView delay={160} style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>BROWSE THE LIBRARY</Text>
            <Text style={styles.sectionTitle}>Songbooks</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{formattedCount}</Text>
          </View>
        </FadeInView>

        {/* 2x2 Grid */}
        <View style={styles.gridContainer}>
          {BOOKS.map((book, index) => {
            const goldColor = colors.mutedGoldLight || '#E8CA94';

            return (
              <View key={book.id} style={{ width: CARD_WIDTH }}>
                <FadeInView delay={220 + index * 80}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${book.title}, ${book.subtitle}`}
                    onPress={() =>
                      router.push({
                        pathname: '/books/[id]',
                        params: { id: book.id },
                      })
                    }
                    style={styles.gridCard}
                  >
                    <View style={[styles.bookIconWrap, { borderColor: goldColor }]}>
                      <Ionicons
                        name={book.icon}
                        size={38}
                        color={goldColor}
                      />
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {book.subtitle}
                    </Text>
                  </TouchableOpacity>
                </FadeInView>
              </View>
            );
          })}
        </View>

        {/* Recent Hymns Section */}
        <FadeInView delay={320} style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <View>
              <Text style={styles.sectionEyebrow}>JUMP BACK IN</Text>
              <Text style={styles.recentTitle}>Recently Viewed</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/search')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>Search All</Text>
              <Ionicons name="chevron-forward" size={14} color="#E8CA94" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          >
            {RECENT_HYMNS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/books/[id]',
                    params: { id: item.bookId, songId: item.id },
                  })
                }
                style={styles.recentCard}
              >
                <View style={styles.recentTopRow}>
                  <View style={styles.songNumberBadge}>
                    <Text style={styles.songNumberText}>#{item.songNumber}</Text>
                  </View>
                  <Text style={styles.recentBookTag}>{item.bookName}</Text>
                </View>

                <View style={styles.recentInfo}>
                  <Text style={styles.recentSongTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.recentSongSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>

                <View style={styles.recentFooter}>
                  <Text style={styles.recentOpenText}>Open Hymn</Text>
                  <Ionicons name="arrow-forward" size={13} color="#E8CA94" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 24,
    paddingBottom: 36,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(232, 202, 148, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
  },
  subtitle: {
    color: '#E8CA94',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.6,
    marginTop: 6,
  },
  searchBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 18,
    shadowColor: '#071A14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 16,
  },
  sectionEyebrow: {
    color: '#D6E3DC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(232, 202, 148, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  countText: {
    color: '#E8CA94',
    fontSize: 13,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GRID_GAP,
  },
  gridCard: {
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(232, 202, 148, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  bookIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 26,
    borderWidth: 1.2,
    backgroundColor: 'rgba(232, 202, 148, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  cardSubtitle: {
    color: '#E8CA94',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },

  /* Recent Hymns Styles */
  recentSection: {
    marginTop: 34,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  seeAllText: {
    color: '#E8CA94',
    fontSize: 13,
    fontWeight: '700',
  },
  recentList: {
    paddingRight: 8,
    gap: 12,
  },
  recentCard: {
    width: 190,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(232, 202, 148, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 138,
  },
  recentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songNumberBadge: {
    backgroundColor: 'rgba(232, 202, 148, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  songNumberText: {
    color: '#E8CA94',
    fontSize: 12,
    fontWeight: '800',
  },
  recentBookTag: {
    color: '#8EAFA1',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recentInfo: {
    marginVertical: 8,
  },
  recentSongTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  recentSongSubtitle: {
    color: '#E8CA94',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  recentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  recentOpenText: {
    color: '#E8CA94',
    fontSize: 11,
    fontWeight: '700',
  },
});