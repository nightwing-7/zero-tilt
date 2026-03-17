import { supabase } from './supabase';

export interface Pod {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  max_members: number;
  member_count: number;
  is_public: boolean;
  trading_style: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PodMember {
  id: string;
  pod_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  // Joined fields
  trader_name?: string;
  avatar_url?: string;
  streak_days?: number;
}

export async function getPublicPods(limit = 20): Promise<Pod[]> {
  try {
    const { data, error } = await supabase
      .from('pods')
      .select('*')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching public pods:', error);
    return [];
  }
}

export async function getUserPods(userId: string): Promise<Pod[]> {
  try {
    const { data, error } = await supabase
      .from('pod_members')
      .select(`
        pod_id,
        role,
        pods:pod_id (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((pm: any) => ({
      ...pm.pods,
      userRole: pm.role,
    }));
  } catch (error) {
    console.error('Error fetching user pods:', error);
    return [];
  }
}

export async function getPod(podId: string): Promise<Pod | null> {
  try {
    const { data, error } = await supabase
      .from('pods')
      .select('*')
      .eq('id', podId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching pod:', error);
    return null;
  }
}

export async function createPod(
  userId: string,
  pod: {
    name: string;
    description?: string;
    is_public?: boolean;
    max_members?: number;
    trading_style?: string;
  }
): Promise<Pod | null> {
  try {
    const { data: newPod, error: podError } = await supabase
      .from('pods')
      .insert({
        name: pod.name,
        description: pod.description || null,
        is_public: pod.is_public ?? true,
        max_members: pod.max_members || 8,
        member_count: 1,
        trading_style: pod.trading_style || null,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (podError) throw podError;

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('pod_members')
      .insert({
        pod_id: newPod.id,
        user_id: userId,
        role: 'owner',
        joined_at: new Date().toISOString(),
      });

    if (memberError) throw memberError;
    return newPod;
  } catch (error) {
    console.error('Error creating pod:', error);
    return null;
  }
}

export async function joinPod(
  podId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if pod is full
    const { data: pod } = await supabase
      .from('pods')
      .select('member_count, max_members')
      .eq('id', podId)
      .single();

    if (pod && pod.member_count >= pod.max_members) {
      throw new Error('Pod is full');
    }

    const { error } = await supabase
      .from('pod_members')
      .insert({
        pod_id: podId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error joining pod:', error);
    return false;
  }
}

export async function leavePod(
  podId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pod_members')
      .delete()
      .eq('pod_id', podId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error leaving pod:', error);
    return false;
  }
}

export async function getPodMembers(podId: string): Promise<PodMember[]> {
  try {
    const { data, error } = await supabase
      .from('pod_members')
      .select(`
        *,
        profiles:user_id (trader_name, avatar_url),
        streaks:user_id (days, is_active)
      `)
      .eq('pod_id', podId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((member: any) => ({
      ...member,
      trader_name: member.profiles?.trader_name,
      avatar_url: member.profiles?.avatar_url,
      streak_days: member.streaks?.find((s: any) => s.is_active)?.days || 0,
    }));
  } catch (error) {
    console.error('Error fetching pod members:', error);
    return [];
  }
}

export async function getPodLeaderboard(podId: string): Promise<PodMember[]> {
  try {
    const members = await getPodMembers(podId);
    return members.sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0));
  } catch (error) {
    console.error('Error fetching pod leaderboard:', error);
    return [];
  }
}

export async function getGlobalLeaderboard(limit = 20): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select(`
        user_id,
        start_date,
        profiles:user_id (trader_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;

    const now = new Date();
    return (data || []).map((streak: any) => {
      const startDate = new Date(streak.start_date);
      const days = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        user_id: streak.user_id,
        trader_name: streak.profiles?.trader_name || 'Trader',
        avatar_url: streak.profiles?.avatar_url,
        streak_days: days,
      };
    }).sort((a: any, b: any) => b.streak_days - a.streak_days);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return [];
  }
}
