import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { useJournal } from '../hooks/useJournal';
import { getJournalEntryById } from '../services/journal';
import { MOOD_EMOJIS, MOOD_VALUES } from '../constants/config';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Button } from '../components/ui/Button';

const MOOD_OPTIONS = ['terrible', 'poor', 'neutral', 'good', 'excellent'] as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
  } as TextStyle,
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  input: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  } as TextStyle,
  titleInput: {
    minHeight: 50,
  },
  contentInput: {
    minHeight: 200,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing[2],
  },
  moodButton: {
    alignItems: 'center',
    padding: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.secondary,
    flex: 1,
  },
  moodButtonActive: {
    borderColor: colors.accent.teal,
    backgroundColor: colors.accent.teal,
  },
  moodEmoji: {
    fontSize: typography.sizes['2xl'],
    marginBottom: spacing[1],
  } as TextStyle,
  moodLabel: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.secondary,
  } as TextStyle,
  moodLabelActive: {
    color: colors.dark.bg.primary,
  } as TextStyle,
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagInput: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
    minHeight: 50,
  } as TextStyle,
  buttons: {
    gap: spacing[3],
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  saveButton: {
    width: '100%',
  },
});

export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { create, update } = useJournal();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'excellent' | 'poor' | 'neutral' | 'good' | 'terrible'>('good');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      if (!params.entryId || !user?.id) return;

      try {
        const entry = await getJournalEntryById(user.id, params.entryId as string);
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content);
          setMood(entry.mood);
          setTags(entry.tags.join(', '));
          setEntryId(entry.id);
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      }
    };

    loadEntry();
  }, [params.entryId, user?.id]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);

    try {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const moodScore = MOOD_VALUES[mood];

      if (isEditing && entryId) {
        await update(entryId, {
          title,
          content,
          mood,
          mood_score: moodScore,
          tags: tagArray,
        });
      } else {
        await create({
          title,
          content,
          mood,
          mood_score: moodScore,
          tags: tagArray,
        });
      }

      track('journal_entry_saved', {
        mood,
        isEditing,
        wordCount: content.split(/\s+/).length,
      });

      Alert.alert('Success', isEditing ? 'Entry updated!' : 'Entry saved!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
      console.error('Save entry error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={[styles.input, styles.titleInput]}
              placeholder="Entry title..."
              placeholderTextColor={colors.dark.text.muted}
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="What's on your mind? Write about your trading..."
              placeholderTextColor={colors.dark.text.muted}
              value={content}
              onChangeText={setContent}
              multiline
              editable={!loading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((moodOption) => (
                <TouchableOpacity
                  key={moodOption}
                  style={[
                    styles.moodButton,
                    mood === moodOption && styles.moodButtonActive,
                  ]}
                  onPress={() => setMood(moodOption)}
                >
                  <Text style={styles.moodEmoji}>
                    {MOOD_EMOJIS[moodOption]}
                  </Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      mood === moodOption && styles.moodLabelActive,
                    ]}
                  >
                    {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.tagInput}
              placeholder="E.g. revenge trading, risk management"
              placeholderTextColor={colors.dark.text.muted}
              value={tags}
              onChangeText={setTags}
              editable={!loading}
            />
          </View>

          <View style={styles.buttons}>
            <Button
              title={isEditing ? 'Update Entry' : 'Save Entry'}
              onPress={handleSave}
              loading={loading}
              size="lg"
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
