import React, { useRef } from 'react';
import { Animated, View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search by song number, title, or lyric...',
  onClear,
}) => {
  const { colors } = useAppPreferences();
  const focusProgress = useRef(new Animated.Value(0)).current;

  const animateFocus = (isFocused: boolean) => {
    Animated.timing(focusProgress, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borders, colors.mutedGold],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.white, borderColor }]}>
      <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.primaryText }]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => animateFocus(true)}
        onBlur={() => animateFocus(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 52,
    marginVertical: 7,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 9,
    elevation: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});