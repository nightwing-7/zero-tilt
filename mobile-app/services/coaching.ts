import { supabase } from './supabase';

export interface CoachConversation {
  id: string;
  user_id: string;
  title: string;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface CoachAnalysis {
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  patterns: string[];
  recommendations: string[];
  streakAdvice: string;
  emotionalState: string;
}

// AI Coach conversation management
export async function getConversations(
  userId: string,
  limit = 20
): Promise<CoachConversation[]> {
  try {
    const { data, error } = await supabase
      .from('coach_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching coach conversations:', error);
    return [];
  }
}

export async function createConversation(
  userId: string,
  title?: string
): Promise<CoachConversation | null> {
  try {
    const { data, error } = await supabase
      .from('coach_conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
        message_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

export async function getMessages(
  conversationId: string,
  limit = 100
): Promise<CoachMessage[]> {
  try {
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<CoachMessage | null> {
  try {
    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('coach_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) throw userError;

    // In production, this would call the coach-message Edge Function
    // which would call the AI API and return a response
    // For now, generate a placeholder response
    const startTime = Date.now();

    const aiResponse = await generateCoachResponse(content);
    const responseTime = Date.now() - startTime;

    // Save AI response
    const { data: aiMessage, error: aiError } = await supabase
      .from('coach_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        response_time_ms: responseTime,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (aiError) throw aiError;
    return aiMessage || null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// AI coaching placeholder - will be replaced by Edge Function
async function generateCoachResponse(userMessage: string): Promise<string> {
  // This is a placeholder that provides template responses
  // In production, this calls the coach-message Edge Function
  // which uses Claude/GPT to generate contextual coaching

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('relapse') || lowerMessage.includes('gave in')) {
    return "I hear you, and I want you to know that setbacks are part of the journey. Every trader goes through this. What matters most is what you do next. Let's break down what happened:\n\n1. What were you feeling right before the trade?\n2. Was there a specific trigger?\n3. What could you do differently next time?\n\nRemember: one bad trade doesn't define you. Your streak may have reset, but your growth hasn't.";
  }

  if (lowerMessage.includes('fomo') || lowerMessage.includes('missing out')) {
    return "FOMO is one of the most common triggers for tilt. Here's what I want you to remember:\n\n• The market will always have new opportunities\n• Chasing a move you missed almost always leads to poor entries\n• Your trading plan exists to protect you from exactly this feeling\n\nTry this: close your charts for 15 minutes. Do a breathing exercise. Then come back and ask yourself: 'Does this setup match my plan?'";
  }

  if (lowerMessage.includes('urge') || lowerMessage.includes('tempted')) {
    return "You're doing the right thing by recognizing the urge. That awareness is half the battle. Here are some immediate steps:\n\n1. Hit the Panic Button for a breathing exercise\n2. Log this urge — tracking it weakens its power\n3. Review your daily pledge\n4. Step away from the screen for 5 minutes\n\nEvery urge you resist makes the next one easier to handle.";
  }

  if (lowerMessage.includes('streak') || lowerMessage.includes('progress')) {
    return "Your progress is real and meaningful. Every day you maintain discipline is building new neural pathways. Here's what the research shows:\n\n• After 21 days, new habits begin to solidify\n• After 66 days, behaviors become automatic\n• Your consistency matters more than perfection\n\nKeep showing up, keep logging, keep being honest with yourself. That's how real change happens.";
  }

  return "Thank you for sharing that with me. Trading psychology is complex, and the fact that you're actively working on it shows real commitment.\n\nA few things to consider:\n• How are you feeling emotionally right now?\n• Have you signed your pledge today?\n• When was your last journal entry?\n\nRemember, I'm here to help you process your trading psychology. What would be most helpful to focus on right now?";
}

// Behavior analysis framework
export async function analyzeUserBehavior(
  userId: string
): Promise<CoachAnalysis> {
  try {
    // Fetch user data for analysis
    const [streakData, urgeData, relapseData, journalData] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', userId).eq('is_active', true).single(),
      supabase.from('urge_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('relapse_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('journal_entries').select('mood, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(14),
    ]);

    const urges = urgeData.data || [];
    const relapses = relapseData.data || [];
    const journals = journalData.data || [];

    // Pattern detection
    const patterns: string[] = [];
    const recommendations: string[] = [];

    // Urge pattern analysis
    const resistRate = urges.length > 0
      ? urges.filter((u: any) => u.resisted).length / urges.length
      : 1;

    if (resistRate < 0.5) {
      patterns.push('Low urge resistance rate');
      recommendations.push('Focus on building coping strategies before trading sessions');
    }

    // Trigger frequency
    const triggerCounts: Record<string, number> = {};
    urges.forEach((u: any) => {
      if (u.trigger_type) {
        triggerCounts[u.trigger_type] = (triggerCounts[u.trigger_type] || 0) + 1;
      }
    });
    const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTrigger) {
      patterns.push(`Most frequent trigger: ${topTrigger[0]}`);
      recommendations.push(`Develop specific strategies for "${topTrigger[0]}" situations`);
    }

    // Relapse pattern
    if (relapses.length > 2) {
      const recentRelapses = relapses.filter((r: any) => {
        const daysSince = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });
      if (recentRelapses.length >= 3) {
        patterns.push('Frequent relapses in past 30 days');
        recommendations.push('Consider reducing position sizes or taking a trading break');
      }
    }

    // Mood trend
    const moodValues: Record<string, number> = { terrible: 1, bad: 2, neutral: 3, good: 4, great: 5 };
    if (journals.length >= 3) {
      const avgMood = journals.reduce((sum: number, j: any) => sum + (moodValues[j.mood] || 3), 0) / journals.length;
      if (avgMood < 2.5) {
        patterns.push('Declining mood trend');
        recommendations.push('Focus on self-care and consider speaking with a professional');
      }
    }

    // Determine risk level
    let riskLevel: CoachAnalysis['riskLevel'] = 'low';
    if (patterns.length >= 3 || resistRate < 0.3) {
      riskLevel = 'severe';
    } else if (patterns.length >= 2 || resistRate < 0.5) {
      riskLevel = 'high';
    } else if (patterns.length >= 1) {
      riskLevel = 'moderate';
    }

    // Streak advice
    const currentStreak = streakData.data;
    let streakAdvice = 'Start building your streak — every day counts!';
    if (currentStreak) {
      const days = Math.floor(
        (Date.now() - new Date(currentStreak.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days >= 30) {
        streakAdvice = `Incredible — ${days} days of discipline! You're building lasting habits.`;
      } else if (days >= 7) {
        streakAdvice = `Great momentum at ${days} days. Stay focused on your daily routine.`;
      } else {
        streakAdvice = `${days} days and growing. Every day you resist builds strength for the next.`;
      }
    }

    return {
      riskLevel,
      patterns,
      recommendations: recommendations.length > 0
        ? recommendations
        : ['Keep up your current discipline', 'Continue logging urges and journal entries'],
      streakAdvice,
      emotionalState: 'stable',
    };
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    return {
      riskLevel: 'moderate',
      patterns: [],
      recommendations: ['Continue your daily routine and logging'],
      streakAdvice: 'Keep building your streak!',
      emotionalState: 'unknown',
    };
  }
}

// Get today's coach message count (for free tier limit)
export async function getTodayCoachMessageCount(
  userId: string
): Promise<number> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('coach_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', todayStart.toISOString());

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting coach message count:', error);
    return 0;
  }
}
