import { supabase } from './supabase';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_custom: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GoalCheckin {
  id: string;
  goal_id: string;
  user_id: string;
  checked_date: string;
  created_at: string;
}

export const DEFAULT_GOALS = [
  { title: 'Follow my trading plan', icon: '📋', color: '#14b8a6' },
  { title: 'Honor my stop losses', icon: '🛑', color: '#ef4444' },
  { title: 'Journal before trading', icon: '📔', color: '#3b82f6' },
  { title: 'Take breaks between trades', icon: '☕', color: '#f59e0b' },
  { title: 'Review my rules daily', icon: '📖', color: '#a855f7' },
  { title: 'No revenge trading', icon: '🧘', color: '#10b981' },
  { title: 'Limit screen time', icon: '⏰', color: '#6366f1' },
  { title: 'Practice mindfulness', icon: '🧠', color: '#ec4899' },
];

export async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

export async function createGoal(
  userId: string,
  goal: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    is_custom?: boolean;
  }
): Promise<Goal | null> {
  try {
    // Get current max sort order
    const { data: existing } = await supabase
      .from('goals')
      .select('sort_order')
      .eq('user_id', userId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order || 0) + 1;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goal.title,
        description: goal.description || null,
        icon: goal.icon || '🎯',
        color: goal.color || '#14b8a6',
        is_custom: goal.is_custom ?? true,
        is_active: true,
        sort_order: nextOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', goalId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
}

export async function toggleGoalCheckin(
  goalId: string,
  userId: string,
  date: string
): Promise<boolean> {
  try {
    // Check if already checked in
    const { data: existing } = await supabase
      .from('goal_checkins')
      .select('id')
      .eq('goal_id', goalId)
      .eq('checked_date', date)
      .single();

    if (existing) {
      // Uncheck
      const { error } = await supabase
        .from('goal_checkins')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return false; // now unchecked
    } else {
      // Check in
      const { error } = await supabase
        .from('goal_checkins')
        .insert({
          goal_id: goalId,
          user_id: userId,
          checked_date: date,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true; // now checked
    }
  } catch (error) {
    console.error('Error toggling goal checkin:', error);
    return false;
  }
}

export async function getGoalCheckinsForDate(
  userId: string,
  date: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('goal_checkins')
      .select('goal_id')
      .eq('user_id', userId)
      .eq('checked_date', date);

    if (error) throw error;
    return (data || []).map((c: any) => c.goal_id);
  } catch (error) {
    console.error('Error fetching goal checkins:', error);
    return [];
  }
}

export async function getWeeklyGoalProgress(
  userId: string
): Promise<{ totalGoals: number; completedDays: number; completionRate: number }> {
  try {
    const goals = await getUserGoals(userId);
    if (goals.length === 0) {
      return { totalGoals: 0, completedDays: 0, completionRate: 0 };
    }

    // Get checkins for the past 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('goal_checkins')
      .select('checked_date, goal_id')
      .eq('user_id', userId)
      .gte('checked_date', weekAgo.toISOString().split('T')[0]);

    if (error) throw error;

    // Count days where all goals were completed
    const checkinsByDate: Record<string, Set<string>> = {};
    (data || []).forEach((c: any) => {
      if (!checkinsByDate[c.checked_date]) {
        checkinsByDate[c.checked_date] = new Set();
      }
      checkinsByDate[c.checked_date].add(c.goal_id);
    });

    const completedDays = Object.values(checkinsByDate).filter(
      (goalSet) => goalSet.size >= goals.length
    ).length;

    return {
      totalGoals: goals.length,
      completedDays,
      completionRate: Math.round((completedDays / 7) * 100),
    };
  } catch (error) {
    console.error('Error fetching weekly goal progress:', error);
    return { totalGoals: 0, completedDays: 0, completionRate: 0 };
  }
}

// Setup default goals for new user
export async function setupDefaultGoals(
  userId: string,
  selectedGoals: string[]
): Promise<void> {
  try {
    const goalsToCreate = DEFAULT_GOALS
      .filter((g) => selectedGoals.includes(g.title))
      .map((g, index) => ({
        user_id: userId,
        title: g.title,
        icon: g.icon,
        color: g.color,
        is_custom: false,
        is_active: true,
        sort_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    if (goalsToCreate.length > 0) {
      const { error } = await supabase
        .from('goals')
        .insert(goalsToCreate);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error setting up default goals:', error);
  }
}
