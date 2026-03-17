import { supabase } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  trader_name: string;
  age: number | null;
  trading_style: string[] | null;
  markets: string[] | null;
  experience_level: string | null;
  tilt_risk_level: number | null;
  tilt_symptoms: string[] | null;
  goals: string[] | null;
  has_completed_onboarding: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function completeOnboarding(
  userId: string,
  onboardingData: {
    trader_name: string;
    age: number;
    trading_style: string[];
    markets: string[];
    experience_level: string;
    tilt_risk_level: number;
    tilt_symptoms: string[];
    goals: string[];
  }
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...onboardingData,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return null;
  }
}
