import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  Post,
  Comment,
  getCommunityFeed,
  getPost,
  createPost,
  deletePost,
  togglePostLike,
  getPostComments,
  createComment,
  deleteComment,
  checkIfLiked,
  reportPost,
  blockUser,
} from '../services/community';

export function useCommunity() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async (cat?: string) => {
    if (!user) return;
    try {
      const feedCategory = cat || category;
      const data = await getCommunityFeed(feedCategory);

      // Check which posts the user has liked
      if (data.length > 0) {
        const liked = await checkIfLiked(
          data.map(p => p.id),
          user.id
        );
        setLikedPostIds(liked);
      }

      setPosts(data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, category]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
  }, [loadFeed]);

  const changeCategory = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setLoading(true);
    loadFeed(newCategory);
    track('community_tab_switched', { to_tab: newCategory });
  }, [loadFeed, track]);

  const publishPost = useCallback(async (post: {
    title?: string;
    content: string;
    category: Post['category'];
    is_anonymous?: boolean;
  }) => {
    if (!user) return null;

    const newPost = await createPost(user.id, post);
    if (newPost) {
      track('post_created', {
        category: post.category,
        has_title: !!post.title,
        content_length: post.content.length,
      });
      await refresh();
    }
    return newPost;
  }, [user, track, refresh]);

  const removePost = useCallback(async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
    return success;
  }, []);

  const likePost = useCallback(async (postId: string) => {
    if (!user) return;

    const isNowLiked = await togglePostLike(postId, user.id);

    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (isNowLiked) {
        next.add(postId);
        track('post_liked', { post_id: postId });
      } else {
        next.delete(postId);
        track('post_unliked', { post_id: postId });
      }
      return next;
    });

    // Update local likes count
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes_count: p.likes_count + (isNowLiked ? 1 : -1),
        };
      }
      return p;
    }));
  }, [user, track]);

  const report = useCallback(async (postId: string, reason: string) => {
    if (!user) return false;
    return reportPost(postId, user.id, reason);
  }, [user]);

  const block = useCallback(async (blockedUserId: string) => {
    if (!user) return false;
    return blockUser(user.id, blockedUserId);
  }, [user]);

  return {
    posts,
    loading,
    refreshing,
    category,
    likedPostIds,
    refresh,
    changeCategory,
    publishPost,
    removePost,
    likePost,
    report,
    block,
  };
}

export function usePostDetail(postId: string) {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getPostComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
      setLoading(false);

      track('post_viewed', {
        post_category: postData?.category,
        comment_count: commentsData.length,
      });
    }
    load();
  }, [postId, track]);

  const addComment = useCallback(async (content: string) => {
    if (!user) return null;

    const comment = await createComment(postId, user.id, content);
    if (comment) {
      setComments(prev => [...prev, {
        ...comment,
        author_name: 'You',
        author_avatar: null,
      }]);
      track('comment_created', {
        post_category: post?.category,
        comment_length: content.length,
      });
    }
    return comment;
  }, [user, postId, post, track]);

  const removeComment = useCallback(async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
    return success;
  }, []);

  return {
    post,
    comments,
    loading,
    addComment,
    removeComment,
  };
}
