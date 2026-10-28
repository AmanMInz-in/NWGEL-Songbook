import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { SearchInput } from '../../src/components/SearchInput';
import { SongListItem } from '../../src/components/SongListItem';
import { EmptyState } from '../../src/components/EmptyState';
import { FadeInView } from '../../src/components/Motion';
import { Song, SongbookId } from '../../src/types/song';
import { searchSongs } from '../../src/database/db';

type FilterType = 'all' | 'kurukh-dandi' | 'sakshi-vani';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All hymns' },
  { id: 'kurukh-dandi', label: 'Kurukh' },
  { id: 'sakshi-vani', label: 'Sakshi Vani' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<Song[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let active = true;
    const handler = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      const bookFilter = filter === 'all' ? undefined : (filter as SongbookId);
      const data = await searchSongs(trimmedQuery, bookFilter);
      if (active) {
        setResults(data);
        setHasSearched(true);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query, filter]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.warmIvory }]}
    >
      <View style={styles.screen}>
      <View style={styles.searchHeader}>
        <FadeInView>
          <Text style={[styles.eyebrow, { color: colors.secondaryText }]}>YOUR SONGBOOK</Text>
          <Text style={[styles.title, { color: colors.primaryText }]}>Find a hymn</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Search by title, number, or a lyric you remember.
          </Text>
        </FadeInView>
        <FadeInView delay={80}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder="Try a title, number, or lyric"
          />
        </FadeInView>

        <View style={styles.filterRow}>
          {FILTERS.map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setFilter(tab.id)}
                activeOpacity={0.78}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.forestGreen : colors.cardBackground,
                    borderColor: isSelected ? colors.forestGreen : colors.borders,
                  },
                ]}
              >
                {tab.id !== 'all' && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: tab.id === 'kurukh-dandi' ? '#D8BC8E' : colors.mutedGold },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : colors.primaryText },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {hasSearched && (
        <FadeInView style={styles.resultsHeading}>
          <Text style={[styles.resultCount, { color: colors.secondaryText }]}>
            {results.length} {results.length === 1 ? 'hymn' : 'hymns'} found
          </Text>
          <Ionicons name="options-outline" size={17} color={colors.secondaryText} />
        </FadeInView>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <SongListItem
            song={item}
            delay={Math.min(index * 35, 245)}
            onPress={() => router.push(`/song/${item.id}`)}
          />
        )}
        ListEmptyComponent={() =>
          hasSearched ? (
            <EmptyState
              icon="search-outline"
              title="No hymns found"
              message={`We couldn't find a song matching “${query}”. Try another word or a song number.`}
            />
          ) : (
            <EmptyState
              icon="musical-notes-outline"
              title="A hymn is just a search away"
              message="Search across both songbooks using a number, title, or a lyric you remember."
            />
          )
        }
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  filterChip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultsHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 21,
    paddingVertical: 7,
  },
  resultCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 19,
    paddingTop: 5,
    paddingBottom: 32,
  },
});
