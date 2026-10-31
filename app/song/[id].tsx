import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppPreferences } from '../../src/context/AppPreferencesContext';
import { useFavourites } from '../../src/context/FavouritesContext';
import { getSongById, getAdjacentSongIds } from '../../src/database/db';
import { Song } from '../../src/types/song';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { FadeInView } from '../../src/components/Motion';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

type StoryTheme = 'parchment' | 'forest' | 'sunset';

const STORY_THEMES: {
  id: StoryTheme;
  label: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
}[] = [
  { id: 'parchment', label: 'Parchment', background: '#F7F1E5', foreground: '#24352C', accent: '#A67A3F', muted: '#667269' },
  { id: 'forest', label: 'Forest', background: '#173D32', foreground: '#FFFFFF', accent: '#E6C58E', muted: '#D5DED8' },
  { id: 'sunset', label: 'Sunset', background: '#F5E7E1', foreground: '#482F38', accent: '#A85D56', muted: '#78656A' },
];

export default function SongReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSize, setFontSize, isDistractionFree, setDistractionFree } = useAppPreferences();
  const { isFavourite, toggleFavourite, addRecentSong } = useFavourites();

  const [song, setSong] = useState<Song | null>(null);
  const [uiLanguage, setUiLanguage] = useState<'hi' | 'english'>('hi');
  const [showStoryShare, setShowStoryShare] = useState(false);
  const [selectedShareSection, setSelectedShareSection] = useState(0);
  const [selectedStoryTheme, setSelectedStoryTheme] = useState<StoryTheme>('parchment');
  const [shareContentMode, setShareContentMode] = useState<'section' | 'lines'>('section');
  const [isSelectingLyricLines, setIsSelectingLyricLines] = useState(false);
  const [selectedLyricLineKeys, setSelectedLyricLineKeys] = useState<string[]>([]);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const storyViewRef = React.useRef<ViewShot>(null);
  const lyricSelectionAnchor = React.useRef<string | null>(null);
  const isSelectingLyricLinesRef = React.useRef(false);
  const skipLongPressRelease = React.useRef(false);
  const lyricLineLayouts = React.useRef<Record<string, { top: number; bottom: number }>>({});
  const lyricSectionOffsets = React.useRef<Record<number, number>>({});
  const lyricSectionBlockOffsets = React.useRef<Record<number, number>>({});
  const lyricSectionBodyOffsets = React.useRef<Record<number, number>>({});
  const storyWidth = Math.max(180, Math.min(
    Dimensions.get('window').width - 64,
    (Dimensions.get('window').height - 330) * 9 / 16,
    320,
  ));
  const storyHeight = storyWidth * 16 / 9;
  const [nav, setNav] = useState<{ prevId: string | null; nextId: string | null }>({
    prevId: null,
    nextId: null,
  });
  const labels = uiLanguage === 'hi'
    ? {
        loading: 'भजन लोड हो रहा है...',
        hymn: 'भजन',
        verse: 'अंतरा',
        chorus: 'मुखड़ा',
        previous: 'पिछला',
        next: 'अगला',
      }
    : {
          loading: 'Loading song...',
          hymn: 'Hymn',
          verse: 'Verse',
          chorus: 'Chorus',
          previous: 'Previous',
          next: 'Next',
      };

  // Keep screen awake while in reader mode for worship services
  useKeepAwake();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const s = await getSongById(id);
      if (s) {
        setSong(s);
        addRecentSong(s.id);
        const adj = await getAdjacentSongIds(s.bookId, s.number);
        setNav(adj);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (!isSelectingLyricLines) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setIsSelectingLyricLines(false);
      setSelectedLyricLineKeys([]);
      lyricSelectionAnchor.current = null;
      skipLongPressRelease.current = false;
      return true;
    });

    return () => subscription.remove();
  }, [isSelectingLyricLines]);

  if (!song) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.safeArea, { backgroundColor: colors.warmIvory }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.secondaryText }}>{labels.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bookName = song.bookId === 'kurukh-dandi' ? 'Kurukh Dandi' : 'Sakshi Vani';
  const favourited = isFavourite(song.id);
  const lyricLines = song.sections.flatMap((section, sectionIndex) =>
    section.text.split('\n').map((text, lineIndex) => ({
      key: `${sectionIndex}:${lineIndex}`,
      sectionIndex,
      lineIndex,
      text,
    })),
  );
  const selectedLineKeySet = new Set(selectedLyricLineKeys);
  const selectedLyricLines = lyricLines.filter(line => selectedLineKeySet.has(line.key) && line.text.trim());
  const selectedLyricText = selectedLyricLines.map(line => line.text).join('\n');

  const selectedSection = song.sections[selectedShareSection] || song.sections[0];
  const selectedTheme = STORY_THEMES.find(theme => theme.id === selectedStoryTheme) || STORY_THEMES[0];
  const selectedSectionLabel =
    selectedSection.type === 'chorus' || selectedSection.type === 'refrain'
      ? 'Chorus'
      : selectedSection.type === 'bridge'
        ? 'Bridge'
        : `Verse ${selectedSection.number || selectedShareSection + 1}`;
  const shareLyrics = shareContentMode === 'lines' ? selectedLyricText : selectedSection.text;
  const shareContentLabel = shareContentMode === 'lines' ? 'Selected lines' : selectedSectionLabel;
  const estimatedTextLines = shareLyrics.split('\n').reduce(
    (lineCount, line) => lineCount + Math.max(1, Math.ceil(line.length / 24)),
    0,
  );
  const storyLyricsSize = Math.max(12, Math.min(24, Math.floor(400 / (estimatedTextLines * 1.35))));

  const startLyricLineSelection = (lineKey: string) => {
    lyricSelectionAnchor.current = lineKey;
    skipLongPressRelease.current = true;
    isSelectingLyricLinesRef.current = true;
    setIsSelectingLyricLines(true);
    setSelectedLyricLineKeys([lineKey]);
  };

  const selectLyricRange = (lineKey: string) => {
    const anchorIndex = lyricLines.findIndex(line => line.key === lyricSelectionAnchor.current);
    const targetIndex = lyricLines.findIndex(line => line.key === lineKey);
    if (anchorIndex === -1 || targetIndex === -1) return;

    const rangeStart = Math.min(anchorIndex, targetIndex);
    const rangeEnd = Math.max(anchorIndex, targetIndex);
    setSelectedLyricLineKeys(lyricLines.slice(rangeStart, rangeEnd + 1).map(line => line.key));
  };

  const extendLyricLineSelection = (lineKey: string) => {
    if (skipLongPressRelease.current) {
      skipLongPressRelease.current = false;
      return;
    }
    if (!isSelectingLyricLinesRef.current) return;

    if (selectedLineKeySet.has(lineKey)) {
      const remainingKeys = selectedLyricLineKeys.filter(key => key !== lineKey);
      setSelectedLyricLineKeys(remainingKeys);
      if (!remainingKeys.length) {
        cancelLyricLineSelection();
      } else if (lyricSelectionAnchor.current === lineKey) {
        lyricSelectionAnchor.current = remainingKeys[0];
      }
      return;
    }

    selectLyricRange(lineKey);
  };

  const cancelLyricLineSelection = () => {
    isSelectingLyricLinesRef.current = false;
    setIsSelectingLyricLines(false);
    setSelectedLyricLineKeys([]);
    lyricSelectionAnchor.current = null;
    skipLongPressRelease.current = false;
  };

  const handleLyricLineLayout = (
    sectionIndex: number,
    lineKey: string,
    event: Parameters<NonNullable<ViewProps['onLayout']>>[0],
  ) => {
    const sectionTop = lyricSectionOffsets.current[sectionIndex] || 0;
    const blockTop = lyricSectionBlockOffsets.current[sectionIndex] || 0;
    const bodyTop = lyricSectionBodyOffsets.current[sectionIndex] || 0;
    lyricLineLayouts.current[lineKey] = {
      top: sectionTop + blockTop + bodyTop + event.nativeEvent.layout.y,
      bottom: sectionTop + blockTop + bodyTop + event.nativeEvent.layout.y + event.nativeEvent.layout.height,
    };
  };

  const handleLyricDrag = (locationY: number) => {
    if (!isSelectingLyricLinesRef.current) return;

    const target = lyricLines.find(line => {
      if (!line.text.trim()) return false;
      const layout = lyricLineLayouts.current[line.key];
      return layout && locationY >= layout.top && locationY <= layout.bottom;
    });
    if (target) selectLyricRange(target.key);
  };

  const handleReaderBack = () => {
    if (isSelectingLyricLines) {
      cancelLyricLineSelection();
      return;
    }
    router.back();
  };

  const handleShare = () => {
    isSelectingLyricLinesRef.current = false;
    setIsSelectingLyricLines(false);
    setSelectedLyricLineKeys([]);
    lyricSelectionAnchor.current = null;
    skipLongPressRelease.current = false;
    setShareContentMode('section');
    setSelectedShareSection(0);
    setShowStoryShare(true);
  };

  const handleShareSelectedLines = () => {
    if (!selectedLyricLines.length) return;
    setShareContentMode('lines');
    setShowStoryShare(true);
  };

  const handleShareAsText = async () => {
    try {
      const summary = `${bookName} - Hymn #${song.number}: ${song.title}\n${shareContentLabel}\n\n${shareLyrics}\n\nDigital Songbook`;
      await Share.share({ message: summary });
    } catch (e) {
      console.error('Could not share hymn text:', e);
      Alert.alert('Could not share text', 'Please try again.');
    }
  };

  const handleShareStoryImage = async () => {
    if (!storyViewRef.current?.capture) {
      Alert.alert('Unable to create image', 'Please close and reopen the share preview, then try again.');
      return;
    }

    setIsSharingImage(true);
    try {
      const imageUri = await storyViewRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing unavailable', 'Image sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share hymn image',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Could not create or share hymn image:', error);
      Alert.alert('Could not share image', 'Please try again.');
    } finally {
      setIsSharingImage(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.warmIvory }]}
    >
      {/* Top App Bar (Hidden in Distraction-Free mode) */}
      {!isDistractionFree && (
        <View style={[styles.topBar, { borderBottomColor: colors.borders }]}>
          <TouchableOpacity
            onPress={handleReaderBack}
            style={[styles.iconButton, { backgroundColor: colors.white }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text numberOfLines={1} style={[styles.bookLabel, { color: colors.secondaryText }]}>{bookName.toUpperCase()}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => setDistractionFree(true)}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Enter distraction-free mode"
            >
              <Ionicons name="expand-outline" size={22} color={colors.primaryText} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFontSize(Math.max(14, fontSize - 2))}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Decrease lyric text size"
            >
              <Text style={[styles.fontSizeButtonText, { color: colors.primaryText }]}>A−</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFontSize(Math.min(30, fontSize + 2))}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Increase lyric text size"
            >
              <Text style={[styles.fontSizeButtonText, { color: colors.primaryText }]}>A+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavourite(song.id)}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel={favourited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Ionicons
                name={favourited ? 'heart' : 'heart-outline'}
                size={24}
                color={favourited ? colors.mutedGold : colors.primaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={[styles.iconButton, { backgroundColor: colors.white }]}
              accessibilityRole="button"
              accessibilityLabel="Share hymn"
            >
              <Ionicons name="share-social-outline" size={22} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Exit Button for Distraction Free Mode */}
      {isDistractionFree && (
        <TouchableOpacity
          onPress={() => setDistractionFree(false)}
          style={[styles.floatingExit, { backgroundColor: colors.forestGreen }]}
        >
          <Ionicons name="contract-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Lyrics Content View */}
      <ScrollView
        key={song.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView delay={40}>
          <View style={[styles.languageSwitch, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="हिंदी गीत देखें"
              accessibilityState={{ selected: uiLanguage === 'hi' }}
              onPress={() => setUiLanguage('hi')}
              style={[
                styles.languageOption,
                uiLanguage === 'hi' && { backgroundColor: colors.forestGreen },
              ]}
            >
              <Text style={[
                styles.languageText,
                { color: uiLanguage === 'hi' ? colors.onBrand : colors.secondaryText },
              ]}>
                हिन्दी
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="English lyrics are coming soon"
              accessibilityState={{ selected: uiLanguage === 'english' }}
              onPress={() => setUiLanguage('english')}
              style={[
                styles.languageOption,
                uiLanguage === 'english' && { backgroundColor: colors.forestGreen },
              ]}
            >
              <Text style={[
                styles.languageText,
                { color: uiLanguage === 'english' ? colors.onBrand : colors.secondaryText },
              ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.songHeader}>
            <View style={[styles.songNumberPill, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="musical-note" size={13} color={colors.mutedGold} />
              <Text style={[styles.songNumber, { color: colors.mutedGold }]}>{labels.hymn} {song.number}</Text>
            </View>
            <Text style={[styles.songTitle, { color: colors.primaryText }]}>{song.title}</Text>
            {song.category && (
              <Text style={[styles.songCategory, { color: colors.secondaryText }]}>{song.category}</Text>
            )}
          </View>

          <View style={styles.decorativeLine}>
            <View style={[styles.decorativeSide, { backgroundColor: colors.borders }]} />
            <Ionicons name="leaf-outline" size={16} color={colors.mutedGold} />
            <View style={[styles.decorativeSide, { backgroundColor: colors.borders }]} />
          </View>
          {uiLanguage === 'hi' && (
            <Text style={[styles.lineSelectionTip, { color: colors.secondaryText }]}>
              Long-press a line, then drag or tap to select more
            </Text>
          )}
        </FadeInView>

        {uiLanguage === 'english' ? (
          <View style={[styles.comingSoonNotice, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}>
            <Ionicons name="hourglass-outline" size={22} color={colors.mutedGold} />
            <Text style={[styles.comingSoonText, { color: colors.secondaryText }]}>
              English lyrics are coming soon.
            </Text>
          </View>
        ) : (
          <View
            onMoveShouldSetResponderCapture={() => isSelectingLyricLines}
            onResponderMove={event => handleLyricDrag(event.nativeEvent.locationY)}
            onResponderRelease={() => {
              skipLongPressRelease.current = false;
            }}
            onResponderTerminationRequest={() => false}
          >
            {song.sections.map((section, index) => {
              const isChorus = section.type === 'chorus' || section.type === 'refrain';
              const sectionLines = section.text.split('\n');
              return (
                <FadeInView
                  key={`${song.id}-${index}`}
                  delay={100 + index * 75}
                  onLayout={event => {
                    lyricSectionOffsets.current[index] = event.nativeEvent.layout.y;
                  }}
                >
                  <View
                    onLayout={event => {
                      lyricSectionBlockOffsets.current[index] = event.nativeEvent.layout.y;
                    }}
                    style={[
                      styles.sectionBlock,
                      isChorus && [
                        styles.chorusBlock,
                        { backgroundColor: colors.cardBackground, borderColor: colors.mutedGold },
                      ],
                    ]}
                  >
                    {isChorus ? (
                      <View style={styles.chorusHeading}>
                        <View style={[styles.chorusLabel, { backgroundColor: colors.warmIvory }]}>
                          <Ionicons name="repeat" size={13} color={colors.mutedGold} />
                          <Text style={[styles.chorusTag, { color: colors.mutedGold }]}>
                            {labels.chorus}
                          </Text>
                        </View>
                        <View style={[styles.chorusDivider, { backgroundColor: colors.borders }]} />
                      </View>
                    ) : (
                      <Text style={[styles.sectionTag, { color: colors.secondaryText }]}>
                        {`${labels.verse} ${section.number || index + 1}`}
                      </Text>
                    )}
                    <View
                      onLayout={event => {
                        lyricSectionBodyOffsets.current[index] = event.nativeEvent.layout.y;
                      }}
                    >
                      {sectionLines.map((line, lineIndex) => {
                        const lineKey = `${index}:${lineIndex}`;
                        const isSelected = selectedLineKeySet.has(lineKey);
                        return (
                          <TouchableOpacity
                            key={lineKey}
                            accessibilityRole="button"
                            accessibilityLabel={`${line || 'Blank line'}, ${isSelected ? 'selected' : 'long press to select for sharing'}`}
                            onLayout={event => handleLyricLineLayout(index, lineKey, event)}
                            onLongPress={() => startLyricLineSelection(lineKey)}
                            onPress={() => extendLyricLineSelection(lineKey)}
                            delayLongPress={350}
                            activeOpacity={isSelectingLyricLines ? 0.75 : 1}
                            style={[
                              styles.lyricLineTarget,
                              isSelected && { backgroundColor: `${colors.mutedGold}33` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.lyricsText,
                                {
                                  color: colors.primaryText,
                                  fontSize: fontSize,
                                  lineHeight: fontSize * 1.6,
                                  ...(isChorus && styles.chorusLyrics),
                                },
                              ]}
                            >
                              {line || ' '}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </FadeInView>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showStoryShare}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowStoryShare(false);
          if (shareContentMode === 'lines') cancelLyricLineSelection();
        }}
      >
        <View style={styles.storyModalBackdrop}>
          <View style={[styles.storyModalSheet, { backgroundColor: colors.warmIvory }]}>
            <View style={styles.storyModalHeader}>
              <View style={styles.storyModalHeading}>
                <Text style={[styles.storyModalTitle, { color: colors.primaryText }]}>
                  {shareContentMode === 'lines' ? 'Share selected lines' : 'Share hymn'}
                </Text>
                <Text style={[styles.storyModalSubtitle, { color: colors.secondaryText }]}>
                  {shareContentMode === 'lines'
                    ? `${selectedLyricLines.length} lyric lines`
                    : 'Choose a verse and style'}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close image preview"
                onPress={() => setShowStoryShare(false)}
                style={[styles.storyCloseButton, { backgroundColor: colors.cardBackground }]}
              >
                <Ionicons name="close" size={21} color={colors.primaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.storyModalScroll}
              contentContainerStyle={styles.storyModalContent}
              showsVerticalScrollIndicator={false}
            >
              <ViewShot
                ref={storyViewRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 }}
                style={[
                  styles.storyCanvas,
                  { width: storyWidth, height: storyHeight, backgroundColor: selectedTheme.background },
                ]}
              >
                <View style={[styles.storyCanvasAccent, { backgroundColor: selectedTheme.accent }]} />
                <View style={styles.storyCanvasContent}>
                  <Text style={[styles.storyBookName, { color: selectedTheme.accent }]}>{bookName.toUpperCase()}</Text>
                  <View style={[styles.storyRule, { backgroundColor: selectedTheme.accent }]} />
                  <View style={styles.storyLyricsArea}>
                    <Text style={[styles.storySectionLabel, { color: selectedTheme.accent }]}>{shareContentLabel.toUpperCase()}</Text>
                    <Text
                      style={[
                        styles.storyLyrics,
                        { color: selectedTheme.foreground, fontSize: storyLyricsSize, lineHeight: storyLyricsSize * 1.45 },
                      ]}
                    >
                      {shareLyrics}
                    </Text>
                  </View>
                  <View style={[styles.storyFooter, { borderTopColor: `${selectedTheme.accent}66` }]}>
                    <Text numberOfLines={2} style={[styles.storySongTitle, { color: selectedTheme.foreground }]}>{song.title}</Text>
                    <Text style={[styles.storyAttribution, { color: selectedTheme.muted }]}>
                      {shareContentMode === 'lines'
                        ? `SELECTED LINES · #${song.number}`
                        : `DIGITAL SONGBOOK · #${song.number}`}
                    </Text>
                  </View>
                </View>
              </ViewShot>

              {shareContentMode === 'section' ? (
                <>
                  <Text style={[styles.storyPickerLabel, { color: colors.secondaryText }]}>SECTION</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyOptions}>
                    {song.sections.map((section, index) => {
                      const isSelected = selectedShareSection === index;
                      const label = section.type === 'chorus' || section.type === 'refrain'
                        ? 'Chorus'
                        : section.type === 'bridge'
                          ? 'Bridge'
                          : `Verse ${section.number || index + 1}`;
                      return (
                        <TouchableOpacity
                          key={`${song.id}-share-section-${index}`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => setSelectedShareSection(index)}
                          style={[
                            styles.storyOption,
                            {
                              backgroundColor: isSelected ? colors.forestGreen : colors.cardBackground,
                              borderColor: isSelected ? colors.forestGreen : colors.borders,
                            },
                          ]}
                        >
                          <Text style={[styles.storyOptionText, { color: isSelected ? colors.onBrand : colors.primaryText }]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <Text style={[styles.selectedLinesNote, { color: colors.secondaryText }]}>
                  Long-press a line to start a new selection.
                </Text>
              )}

              <Text style={[styles.storyPickerLabel, styles.storyThemeLabel, { color: colors.secondaryText }]}>STYLE</Text>
              <View style={styles.storyOptions}>
                {STORY_THEMES.map(theme => {
                  const isSelected = selectedStoryTheme === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedStoryTheme(theme.id)}
                      style={[
                        styles.storyThemeOption,
                        { backgroundColor: theme.background, borderColor: isSelected ? colors.mutedGold : colors.borders },
                      ]}
                    >
                      <View style={[styles.storyThemeSwatch, { backgroundColor: theme.accent }]} />
                      <Text style={[styles.storyThemeText, { color: theme.foreground }]}>{theme.label}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={16} color={theme.accent} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.storyShareActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: isSharingImage }}
                disabled={isSharingImage}
                onPress={handleShareStoryImage}
                style={[styles.storyShareButton, styles.storyImageShareButton, { backgroundColor: colors.forestGreen }]}
              >
                {isSharingImage ? (
                  <ActivityIndicator color={colors.onBrand} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={18} color={colors.onBrand} />
                    <Text style={[styles.storyShareButtonText, { color: colors.onBrand }]}>Share image</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleShareAsText}
                style={[styles.storyShareButton, styles.storyTextShareButton, { backgroundColor: colors.cardBackground, borderColor: colors.borders }]}
              >
                <Ionicons name="text-outline" size={18} color={colors.primaryText} />
                <Text style={[styles.storyShareButtonText, { color: colors.primaryText }]}>Share text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isSelectingLyricLines && (
        <View style={[styles.lineSelectionBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.borders }]}>
          <View style={styles.lineSelectionCopy}>
            <Text style={[styles.lineSelectionCount, { color: colors.primaryText }]}>
              {selectedLyricLines.length} {selectedLyricLines.length === 1 ? 'line' : 'lines'} selected
            </Text>
            <Text style={[styles.lineSelectionHint, { color: colors.secondaryText }]}>Drag or tap lines to adjust</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel line selection"
            onPress={cancelLyricLineSelection}
            style={[styles.lineSelectionCancel, { backgroundColor: colors.warmIvory }]}
          >
            <Text style={[styles.lineSelectionCancelText, { color: colors.secondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Share selected lyric lines"
            accessibilityState={{ disabled: selectedLyricLines.length === 0 }}
            disabled={selectedLyricLines.length === 0}
            onPress={handleShareSelectedLines}
            style={[
              styles.lineSelectionShare,
              { backgroundColor: selectedLyricLines.length ? colors.forestGreen : colors.borders },
            ]}
          >
            <Ionicons name="share-outline" size={18} color={selectedLyricLines.length ? colors.onBrand : colors.secondaryText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Prev / Next Song Navigation */}
      <View style={[styles.bottomNav, { borderTopColor: colors.borders, backgroundColor: colors.white }]}>
        <TouchableOpacity
          disabled={!nav.prevId}
          onPress={() => nav.prevId && router.replace(`/song/${nav.prevId}`)}
          style={[styles.navButton, { backgroundColor: colors.warmIvory }]}
        >
          <Ionicons name="chevron-back" size={20} color={nav.prevId ? colors.primaryText : colors.secondaryText} />
          <Text style={[styles.navText, { color: nav.prevId ? colors.primaryText : colors.secondaryText }]}>{labels.previous}</Text>
        </TouchableOpacity>

        <View style={[styles.navIndicator, { backgroundColor: colors.warmIvory }]}>
          <Text style={[styles.indicatorText, { color: colors.secondaryText }]}>#{song.number}</Text>
        </View>

        <TouchableOpacity
          disabled={!nav.nextId}
          onPress={() => nav.nextId && router.replace(`/song/${nav.nextId}`)}
          style={[styles.navButton, { backgroundColor: colors.warmIvory }]}
        >
          <Text style={[styles.navText, { color: nav.nextId ? colors.primaryText : colors.secondaryText }]}>{labels.next}</Text>
          <Ionicons name="chevron-forward" size={20} color={nav.nextId ? colors.primaryText : colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  bookLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 35,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 4,
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  floatingExit: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 22,
  },
  languageOption: {
    flex: 1,
    minWidth: 75,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  comingSoonNotice: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  storyModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  storyModalSheet: {
    height: '94%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  storyModalHeading: {
    flex: 1,
  },
  storyModalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  storyModalSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  storyCloseButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  storyModalScroll: {
    flex: 1,
  },
  storyModalContent: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  storyCanvas: {
    overflow: 'hidden',
    borderRadius: 15,
    marginBottom: 16,
  },
  storyCanvasAccent: {
    height: 5,
    width: '100%',
  },
  storyCanvasContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 19,
  },
  storyBookName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  storyRule: {
    width: 34,
    height: 2,
    borderRadius: 1,
    marginTop: 13,
  },
  storyLyricsArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  storySectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  storyLyrics: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: true,
  },
  storyFooter: {
    width: '100%',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  storySongTitle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyAttribution: {
    fontSize: 7,
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 6,
  },
  storyPickerLabel: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  storyOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyOption: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 12,
  },
  storyOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  storyThemeLabel: {
    marginTop: 16,
  },
  storyThemeOption: {
    minHeight: 37,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  storyThemeSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  storyThemeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  storyShareButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 16,
    borderWidth: 1,
  },
  storyShareActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  storyImageShareButton: {
    borderColor: 'transparent',
  },
  storyTextShareButton: {
    borderWidth: 1,
  },
  storyShareButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  lyricLineTarget: {
    borderRadius: 5,
  },
  lineSelectionTip: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: -11,
    marginBottom: 15,
  },
  lineSelectionBar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lineSelectionCopy: {
    flex: 1,
  },
  lineSelectionCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  lineSelectionHint: {
    fontSize: 10,
    marginTop: 3,
  },
  lineSelectionCancel: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 11,
  },
  lineSelectionCancelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lineSelectionShare: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedLinesNote: {
    alignSelf: 'flex-start',
    fontSize: 12,
    lineHeight: 18,
  },
  songHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  songNumberPill: {
    minHeight: 29,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderRadius: 15,
    marginBottom: 12,
  },
  songNumber: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  songTitle: {
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.65,
    paddingHorizontal: 5,
    marginBottom: 7,
  },
  songCategory: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    width: 108,
    alignSelf: 'center',
    marginBottom: 24,
  },
  decorativeSide: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  sectionBlock: {
    marginBottom: 19,
    paddingHorizontal: 3,
  },
  chorusBlock: {
    marginHorizontal: -3,
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 17,
    borderRadius: 19,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#15271F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 11,
    elevation: 2,
  },
  chorusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  chorusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  chorusTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  chorusDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 10,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  lyricsText: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  chorusLyrics: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  bottomNav: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderTopWidth: 1,
    paddingVertical: 7,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 13,
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navIndicator: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 13,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '700',
  },
});