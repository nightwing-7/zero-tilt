import { supabase } from './supabase';

export interface DailyPledge {
  id: string;
  user_id: string;
  pledge_text: string;
  signature_data: string;
  pledge_date: string;
  created_at: string;
  updated_at: string;
}

export async function signPledge(
  userId: string,
  pledgeText: string,
  signatureData: string
): Promise<DailyPledge | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pledgeDate = today.toISOString().split('T')[0];

    const { data: existingPledge, error: fetchError } = await supabase
      .from('daily_pledges')
      .select('*')
      .eq('user_id', userId)
      .eq('pledge_date', pledgeDate)
      .single();

    if (existingPledge && !fetchError) {
      const { data, error } = await supabase
        .from('daily_pledges')
        .update({
          pledge_text: pledgeText,
          signature_data: signatureData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPledge.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data || null;
    }

    const { data, error } = await supabase
      .from('daily_pledges')
      .insert({
        user_id: userId,
        pledge_text: pledgeText,
        signature_data: signatureData,
        pledge_date: pledgeDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error signing pledge:', error);
    return null;
  }
}

export async function hasPledgedToday(userId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pledgeDate = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_pledges')
      .select('id')
      .eq('user_id', userId)
      .eq('pledge_date', pledgeDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if pledged today:', error);
    return false;
  }
}

export async function getTodaysPledge(userId: string): Promise<DailyPledge | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pledgeDate = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_pledges')
      .select('*')
      .eq('user_id', userId)
      .eq('pledge_date', pledgeDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching today\'s pledge:', error);
    return null;
  }
}

export async function getPledgeHistory(
  userId: string,
  limit = 30
): Promise<DailyPledge[]> {
  try {
    const { data, error } = await supabase
      .from('daily_pledges')
      .select('*')
      .eq('user_id', userId)
      .order('pledge_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pledge history:', error);
    return [];
  }
}
