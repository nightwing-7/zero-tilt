import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useClans, useLeaderboard } from '../hooks/useClans';
import { Pod } from '../services/clans';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function ClansScreen() {
  const router = useRouter();
  const { myPods, publicPods, loading, refresh, createNewPod, join, leave } = useClans();
  const { leaderboard } = useLeaderboard();
  const [tab, setTab] = useState<'my' | 'explore' | 'leaderboard'>('my');
  const [showCreate, setShowCreate] = useState(false);
  const [newPodName, setNewPodName] = useState('');
  const [newPodDesc, setNewPodDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreatePod = async () => {
    if (!newPodName.trim()) return;
    setCreating(true);
    const pod = await createNewPod({
      name: newPodName.trim(),
      description: newPodDesc.trim() || undefined,
    });
    if (pod) {
      setShowCreate(false);
      setNewPodName('');
      setNewPodDesc('');
    }
    setCreating(false);
  };

  const handleJoin = async (podId: string) => {
    const success = await join(podId);
    if (!success) {
      Alert.alert('Could not join', 'This clan may be full.');
    }
  };

  const handleLeave = (podId: string, name: string) => {
    Alert.alert('Leave Clan', `Are you sure you want to leave "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leave(podId) },
    ]);
  };

  const renderPod = (pod: Pod, isMember: boolean) => (
    <TouchableOpacity
      key={pod.id}
      style={styles.podCard}
    >
      <View style={styles.podHeader}>
        <Text style={styles.podName}>{pod.name}</Text>
        <Text style={styles.podMembers}>{pod.member_count}/{pod.max_members}</Text>
      </View>
      {pod.description && <Text style={styles.podDesc}>{pod.description}</Text>}
      {pod.trading_style && (
        <Text style={styles.podStyle}>{pod.trading_style}</Text>
      )}
      <View style={styles.podActions}>
        {isMember ? (
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={() => handleLeave(pod.id, pod.name)}
          >
            <Text style={styles.leaveText}>Leave</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoin(pod.id)}
          >
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clans</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={styles.createButton}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['my', 'explore', 'leaderboard'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'my' ? `My Clans (${myPods.length})` :
               t === 'explore' ? 'Explore' : 'Leaderboard'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'my' && (
        <FlatList
          data={myPods}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => renderPod(item, true)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏰</Text>
              <Text style={styles.emptyTitle}>No clans yet</Text>
              <Text style={styles.emptyText}>Create or join a clan to connect with other traders</Text>
            </View>
          }
        />
      )}

      {tab === 'explore' && (
        <FlatList
          data={publicPods.filter(p => !myPods.some(mp => mp.id === p.id))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => renderPod(item, false)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No public clans available</Text>
            </View>
          }
        />
      )}

      {tab === 'leaderboard' && (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.leaderRow}
              onPress={() => router.push(`/social-profile?userId=${item.user_id}`)}
            >
              <Text style={styles.leaderRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <View style={styles.leaderAvatar}>
                <Text style={styles.avatarText}>
                  {item.trader_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.leaderName}>{item.trader_name}</Text>
              <Text style={styles.leaderStreak}>{item.streak_days}d 🔥</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Leaderboard loading...</Text>
            </View>
          }
        />
      )}

      {/* Create Pod Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Clan</Text>
            <TouchableOpacity
              onPress={handleCreatePod}
              disabled={!newPodName.trim() || creating}
            >
              <Text style={[styles.modalCreate, (!newPodName.trim() || creating) && { opacity: 0.4 }]}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Clan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., NQ Scalpers"
              placeholderTextColor={colors.dark.text.muted}
              value={newPodName}
              onChangeText={setNewPodName}
            />

            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="What's this clan about?"
              placeholderTextColor={colors.dark.text.muted}
              value={newPodDesc}
              onChangeText={setNewPodDesc}
              multiline
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  createButton: { color: colors.accent.teal, fontWeight: typography.weights.semibold as any },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] },
  tab: { flex: 1, paddingVertical: spacing[2], borderRadius: borderRadius.full, backgroundColor: colors.dark.bg.secondary, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent.teal },
  tabText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.xs },
  tabTextActive: { color: '#fff', fontWeight: typography.weights.semibold as any },
  listContent: { padding: spacing[4] },
  podCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  podHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  podName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any, color: colors.dark.text.primary },
  podMembers: { color: colors.dark.text.muted, fontSize: typography.sizes.sm },
  podDesc: { color: colors.dark.text.secondary, marginBottom: spacing[2] },
  podStyle: { color: colors.accent.teal, fontSize: typography.sizes.sm, marginBottom: spacing[2] },
  podActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  joinButton: { backgroundColor: colors.accent.teal, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.full },
  joinText: { color: '#fff', fontWeight: typography.weights.semibold as any, fontSize: typography.sizes.sm },
  leaveButton: { backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.full },
  leaveText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  leaderRank: { fontSize: 20, width: 30, textAlign: 'center' },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: typography.weights.bold as any, fontSize: typography.sizes.sm },
  leaderName: { flex: 1, color: colors.dark.text.primary, fontWeight: typography.weights.medium as any },
  leaderStreak: { color: colors.accent.amber, fontWeight: typography.weights.bold as any },
  emptyState: { alignItems: 'center', paddingVertical: spacing[8] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing[2] },
  emptyTitle: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any, marginBottom: spacing[1] },
  emptyText: { color: colors.dark.text.muted, textAlign: 'center' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.dark.bg.primary },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  modalCancel: { color: colors.dark.text.tertiary },
  modalTitle: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any },
  modalCreate: { color: colors.accent.teal, fontWeight: typography.weights.semibold as any },
  modalBody: { padding: spacing[4] },
  inputLabel: { color: colors.dark.text.secondary, fontWeight: typography.weights.semibold as any, marginBottom: spacing[2], marginTop: spacing[3] },
  input: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
});
