import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useJournal } from '../../hooks/useJournal';
import { useAnalytics } from '../../hooks/useAnalytics';
import { JournalCard } from '../../components/JournalCard';
import { colors, spacing, typography } from '../../constants/theme';

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
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.dark.text.tertiary,
    textAlign: 'center',
  } as TextStyle,
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.muted,
    marginTop: spacing[2],
    textAlign: 'center',
  } as TextStyle,
  addButton: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: typography.sizes['2xl'],
    color: colors.dark.bg.primary,
  } as TextStyle,
});

export default function JournalScreen() {
  const router = useRouter();
  const { entries, loading, refresh, delete: deleteEntry, update } = useJournal();
  const { track } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      track('screen_viewed', { screen_name: 'journal' });
      refresh();
    }, [])
  );

  const handleAddEntry = () => {
    router.push('/journal-entry');
  };

  const handleEntryPress = (entryId: string) => {
    router.push({
      pathname: '/journal-entry',
      params: { entryId },
    });
  };

  const handleToggleFavorite = async (entryId: string, isFavorite: boolean) => {
    await update(entryId, { is_favorite: !isFavorite });
  };

  const renderItem = ({ item }: any) => (
    <JournalCard
      title={item.title}
      content={item.content}
      mood={item.mood}
      date={item.created_at}
      isFavorite={item.is_favorite}
      onPress={() => handleEntryPress(item.id)}
      onFavoritePress={() => handleToggleFavorite(item.id, item.is_favorite)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No journal entries yet</Text>
      <Text style={styles.emptySubtext}>Start journaling to track your trading psychology</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>

      {entries.length === 0 && !loading ? (
        renderEmpty()
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          onEndReached={() => {}}
          onEndReachedThreshold={0.5}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
