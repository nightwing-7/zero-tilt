import { supabase } from './supabase';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  requirement: number;
  points: number;
  created_at: string;
}

export interface MilestoneUnlock {
  id: string;
  user_id: string;
  milestone_id: string;
  progress: number;
  unlocked_at: string | null;
  created_at: string;
}

export async function getMilestones(): Promise<Milestone[]> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('points', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }
}

export async function getMilestoneUnlocks(userId: string): Promise<MilestoneUnlock[]> {
  try {
    const { data, error } = await supabase
      .from('milestone_unlocks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching milestone unlocks:', error);
    return [];
  }
}

export async function getMilestoneUnlock(
  userId: string,
  milestoneId: string
): Promise<MilestoneUnlock | null> {
  try {
    const { data, error } = await supabase
      .from('milestone_unlocks')
      .select('*')
      .eq('user_id', userId)
      .eq('milestone_id', milestoneId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching milestone unlock:', error);
    return null;
  }
}

export async function updateMilestoneProgress(
  userId: string,
  milestoneId: string,
  progress: number
): Promise<MilestoneUnlock | null> {
  try {
    const existing = await getMilestoneUnlock(userId, milestoneId);

    if (existing) {
      const { data, error } = await supabase
        .from('milestone_unlocks')
        .update({
          progress,
          unlocked_at: progress >= 100 ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data || null;
    } else {
      const { data, error } = await supabase
        .from('milestone_unlocks')
        .insert({
          user_id: userId,
          milestone_id: milestoneId,
          progress,
          unlocked_at: progress >= 100 ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data || null;
    }
  } catch (error) {
    console.error('Error updating milestone progress:', error);
    return null;
  }
}

export async function calculateProgress(
  userId: string,
  stats: {
    streakDays: number;
    journalEntries: number;
    urgesResisted: number;
    totalUrges: number;
    pledgesSigned: number;
    breathingSessions: number;
  }
): Promise<void> {
  try {
    const milestones = await getMilestones();

    for (const milestone of milestones) {
      let progress = 0;

      switch (milestone.category) {
        case 'Streaks':
          progress = Math.min((stats.streakDays / milestone.requirement) * 100, 100);
          break;
        case 'Journaling':
          progress = Math.min(
            (stats.journalEntries / milestone.requirement) * 100,
            100
          );
          break;
        case 'Discipline':
          if (stats.totalUrges > 0) {
            progress = Math.min(
              (stats.urgesResisted / (milestone.requirement / 100)) * 100,
              100
            );
          }
          break;
        case 'Psychology':
          progress = Math.min(
            (stats.breathingSessions / milestone.requirement) * 100,
            100
          );
          break;
        case 'Community':
          progress = Math.min(
            (stats.pledgesSigned / milestone.requirement) * 100,
            100
          );
          break;
      }

      if (progress > 0) {
        await updateMilestoneProgress(userId, milestone.id, Math.floor(progress));
      }
    }
  } catch (error) {
    console.error('Error calculating progress:', error);
  }
}

export async function getUnlockedMilestones(userId: string): Promise<Milestone[]> {
  try {
    const unlocks = await getMilestoneUnlocks(userId);
    const unlockedIds = unlocks
      .filter((unlock) => unlock.unlocked_at !== null)
      .map((unlock) => unlock.milestone_id);

    const allMilestones = await getMilestones();
    return allMilestones.filter((milestone) => unlockedIds.includes(milestone.id));
  } catch (error) {
    console.error('Error fetching unlocked milestones:', error);
    return [];
  }
}
