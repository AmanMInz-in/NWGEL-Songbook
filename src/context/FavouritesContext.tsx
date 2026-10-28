import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavouritesContextType {
  favourites: string[];
  isFavourite: (songId: string) => boolean;
  toggleFavourite: (songId: string) => Promise<void>;
  recentSongs: string[];
  addRecentSong: (songId: string) => Promise<void>;
}

const FAVOURITES_KEY = '@nwgel_favourites_v1';
const RECENTS_KEY = '@nwgel_recents_v1';

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [recentSongs, setRecentSongs] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const favRaw = await AsyncStorage.getItem(FAVOURITES_KEY);
        if (favRaw) setFavourites(JSON.parse(favRaw));

        const recRaw = await AsyncStorage.getItem(RECENTS_KEY);
        if (recRaw) setRecentSongs(JSON.parse(recRaw));
      } catch (e) {
        console.warn('Failed to load favourites or recents', e);
      }
    }
    loadData();
  }, []);

  const isFavourite = (songId: string) => favourites.includes(songId);

  const toggleFavourite = async (songId: string) => {
    let nextFavs: string[];
    if (favourites.includes(songId)) {
      nextFavs = favourites.filter(id => id !== songId);
    } else {
      nextFavs = [...favourites, songId];
    }
    setFavourites(nextFavs);
    await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(nextFavs));
  };

  const addRecentSong = async (songId: string) => {
    const filtered = recentSongs.filter(id => id !== songId);
    const updated = [songId, ...filtered].slice(0, 10);
    setRecentSongs(updated);
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        isFavourite,
        toggleFavourite,
        recentSongs,
        addRecentSong
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error('useFavourites must be used within FavouritesProvider');
  return context;
};