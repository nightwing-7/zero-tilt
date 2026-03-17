import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  Friendship,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getConversations,
  searchUsers,
} from '../services/friendships';

export function useFriends() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [friendsData, pendingData, convData] = await Promise.all([
        getFriends(user.id),
        getPendingRequests(user.id),
        getConversations(user.id),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
      setConversations(convData);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sendRequest = useCallback(async (addresseeId: string) => {
    if (!user) return false;
    const success = await sendFriendRequest(user.id, addresseeId);
    if (success) {
      track('friend_request_sent');
    }
    return success;
  }, [user, track]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    const success = await acceptFriendRequest(friendshipId);
    if (success) {
      track('friend_request_accepted');
      await loadAll();
    }
    return success;
  }, [track, loadAll]);

  const rejectRequest = useCallback(async (friendshipId: string) => {
    const success = await rejectFriendRequest(friendshipId);
    if (success) {
      await loadAll();
    }
    return success;
  }, [loadAll]);

  const remove = useCallback(async (friendshipId: string) => {
    const success = await removeFriend(friendshipId);
    if (success) {
      await loadAll();
    }
    return success;
  }, [loadAll]);

  const search = useCallback(async (query: string) => {
    if (!user || query.length < 2) return [];
    return searchUsers(query, user.id);
  }, [user]);

  return {
    friends,
    pendingRequests,
    conversations,
    loading,
    refresh: loadAll,
    sendRequest,
    acceptRequest,
    rejectRequest,
    remove,
    search,
  };
}
