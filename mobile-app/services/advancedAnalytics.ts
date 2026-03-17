import { supabase } from './supabase';

export interface UrgeAnalytics {
  totalUrges: number;
  resistRate: number;
  avgIntensity: number;
  byDayOfWeek: { day: number; count: number; resistRate: number }[];
  byTimeOfDay: { hour: number; count: number }[];
  byTrigger: { trigger: string; count: number; resistRate: number }[];
  trend: { date: string; count: number; resisted: number }[];
}

export interface StreakAnalytics {
  currentStreak: number;
  bestStreak: number;
  averageStreak: number;
  totalRelapses: number;
  streakHistory: { startDate: string; endDate: string | null; days: number; isActive: boolean }[];
}

export interface RelapseAnalytics {
  totalRelapses: number;
  byTrigger: { trigger: string; count: number; avgDaysLost: number }[];
  byEmotion: { emotion: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  averageDaysLost: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  streakDays: number;
  urgesLogged: number;
  urgesResisted: number;
  journalEntries: number;
  breathingSessions: number;
  goalsCompleted: number;
  moodAverage: number;
  pledgesSigned: number;
}

export async function getUrgeAnalytics(
  userId: string,
  days = 30
): Promise<UrgeAnalytics> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('urge_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const urges = data || [];
    const totalUrges = urges.length;
    const resisted = urges.filter((u: any) => u.resisted);
    const resistRate = totalUrges > 0 ? Math.round((resisted.length / totalUrges) * 100) : 0;
    const avgIntensity = totalUrges > 0
      ? Math.round((urges.reduce((sum: number, u: any) => sum + (u.intensity || 0), 0) / totalUrges) * 10) / 10
      : 0;

    // By day of week
    const dayMap: Record<number, { count: number; resisted: number }> = {};
    urges.forEach((u: any) => {
      const day = new Date(u.created_at).getDay();
      if (!dayMap[day]) dayMap[day] = { count: 0, resisted: 0 };
      dayMap[day].count++;
      if (u.resisted) dayMap[day].resisted++;
    });
    const byDayOfWeek = Object.entries(dayMap).map(([day, stats]) => ({
      day: parseInt(day),
      count: stats.count,
      resistRate: Math.round((stats.resisted / stats.count) * 100),
    }));

    // By time of day
    const hourMap: Record<number, number> = {};
    urges.forEach((u: any) => {
      const hour = new Date(u.created_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const byTimeOfDay = Object.entries(hourMap).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    })).sort((a, b) => a.hour - b.hour);

    // By trigger
    const triggerMap: Record<string, { count: number; resisted: number }> = {};
    urges.forEach((u: any) => {
      const trigger = u.trigger_type || 'Unknown';
      if (!triggerMap[trigger]) triggerMap[trigger] = { count: 0, resisted: 0 };
      triggerMap[trigger].count++;
      if (u.resisted) triggerMap[trigger].resisted++;
    });
    const byTrigger = Object.entries(triggerMap).map(([trigger, stats]) => ({
      trigger,
      count: stats.count,
      resistRate: Math.round((stats.resisted / stats.count) * 100),
    })).sort((a, b) => b.count - a.count);

    // Daily trend
    const dateMap: Record<string, { count: number; resisted: number }> = {};
    urges.forEach((u: any) => {
      const date = u.created_at.split('T')[0];
      if (!dateMap[date]) dateMap[date] = { count: 0, resisted: 0 };
      dateMap[date].count++;
      if (u.resisted) dateMap[date].resisted++;
    });
    const trend = Object.entries(dateMap).map(([date, stats]) => ({
      date,
      count: stats.count,
      resisted: stats.resisted,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalUrges,
      resistRate,
      avgIntensity,
      byDayOfWeek,
      byTimeOfDay,
      byTrigger,
      trend,
    };
  } catch (error) {
    console.error('Error fetching urge analytics:', error);
    return {
      totalUrges: 0,
      resistRate: 0,
      avgIntensity: 0,
      byDayOfWeek: [],
      byTimeOfDay: [],
      byTrigger: [],
      trend: [],
    };
  }
}

export async function getStreakAnalytics(
  userId: string
): Promise<StreakAnalytics> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const streaks = data || [];
    const now = new Date();

    const streakHistory = streaks.map((s: any) => {
      const startDate = new Date(s.start_date);
      const endDate = s.end_date ? new Date(s.end_date) : null;
      const days = s.is_active
        ? Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : s.days || 0;

      return {
        startDate: s.start_date,
        endDate: s.end_date,
        days,
        isActive: s.is_active,
      };
    });

    const activeStreak = streakHistory.find(s => s.isActive);
    const currentStreak = activeStreak?.days || 0;
    const bestStreak = Math.max(...streakHistory.map(s => s.days), 0);
    const completedStreaks = streakHistory.filter(s => !s.isActive);
    const averageStreak = completedStreaks.length > 0
      ? Math.round(completedStreaks.reduce((sum, s) => sum + s.days, 0) / completedStreaks.length)
      : currentStreak;

    return {
      currentStreak,
      bestStreak,
      averageStreak,
      totalRelapses: completedStreaks.length,
      streakHistory,
    };
  } catch (error) {
    console.error('Error fetching streak analytics:', error);
    return {
      currentStreak: 0,
      bestStreak: 0,
      averageStreak: 0,
      totalRelapses: 0,
      streakHistory: [],
    };
  }
}

export async function getRelapseAnalytics(
  userId: string
): Promise<RelapseAnalytics> {
  try {
    const { data, error } = await supabase
      .from('relapse_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const relapses = data || [];
    const totalRelapses = relapses.length;

    if (totalRelapses === 0) {
      return {
        totalRelapses: 0,
        byTrigger: [],
        byEmotion: [],
        monthlyTrend: [],
        averageDaysLost: 0,
      };
    }

    // By trigger
    const triggerMap: Record<string, { count: number; totalDays: number }> = {};
    relapses.forEach((r: any) => {
      const trigger = r.trigger_category || 'other';
      if (!triggerMap[trigger]) triggerMap[trigger] = { count: 0, totalDays: 0 };
      triggerMap[trigger].count++;
      triggerMap[trigger].totalDays += r.streak_days_lost || 0;
    });
    const byTrigger = Object.entries(triggerMap).map(([trigger, stats]) => ({
      trigger,
      count: stats.count,
      avgDaysLost: Math.round(stats.totalDays / stats.count),
    })).sort((a, b) => b.count - a.count);

    // By emotion
    const emotionMap: Record<string, number> = {};
    relapses.forEach((r: any) => {
      const emotion = r.emotional_state || 'other';
      emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
    });
    const byEmotion = Object.entries(emotionMap).map(([emotion, count]) => ({
      emotion,
      count,
    })).sort((a, b) => b.count - a.count);

    // Monthly trend
    const monthMap: Record<string, number> = {};
    relapses.forEach((r: any) => {
      const month = r.created_at.substring(0, 7); // YYYY-MM
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthMap).map(([month, count]) => ({
      month,
      count,
    })).sort((a, b) => a.month.localeCompare(b.month));

    const averageDaysLost = Math.round(
      relapses.reduce((sum: number, r: any) => sum + (r.streak_days_lost || 0), 0) / totalRelapses
    );

    return {
      totalRelapses,
      byTrigger,
      byEmotion,
      monthlyTrend,
      averageDaysLost,
    };
  } catch (error) {
    console.error('Error fetching relapse analytics:', error);
    return {
      totalRelapses: 0,
      byTrigger: [],
      byEmotion: [],
      monthlyTrend: [],
      averageDaysLost: 0,
    };
  }
}

export async function getWeeklySummary(
  userId: string
): Promise<WeeklySummary> {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString();
    const weekStartDate = weekStart.toISOString().split('T')[0];

    const [urges, journals, breathing, pledges, checkins] = await Promise.all([
      supabase.from('urge_logs').select('resisted').eq('user_id', userId).gte('created_at', weekStartStr),
      supabase.from('journal_entries').select('id').eq('user_id', userId).eq('is_draft', false).gte('created_at', weekStartStr),
      supabase.from('breathing_sessions').select('id').eq('user_id', userId).gte('created_at', weekStartStr),
      supabase.from('daily_pledges').select('id').eq('user_id', userId).gte('pledge_date', weekStartDate),
      supabase.from('daily_checkins').select('mood_score').eq('user_id', userId).gte('checkin_date', weekStartDate),
    ]);

    const urgeData = urges.data || [];
    const moodScores = (checkins.data || []).map((c: any) => c.mood_score);

    return {
      weekStart: weekStartDate,
      weekEnd: weekEnd.toISOString().split('T')[0],
      streakDays: 0, // Will be computed from streak data
      urgesLogged: urgeData.length,
      urgesResisted: urgeData.filter((u: any) => u.resisted).length,
      journalEntries: (journals.data || []).length,
      breathingSessions: (breathing.data || []).length,
      goalsCompleted: 0, // Would need goal checkin data
      moodAverage: moodScores.length > 0
        ? Math.round((moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length) * 10) / 10
        : 0,
      pledgesSigned: (pledges.data || []).length,
    };
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return {
      weekStart: '',
      weekEnd: '',
      streakDays: 0,
      urgesLogged: 0,
      urgesResisted: 0,
      journalEntries: 0,
      breathingSessions: 0,
      goalsCompleted: 0,
      moodAverage: 0,
      pledgesSigned: 0,
    };
  }
}
