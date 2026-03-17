import { supabase } from './supabase';

export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  category: 'general' | 'wins' | 'struggles' | 'strategies' | 'questions';
  is_anonymous: boolean;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_avatar?: string;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_avatar?: string;
}

export async function getCommunityFeed(
  category?: string,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (trader_name, avatar_url)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((post: any) => ({
      ...post,
      author_name: post.is_anonymous ? 'Anonymous Trader' : post.profiles?.trader_name,
      author_avatar: post.is_anonymous ? null : post.profiles?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching community feed:', error);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (trader_name, avatar_url)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;

    return data ? {
      ...data,
      author_name: data.is_anonymous ? 'Anonymous Trader' : data.profiles?.trader_name,
      author_avatar: data.is_anonymous ? null : data.profiles?.avatar_url,
    } : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function createPost(
  userId: string,
  post: {
    title?: string;
    content: string;
    category: Post['category'];
    is_anonymous?: boolean;
  }
): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: post.title || null,
        content: post.content,
        category: post.category,
        is_anonymous: post.is_anonymous || false,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

export async function togglePostLike(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return false; // now unliked
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true; // now liked
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return false;
  }
}

export async function getPostComments(
  postId: string,
  limit = 50
): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (trader_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((comment: any) => ({
      ...comment,
      author_name: comment.profiles?.trader_name,
      author_avatar: comment.profiles?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function createComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
}

export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

export async function checkIfLiked(
  postIds: string[],
  userId: string
): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error) throw error;
    return new Set((data || []).map((l: any) => l.post_id));
  } catch (error) {
    console.error('Error checking likes:', error);
    return new Set();
  }
}

export async function reportPost(
  postId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  try {
    // For now, log the report as an analytics event
    // In production, this would go to a moderation queue table
    console.log('Post reported:', { postId, userId, reason });
    return true;
  } catch (error) {
    console.error('Error reporting post:', error);
    return false;
  }
}

export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .upsert({
        requester_id: userId,
        addressee_id: blockedUserId,
        status: 'blocked',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
}
