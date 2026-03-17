import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCommunity } from '../../hooks/useCommunity';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Post } from '../../services/community';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'wins', label: 'Wins' },
  { key: 'struggles', label: 'Struggles' },
  { key: 'strategies', label: 'Strategies' },
  { key: 'questions', label: 'Questions' },
  { key: 'general', label: 'General' },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  wins: '🏆',
  struggles: '💪',
  strategies: '📊',
  questions: '❓',
  general: '💬',
};

export default function CommunityScreen() {
  const router = useRouter();
  const { track } = useAnalytics();
  const {
    posts,
    loading,
    refreshing,
    category,
    likedPostIds,
    refresh,
    changeCategory,
    publishPost,
    likePost,
    report,
  } = useCommunity();

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Post['category']>('general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  React.useEffect(() => {
    track('community_opened', { active_tab: 'forum' });
  }, []);

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) return;

    setPosting(true);
    const post = await publishPost({
      title: newPostTitle.trim() || undefined,
      content: newPostContent.trim(),
      category: newPostCategory,
      is_anonymous: isAnonymous,
    });

    if (post) {
      setShowNewPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      setIsAnonymous(false);
    }
    setPosting(false);
  };

  const handleReport = (postId: string) => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Spam', onPress: () => report(postId, 'spam') },
        { text: 'Inappropriate', onPress: () => report(postId, 'inappropriate') },
        { text: 'Harassment', onPress: () => report(postId, 'harassment') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = likedPostIds.has(item.id);
    const timeAgo = getTimeAgo(item.created_at);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => router.push(`/post-detail?id=${item.id}`)}
        onLongPress={() => handleReport(item.id)}
      >
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.author_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.author_name || 'Trader'}</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORY_EMOJIS[item.category] || ''} {item.category}
            </Text>
          </View>
        </View>

        {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
        <Text style={styles.postContent} numberOfLines={4}>
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => likePost(item.id)}
          >
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {isLiked ? '❤️' : '🤍'} {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>
              💬 {item.comments_count}
            </Text>
          </TouchableOpacity>
        </View>

        {item.is_pinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 Pinned</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setShowNewPost(true)}
        >
          <Text style={styles.newPostButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryTab,
              category === cat.key && styles.categoryTabActive,
            ]}
            onPress={() => changeCategory(cat.key)}
          >
            <Text
              style={[
                styles.categoryTabText,
                category === cat.key && styles.categoryTabTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent.teal}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share your journey!</Text>
          </View>
        }
      />

      {/* New Post Modal */}
      <Modal visible={showNewPost} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNewPost(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Post</Text>
              <TouchableOpacity
                onPress={handleSubmitPost}
                disabled={!newPostContent.trim() || posting}
              >
                <Text style={[
                  styles.modalPost,
                  (!newPostContent.trim() || posting) && styles.modalPostDisabled,
                ]}>
                  {posting ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title (optional)"
                placeholderTextColor={colors.dark.text.muted}
                value={newPostTitle}
                onChangeText={setNewPostTitle}
              />
              <TextInput
                style={styles.contentInput}
                placeholder="Share your thoughts, wins, or questions..."
                placeholderTextColor={colors.dark.text.muted}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.labelText}>Category</Text>
              <View style={styles.categoryPicker}>
                {CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryOption,
                      newPostCategory === cat.key && styles.categoryOptionActive,
                    ]}
                    onPress={() => setNewPostCategory(cat.key as Post['category'])}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newPostCategory === cat.key && styles.categoryOptionTextActive,
                    ]}>
                      {CATEGORY_EMOJIS[cat.key]} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <Text style={styles.anonymousCheckbox}>
                  {isAnonymous ? '☑️' : '⬜️'}
                </Text>
                <Text style={styles.anonymousText}>Post anonymously</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
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
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.dark.text.primary,
  },
  newPostButton: {
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  newPostButtonText: {
    color: '#fff',
    fontWeight: typography.weights.semibold as any,
    fontSize: typography.sizes.sm,
  },
  categoryScroll: { maxHeight: 48 },
  categoryContainer: { paddingHorizontal: spacing[4], gap: spacing[2] },
  categoryTab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.bg.secondary,
  },
  categoryTabActive: { backgroundColor: colors.accent.teal },
  categoryTabText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  categoryTabTextActive: { color: '#fff', fontWeight: typography.weights.semibold as any },
  feedContainer: { padding: spacing[4], gap: spacing[3] },
  postCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: typography.weights.bold as any },
  authorName: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any, fontSize: typography.sizes.sm },
  timeAgo: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  categoryBadge: {
    backgroundColor: colors.dark.bg.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  categoryText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.xs },
  postTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.dark.text.primary,
    marginBottom: spacing[1],
  },
  postContent: { color: colors.dark.text.secondary, fontSize: typography.sizes.base, lineHeight: 22 },
  postFooter: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.dark.bg.tertiary,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  actionTextActive: { color: colors.accent.red },
  pinnedBadge: { position: 'absolute', top: spacing[2], right: spacing[2] },
  pinnedText: { fontSize: typography.sizes.xs, color: colors.accent.amber },
  emptyState: { alignItems: 'center', paddingVertical: spacing[16] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing[3] },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any, color: colors.dark.text.primary },
  emptyText: { color: colors.dark.text.tertiary, marginTop: spacing[1] },
  // Modal styles
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
  modalCancel: { color: colors.dark.text.tertiary, fontSize: typography.sizes.base },
  modalTitle: { color: colors.dark.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any },
  modalPost: { color: colors.accent.teal, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold as any },
  modalPostDisabled: { opacity: 0.4 },
  modalBody: { flex: 1, padding: spacing[4] },
  titleInput: {
    fontSize: typography.sizes.lg,
    color: colors.dark.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  contentInput: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.primary,
    minHeight: 120,
    marginBottom: spacing[4],
  },
  labelText: {
    color: colors.dark.text.secondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    marginBottom: spacing[2],
  },
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  categoryOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  categoryOptionActive: { backgroundColor: colors.accent.teal, borderColor: colors.accent.teal },
  categoryOptionText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  categoryOptionTextActive: { color: '#fff' },
  anonymousToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[2] },
  anonymousCheckbox: { fontSize: 20 },
  anonymousText: { color: colors.dark.text.secondary, fontSize: typography.sizes.sm },
});
