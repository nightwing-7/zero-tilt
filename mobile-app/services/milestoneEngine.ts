import { supabase } from './supabase';
import { getMilestones, updateMilestoneProgress } from './milestones';
import { getCurrentStreak } from './streakEngine';
import { getUrgeHistory } from './urges';
import { getJournalEntries } from './journal';
import { getBreathingSessions } from './breathing';
import { getPledgeHistory } from './pledges';

export interface NewMilestoneUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  points: number;
}

async function getUserStats(userId: string): Promise<{
  streakDays: number;
  journalEntries: number;
  urgesResisted: number;
  totalUrges: number;
  pledgesSigned: number;
  breathingSessions: number;
}> {
  try {
    const [streakData, journalData, urgesData, breathingData, pledgesData] = await Promise.all([
      getCurrentStreak(userId),
      getJournalEntries(userId, 1000),
      getUrgeHistory(userId, 1000),
      getBreathingSessions(userId, 1000),
      getPledgeHistory(userId, 1000),
    ]);

    const urgesResisted = urgesData.filter(
      u => u.outcome === 'resisted'
    ).length;

    return {
      streakDays: streakData?.current_days || 0,
      journalEntries: journalData.length,
      urgesResisted: urgesResisted,
      totalUrges: urgesData.length,
      pledgesSigned: pledgesData.length,
      breathingSessions: breathingData.filter(b => b.completed).length,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      streakDays: 0,
      journalEntries: 0,
      urgesResisted: 0,
      totalUrges: 0,
      pledgesSigned: 0,
      breathingSessions: 0,
    };
  }
}

export async function checkAndUnlockMilestones(userId: string): Promise<NewMilestoneUnlock[]> {
  try {
    const [milestones, stats] = await Promise.all([getMilestones(), getUserStats(userId)]);

    const newlyUnlocked: NewMilestoneUnlock[] = [];

    for (const milestone of milestones) {
      let progress = 0;
      let shouldUpdate = false;

      const requirement = milestone.requirement as any;
      if (typeof requirement === 'object' && requirement !== null) {
        const target = requirement.target || 0;
        const type = requirement.type || '';

        switch (type) {
          case 'streak_days':
            progress = Math.min((stats.streakDays / target) * 100, 100);
            shouldUpdate = true;
            break;
          case 'journal_entries':
            progress = Math.min((stats.journalEntries / target) * 100, 100);
            shouldUpdate = true;
            break;
          case 'urges_resisted':
            progress = Math.min((stats.urgesResisted / target) * 100, 100);
            shouldUpdate = true;
            break;
          case 'resist_rate':
            if (stats.totalUrges > 0) {
              const resistRate = (stats.urgesResisted / stats.totalUrges) * 100;
              progress = Math.min((resistRate / target) * 100, 100);
            }
            shouldUpdate = true;
            break;
          case 'breathing_sessions':
            progress = Math.min((stats.breathingSessions / target) * 100, 100);
            shouldUpdate = true;
            break;
          case 'pledges_signed':
            progress = Math.min((stats.pledgesSigned / target) * 100, 100);
            shouldUpdate = true;
            break;
          default:
            break;
        }
      } else {
        const numRequirement = milestone.requirement as number;
        if (numRequirement > 0) {
          switch (milestone.category) {
            case 'Streaks':
              progress = Math.min((stats.streakDays / numRequirement) * 100, 100);
              shouldUpdate = true;
              break;
            case 'Journaling':
              progress = Math.min((stats.journalEntries / numRequirement) * 100, 100);
              shouldUpdate = true;
              break;
            case 'Discipline':
              if (stats.totalUrges > 0) {
                progress = Math.min(
                  (stats.urgesResisted / (numRequirement / 100)) * 100,
                  100
                );
              }
              shouldUpdate = true;
              break;
            case 'Psychology':
              progress = Math.min((stats.breathingSessions / numRequirement) * 100, 100);
              shouldUpdate = true;
              break;
            case 'Community':
              progress = Math.min((stats.pledgesSigned / numRequirement) * 100, 100);
              shouldUpdate = true;
              break;
          }
        }
      }

      if (shouldUpdate && progress > 0) {
        const existing = await supabase
          .from('milestone_unlocks')
          .select('*')
          .eq('user_id', userId)
          .eq('milestone_id', milestone.id)
          .single();

        const wasUnlocked = existing.data?.unlocked_at !== null && existing.data?.unlocked_at !== undefined;
        const isNowUnlocked = progress >= 100;

        await updateMilestoneProgress(userId, milestone.id, Math.floor(progress));

        if (isNowUnlocked && !wasUnlocked) {
          newlyUnlocked.push({
            id: milestone.id,
            name: milestone.name,
            description: milestone.description,
            icon: milestone.icon,
            tier: milestone.tier,
            points: milestone.points,
          });
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error in checkAndUnlockMilestones:', error);
    return [];
  }
}

export async function getMilestoneProgress(
  userId: string,
  milestoneId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('milestone_unlocks')
      .select('progress')
      .eq('user_id', userId)
      .eq('milestone_id', milestoneId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.progress || 0;
  } catch (error) {
    console.error('Error in getMilestoneProgress:', error);
    return 0;
  }
}
