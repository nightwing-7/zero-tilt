import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFriends } from '../hooks/useFriends';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function FriendsScreen() {
  const router = useRouter();
  const {
    friends,
    pendingRequests,
    loading,
    refresh,
    acceptRequest,
    rejectRequest,
    remove,
    search,
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await search(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleRemoveFriend = (friendshipId: string, name: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => remove(friendshipId) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabs}>
        {(['friends', 'requests', 'search'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'friends' ? `Friends (${friends.length})` :
               t === 'requests' ? `Requests (${pendingRequests.length})` : 'Search'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'friends' && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendCard}
              onPress={() => router.push(`/social-profile?userId=${item.friend_id}`)}
            >
              <View style={styles.friendAvatar}>
                <Text style={styles.avatarText}>
                  {item.friend_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.friendName}>{item.friend_name || 'Trader'}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveFriend(item.id, item.friend_name || 'this friend')}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>No friends yet. Search for traders to connect!</Text>
            </View>
          }
        />
      )}

      {tab === 'requests' && (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <View style={styles.friendAvatar}>
                <Text style={styles.avatarText}>
                  {item.friend_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.friendName}>{item.friend_name || 'Trader'}</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptRequest(item.id)}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => rejectRequest(item.id)}
                >
                  <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          }
        />
      )}

      {tab === 'search' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by trader name..."
            placeholderTextColor={colors.dark.text.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendCard}
                onPress={() => router.push(`/social-profile?userId=${item.id}`)}
              >
                <View style={styles.friendAvatar}>
                  <Text style={styles.avatarText}>
                    {item.trader_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={styles.friendName}>{item.trader_name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery.length >= 2 && !searching ? (
                <Text style={styles.noResults}>No traders found</Text>
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: { color: colors.accent.teal },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] },
  tab: { flex: 1, paddingVertical: spacing[2], borderRadius: borderRadius.full, backgroundColor: colors.dark.bg.secondary, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent.teal },
  tabText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  tabTextActive: { color: '#fff', fontWeight: typography.weights.semibold as any },
  listContent: { padding: spacing[4] },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  friendAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: typography.weights.bold as any },
  friendName: { flex: 1, color: colors.dark.text.primary, fontWeight: typography.weights.medium as any },
  removeText: { color: colors.accent.red, fontSize: typography.sizes.sm },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  requestActions: { flexDirection: 'row', gap: spacing[2] },
  acceptButton: { backgroundColor: colors.accent.teal, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  acceptText: { color: '#fff', fontSize: typography.sizes.sm },
  rejectButton: { backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  rejectText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  emptyState: { alignItems: 'center', paddingVertical: spacing[8] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing[2] },
  emptyText: { color: colors.dark.text.muted, textAlign: 'center' },
  searchContainer: { flex: 1 },
  searchInput: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  },
  noResults: { color: colors.dark.text.muted, textAlign: 'center', marginTop: spacing[4] },
});
