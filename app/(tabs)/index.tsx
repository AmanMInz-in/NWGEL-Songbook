import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { BookCard } from '../../src/components/BookCard';
import { FadeInView } from '../../src/components/Motion';
import { BookMeta } from '../../src/types/song';

const BOOKS: BookMeta[] = [
  {
    id: 'kurukh-dandi',
    title: 'Kurukh Dandi',
    subtitle: 'कुड़ुख़ डंडी',
    language: 'Kurukh Hymnal',
    description: 'Traditional Kurukh hymns, praise chants, and songs for worship.',
    accentColor: '#173D32',
  },
  {
    id: 'sakshi-vani',
    title: 'Sakshi Vani',
    subtitle: 'साक्षी वाणी',
    language: 'Hindi Hymnal',
    description: 'Beloved Hindi hymns for congregation worship and home devotion.',
    accentColor: '#C39753',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.forestGreen }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <Ionicons name="book-outline" size={25} color={colors.mutedGoldLight} />
          </View>
          <Text style={styles.brand}>NWGEL</Text>
          <Text style={styles.subtitle}>CHURCH SONGBOOK</Text>
        </FadeInView>

        <FadeInView delay={100}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Search hymns or lyrics"
            activeOpacity={0.88}
            onPress={() => router.push('/(tabs)/search')}
            style={[styles.searchBar, { backgroundColor: colors.warmIvory }]}
          >
            <Ionicons name="search" size={19} color={colors.forestGreen} />
            <Text style={[styles.searchText, { color: colors.secondaryText }]}>
              Search hymns or lyrics
            </Text>
            <Ionicons name="arrow-forward" size={17} color={colors.forestGreen} />
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={160} style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>BROWSE THE LIBRARY</Text>
            <Text style={styles.sectionTitle}>Songbooks</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>02</Text>
          </View>
        </FadeInView>

        {BOOKS.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            delay={220 + index * 90}
            onPress={() => router.push(`/books/${book.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(232, 202, 148, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#E8CA94',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginTop: 5,
  },
  searchBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderRadius: 17,
    shadowColor: '#071A14',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  searchText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 31,
    marginBottom: 16,
  },
  sectionEyebrow: {
    color: '#C7D5CD',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 202, 148, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  countText: {
    color: '#E8CA94',
    fontSize: 12,
    fontWeight: '800',
  },
});
