import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { useThemeColorStyle } from '../../src/context/AppPreferencesContext';
import { useFavourites } from '../../src/context/FavouritesContext';
import { SongListItem } from '../../src/components/SongListItem';
import { EmptyState } from '../../src/components/EmptyState';
import { getSongById } from '../../src/database/db';
import { Song } from '../../src/types/song';
import Reanimated from 'react-native-reanimated';

const AnimatedSafeAreaView = Reanimated.createAnimatedComponent(SafeAreaView);

export default function FavouritesScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();
  const backgroundStyle = useThemeColorStyle('warmIvory');
  const { favourites } = useFavourites();
  const [songs, setSongs] = useState<Song[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadFavs() {
        const list: Song[] = [];
        for (const id of favourites) {
          const item = await getSongById(id);
          if (item) list.push(item);
        }
        setSongs(list);
      }
      loadFavs();
    }, [favourites])
  );

  return (
    <AnimatedSafeAreaView
      edges={['top']}
      style={[styles.container, backgroundStyle]}
    >
      <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.secondaryText }]}>KEPT CLOSE</Text>
          <Text style={[styles.title, { color: colors.primaryText }]}>Your saved hymns</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            A little collection for the songs you love.
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
          <Ionicons name="heart" size={15} color={colors.mutedGold} />
          <Text style={[styles.count, { color: colors.primaryText }]}>{songs.length}</Text>
        </View>
      </View>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            isFavourite
            onPress={() => router.push(`/song/${item.id}`)}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="heart-outline"
            title="No Saved Hymns"
            message="Tap the heart icon while reading any song to quickly access it here during church service."
          />
        )}
      />
      </View>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 21,
    paddingBottom: 15,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.65,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 48,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 12,
  },
  count: {
    fontSize: 15,
    fontWeight: '800',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 19,
    paddingBottom: 32,
  },
});