import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from './Motion';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'musical-notes-outline',
  title,
  message,
}) => {
  const { colors } = useAppPreferences();

  return (
    <FadeInView style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.warmIvory }]}>
        <Ionicons name={icon} size={36} color={colors.mutedGold} />
        </View>
      <Text style={[styles.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});