import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { SongListItem } from '../../src/components/SongListItem';
import { SearchInput } from '../../src/components/SearchInput';
import { EmptyState } from '../../src/components/EmptyState';
import { FadeInView } from '../../src/components/Motion';
import { Song, SongbookId } from '../../src/types/song';
import { getSongsByBook } from '../../src/database/db';
import { Ionicons } from '@expo/vector-icons';

export default function BookCollectionScreen() {
  const { book } = useLocalSearchParams<{ book: string }>();
  const router = useRouter();
  const { colors } = useAppPreferences();

  const [songs, setSongs] = useState<Song[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'number' | 'title'>('number');

  const bookId = book as SongbookId;
  const bookTitle = bookId === 'kurukh-dandi' ? 'Kurukh Dandi' : 'Sakshi Vani';
  const bookSubtitle = bookId === 'kurukh-dandi' ? 'कुड़ुख़ डंडी · KURUKH HYMNS' : 'साक्षी वाणी · HINDI HYMNS';
  const bookAccent = bookId === 'kurukh-dandi' ? '#D8BC8E' : '#E5C38F';

  useEffect(() => {
    async function loadBookData() {
      const data = await getSongsByBook(bookId);
      setSongs(data);
    }
    loadBookData();
  }, [bookId]);

  const displayedSongs = songs
    .filter((s) => {
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.number.toString().includes(q) ||
        s.sections.some((sec) => sec.text.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      return a.number - b.number;
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.warmIvory }]}>
      <Stack.Screen
        options={{
          title: bookTitle,
          headerStyle: { backgroundColor: colors.forestGreen },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setSortOrder(sortOrder === 'number' ? 'title' : 'number')}
              style={styles.sortButton}
              accessibilityRole="button"
              accessibilityLabel={sortOrder === 'number' ? 'Sort by title' : 'Sort by number'}
            >
              <Ionicons
                name={sortOrder === 'number' ? 'list-outline' : 'reorder-four-outline'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ),
        }}
      />

      <FadeInView style={styles.bookIntro}>
        <View style={[styles.bookMark, { backgroundColor: colors.forestGreen }]}>
          <Ionicons name="book" size={23} color={bookAccent} />
        </View>
        <View style={styles.bookIntroCopy}>
          <Text style={[styles.bookEyebrow, { color: colors.secondaryText }]}>{bookSubtitle}</Text>
          <Text style={[styles.bookTitle, { color: colors.primaryText }]}>{bookTitle}</Text>
          <View style={styles.bookMeta}>
            <Ionicons name="musical-notes-outline" size={13} color={colors.mutedGold} />
            <Text style={[styles.songCount, { color: colors.secondaryText }]}>
              {songs.length} {songs.length === 1 ? 'hymn' : 'hymns'}
            </Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={70} style={styles.searchContainer}>
        <SearchInput
          value={filterQuery}
          onChangeText={setFilterQuery}
          placeholder={`Search inside ${bookTitle}...`}
        />
      </FadeInView>

      <FlatList
        data={displayedSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <SongListItem
            song={item}
            delay={Math.min(index * 35, 245)}
            onPress={() => router.push(`/song/${item.id}`)}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="document-text-outline"
            title="No Hymns Found"
            message={`No hymns matched "${filterQuery}" in ${bookTitle}.`}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 19,
    paddingTop: 0,
    paddingBottom: 5,
  },
  sortButton: {
    padding: 6,
    marginRight: 6,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 19,
    paddingBottom: 32,
  },
  bookIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 11,
  },
  bookMark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginRight: 13,
  },
  bookIntroCopy: {
    flex: 1,
  },
  bookEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.25,
    marginBottom: 3,
  },
  bookTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  songCount: {
    fontSize: 10,
    fontWeight: '600',
  },
});