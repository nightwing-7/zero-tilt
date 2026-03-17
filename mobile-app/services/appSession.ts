import { supabase } from './supabase';
import { AppState, AppStateStatus } from 'react-native';

export interface AppSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  platform: string;
  app_version: string | null;
  screens_visited: string[];
  is_active: boolean;
}

let currentSessionId: string | null = null;
let screensVisited: string[] = [];

export async function startAppSession(
  userId: string,
  platform: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('app_sessions')
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
        platform,
        screens_visited: [],
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    currentSessionId = data?.id || null;
    screensVisited = [];
    return currentSessionId;
  } catch (error) {
    console.error('Error starting app session:', error);
    return null;
  }
}

export async function endAppSession(): Promise<void> {
  if (!currentSessionId) return;

  try {
    const { error } = await supabase
      .from('app_sessions')
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
        screens_visited: screensVisited,
      })
      .eq('id', currentSessionId);

    if (error) throw error;

    currentSessionId = null;
    screensVisited = [];
  } catch (error) {
    console.error('Error ending app session:', error);
  }
}

export function trackScreenVisit(screenName: string): void {
  if (!screensVisited.includes(screenName)) {
    screensVisited.push(screenName);
  }
}

export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

// App state listener for background/foreground
export function setupAppStateListener(userId: string): () => void {
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      if (!currentSessionId) {
        await startAppSession(userId, 'mobile');
      }
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      await endAppSession();
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
  };
}
