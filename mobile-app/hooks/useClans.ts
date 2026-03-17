import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import {
  Pod,
  PodMember,
  getPublicPods,
  getUserPods,
  getPod,
  createPod,
  joinPod,
  leavePod,
  getPodMembers,
  getPodLeaderboard,
  getGlobalLeaderboard,
} from '../services/clans';

export function useClans() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [myPods, setMyPods] = useState<Pod[]>([]);
  const [publicPods, setPublicPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPods = useCallback(async () => {
    if (!user) return;
    try {
      const [myData, publicData] = await Promise.all([
        getUserPods(user.id),
        getPublicPods(),
      ]);
      setMyPods(myData);
      setPublicPods(publicData);
    } catch (error) {
      console.error('Error loading pods:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPods();
  }, [loadPods]);

  const createNewPod = useCallback(async (pod: {
    name: string;
    description?: string;
    is_public?: boolean;
    max_members?: number;
    trading_style?: string;
  }) => {
    if (!user) return null;
    const newPod = await createPod(user.id, pod);
    if (newPod) {
      track('pod_created', {
        is_public: pod.is_public ?? true,
        max_members: pod.max_members || 8,
      });
      await loadPods();
    }
    return newPod;
  }, [user, track, loadPods]);

  const join = useCallback(async (podId: string) => {
    if (!user) return false;
    const success = await joinPod(podId, user.id);
    if (success) {
      const pod = publicPods.find(p => p.id === podId);
      track('pod_joined', {
        pod_id: podId,
        member_count: (pod?.member_count || 0) + 1,
      });
      await loadPods();
    }
    return success;
  }, [user, publicPods, track, loadPods]);

  const leave = useCallback(async (podId: string) => {
    if (!user) return false;
    const success = await leavePod(podId, user.id);
    if (success) {
      track('pod_left', { pod_id: podId });
      await loadPods();
    }
    return success;
  }, [user, track, loadPods]);

  return {
    myPods,
    publicPods,
    loading,
    refresh: loadPods,
    createNewPod,
    join,
    leave,
  };
}

export function usePodDetail(podId: string) {
  const [pod, setPod] = useState<Pod | null>(null);
  const [members, setMembers] = useState<PodMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<PodMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [podData, membersData, leaderData] = await Promise.all([
        getPod(podId),
        getPodMembers(podId),
        getPodLeaderboard(podId),
      ]);
      setPod(podData);
      setMembers(membersData);
      setLeaderboard(leaderData);
      setLoading(false);
    }
    load();
  }, [podId]);

  return { pod, members, leaderboard, loading };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getGlobalLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    }
    load();
  }, []);

  return { leaderboard, loading };
}
