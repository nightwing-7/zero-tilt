import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Card } from './ui/Card';
import { colors, spacing, typography } from '../constants/theme';
import { formatDate, getRelativeTime } from '../utils/dates';
import { truncateText } from '../utils/formatting';

const moodEmojis: Record<string, string> = {
  terrible: '😢',
  poor: '😟',
  neutral: '😐',
  good: '🙂',
  excellent: '🤩',
};

interface JournalCardProps {
  title: string;
  content: string;
  mood: 'terrible' | 'poor' | 'neutral' | 'good' | 'excellent';
  date: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.dark.text.primary,
    marginBottom: spacing[1],
  } as TextStyle,
  moodDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  moodEmoji: {
    fontSize: typography.sizes.lg,
  } as TextStyle,
  date: {
    fontSize: typography.sizes.xs,
    color: colors.dark.text.tertiary,
  } as TextStyle,
  favoriteButton: {
    padding: spacing[2],
  },
  favoriteIcon: {
    fontSize: typography.sizes.lg,
  } as TextStyle,
  content: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  } as TextStyle,
  contentWrapper: {
    marginBottom: spacing[2],
  },
});

export function JournalCard({
  title,
  content,
  mood,
  date,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: JournalCardProps) {
  const contentPreview = truncateText(content, 100);
  const moodEmoji = moodEmojis[mood] || '😐';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.moodDate}>
              <Text style={styles.moodEmoji}>{moodEmoji}</Text>
              <Text style={styles.date}>{getRelativeTime(date)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '♥️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.content} numberOfLines={3}>
            {contentPreview}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
