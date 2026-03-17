import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostDetail } from '../hooks/useCommunity';
import { Comment } from '../services/community';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { post, comments, loading, addComment, removeComment } = usePostDetail(id || '');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    await addComment(commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.author_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{item.author_name || 'Trader'}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(item.created_at)}</Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Post not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.postSection}>
              <View style={styles.postAuthorRow}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarTextLarge}>
                    {post.author_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.postAuthor}>{post.author_name || 'Trader'}</Text>
                  <Text style={styles.postTime}>{getTimeAgo(post.created_at)}</Text>
                </View>
              </View>

              {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postStats}>
                <Text style={styles.statText}>❤️ {post.likes_count}</Text>
                <Text style={styles.statText}>💬 {comments.length}</Text>
              </View>

              <View style={styles.commentsDivider}>
                <Text style={styles.commentsTitle}>
                  Comments ({comments.length})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor={colors.dark.text.muted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || submitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backButton: { color: colors.accent.teal, fontSize: typography.sizes.base },
  loadingText: { color: colors.dark.text.tertiary, textAlign: 'center', marginTop: spacing[10] },
  listContent: { padding: spacing[4] },
  postSection: { marginBottom: spacing[4] },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  avatarLarge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.teal, alignItems: 'center', justifyContent: 'center' },
  avatarTextLarge: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any },
  postAuthor: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any },
  postTime: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  postTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary, marginBottom: spacing[2] },
  postContent: { color: colors.dark.text.secondary, fontSize: typography.sizes.base, lineHeight: 24 },
  postStats: { flexDirection: 'row', gap: spacing[4], marginTop: spacing[4] },
  statText: { color: colors.dark.text.tertiary, fontSize: typography.sizes.sm },
  commentsDivider: { marginTop: spacing[4], paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: colors.dark.border },
  commentsTitle: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any, fontSize: typography.sizes.lg },
  commentCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.dark.bg.tertiary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.dark.text.secondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold as any },
  commentMeta: {},
  commentAuthor: { color: colors.dark.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium as any },
  commentTime: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  commentContent: { color: colors.dark.text.secondary, fontSize: typography.sizes.sm, lineHeight: 20 },
  emptyComments: { alignItems: 'center', paddingVertical: spacing[6] },
  emptyText: { color: colors.dark.text.muted },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    backgroundColor: colors.dark.bg.secondary,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.dark.text.primary,
    maxHeight: 100,
    fontSize: typography.sizes.sm,
  },
  sendButton: {
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: '#fff', fontWeight: typography.weights.semibold as any, fontSize: typography.sizes.sm },
});
