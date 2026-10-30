import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { BookMeta } from '../types/song';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './Motion';

interface BookCardProps {
  book: BookMeta;
  onPress: () => void;
  delay?: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress, delay = 0 }) => {
  const { colors } = useAppPreferences();
  const bookAccent = book.id === 'sakshi-vani' ? colors.mutedGold : colors.primaryText;

  return (
    <PressableScale
      accessibilityLabel={`Open ${book.title}`}
      delay={delay}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borders,
        },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: bookAccent }]} />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.warmIvory }]}>
            <Ionicons name="book-outline" size={23} color={bookAccent} />
          </View>
          <Text style={[styles.language, { color: bookAccent }]}>
            {book.language.toUpperCase()}
          </Text>
          <View style={styles.arrow}>
            <Ionicons name="arrow-up-outline" size={17} color={colors.secondaryText} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.primaryText }]}>{book.title}</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{book.subtitle}</Text>
        <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
          {book.description}
        </Text>
        <View style={[styles.footer, { borderTopColor: colors.borders }]}>
          <Text style={[styles.openLabel, { color: colors.primaryText }]}>Explore collection</Text>
          <Ionicons name="arrow-forward" size={16} color={bookAccent} />
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  accent: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 19,
    paddingTop: 17,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  language: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
    marginBottom: 15,
  },
  footer: {
    height: 46,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
