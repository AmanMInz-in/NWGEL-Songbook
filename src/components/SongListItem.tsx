import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { Song } from '../types/song';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './Motion';

interface SongListItemProps {
  song: Song;
  onPress: () => void;
  isFavourite?: boolean;
  delay?: number;
}

export const SongListItem: React.FC<SongListItemProps> = ({
  song,
  onPress,
  isFavourite,
  delay = 0,
}) => {
  const { colors } = useAppPreferences();

  return (
    <PressableScale
      accessibilityLabel={`Song number ${song.number}: ${song.title}`}
      delay={delay}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borders,
        },
      ]}
    >
      <View style={[styles.numberBadge, { backgroundColor: colors.warmIvory }]}>
        <Text style={[styles.numberText, { color: colors.primaryText }]}>{song.number}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text
          style={[styles.category, { color: colors.secondaryText }]}
          numberOfLines={1}
        >
          {song.category || `${song.sections.length} verses`}
        </Text>
      </View>
      {isFavourite && (
        <Ionicons name="heart" size={18} color={colors.mutedGold} style={styles.favIcon} />
      )}
      <View style={[styles.arrowWrap, { backgroundColor: colors.warmIvory }]}>
        <Ionicons name="chevron-forward" size={15} color={colors.secondaryText} />
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  numberBadge: {
    width: 43,
    height: 43,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
  },
  favIcon: {
    marginRight: 11,
  },
  arrowWrap: {
    width: 29,
    height: 29,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
