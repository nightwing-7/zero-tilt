import { supabase } from './supabase';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  // Joined fields
  friend_name?: string;
  friend_avatar?: string;
  friend_id?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined
  sender_name?: string;
  sender_avatar?: string;
}

export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return false;
  }
}

export async function acceptFriendRequest(
  friendshipId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', friendshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
}

export async function rejectFriendRequest(
  friendshipId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }
}

export async function removeFriend(
  friendshipId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
}

export async function getFriends(userId: string): Promise<Friendship[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id (id, trader_name, avatar_url),
        addressee:addressee_id (id, trader_name, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) throw error;

    return (data || []).map((f: any) => {
      const isRequester = f.requester_id === userId;
      const friend = isRequester ? f.addressee : f.requester;
      return {
        ...f,
        friend_id: friend?.id,
        friend_name: friend?.trader_name,
        friend_avatar: friend?.avatar_url,
      };
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

export async function getPendingRequests(userId: string): Promise<Friendship[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:requester_id (id, trader_name, avatar_url)
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return (data || []).map((f: any) => ({
      ...f,
      friend_id: f.requester?.id,
      friend_name: f.requester?.trader_name,
      friend_avatar: f.requester?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

// Direct Messages - using Supabase Realtime
// Note: DM table doesn't exist in schema yet - using a simple approach
// In production, this would be a dedicated messages table or use Supabase Realtime channels

export async function getConversations(userId: string): Promise<any[]> {
  try {
    const friends = await getFriends(userId);
    // Return friends as conversation list
    return friends.map(f => ({
      friendshipId: f.id,
      friendId: f.friend_id,
      friendName: f.friend_name,
      friendAvatar: f.friend_avatar,
      lastMessage: null,
      unreadCount: 0,
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function searchUsers(
  query: string,
  currentUserId: string,
  limit = 20
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, trader_name, avatar_url')
      .neq('id', currentUserId)
      .ilike('trader_name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
