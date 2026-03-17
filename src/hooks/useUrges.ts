import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UrgeLogRow } from '@/types/database';

type UrgeLog = UrgeLogRow;

export function useUrges() {
  const [urges, setUrges] = useState<UrgeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUrges = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('urge_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) setUrges(data);
    } catch (err) {
      console.error('Error fetching urges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const logUrge = useCallback(async (urge: Partial<Omit<UrgeLog, 'id' | 'user_id' | 'created_at'>>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('urge_logs')
      .insert({ ...urge, user_id: user.id })
      .select()
      .single();

    if (data) setUrges((prev) => [data, ...prev]);
    return { data, error };
  }, []);

  // Computed stats
  const stats = {
    total: urges.length,
    resisted: urges.filter((u) => u.resisted).length,
    resistedPercent: urges.length > 0
      ? Math.round((urges.filter((u) => u.resisted).length / urges.length) * 100)
      : 0,
    avgIntensity: urges.length > 0
      ? (urges.reduce((sum, u) => sum + u.intensity, 0) / urges.length).toFixed(1)
      : '0',
    topTrigger: getTopTrigger(urges),
    triggerBreakdown: getTriggerBreakdown(urges),
  };

  useEffect(() => {
    fetchUrges();
  }, [fetchUrges]);

  return { urges, stats, loading, logUrge, refresh: fetchUrges };
}

function getTopTrigger(urges: UrgeLog[]) {
  if (urges.length === 0) return null;
  const counts: Record<string, number> = {};
  urges.forEach((u) => {
    counts[u.trigger_type] = (counts[u.trigger_type] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? { name: sorted[0][0], count: sorted[0][1], percent: Math.round((sorted[0][1] / urges.length) * 100) } : null;
}

function getTriggerBreakdown(urges: UrgeLog[]) {
  const counts: Record<string, number> = {};
  urges.forEach((u) => {
    counts[u.trigger_type] = (counts[u.trigger_type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, percent: Math.round((count / urges.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}
