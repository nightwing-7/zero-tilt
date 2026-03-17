import { supabase } from './supabase';

export interface PrivacySettings {
  user_id: string;
  show_profile: boolean;
  show_streak: boolean;
  show_leaderboard: boolean;
  show_milestones: boolean;
  allow_friend_requests: boolean;
  allow_messages: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPrivacySettings(
  userId: string
): Promise<PrivacySettings | null> {
  try {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return null;
  }
}

export async function updatePrivacySettings(
  userId: string,
  updates: Partial<PrivacySettings>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('privacy_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return false;
  }
}
