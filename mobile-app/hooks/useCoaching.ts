import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';
import { useSubscription } from './useSubscription';
import {
  CoachConversation,
  CoachMessage,
  CoachAnalysis,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  analyzeUserBehavior,
  getTodayCoachMessageCount,
} from '../services/coaching';
import { FREE_LIMITS } from '../services/subscription';

export function useCoaching() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { isPro } = useSubscription();
  const [conversations, setConversations] = useState<CoachConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<CoachConversation | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [todayMessageCount, setTodayMessageCount] = useState(0);

  const canSendMessage = isPro || todayMessageCount < FREE_LIMITS.coach_messages_per_day;
  const remainingMessages = isPro
    ? Infinity
    : Math.max(0, FREE_LIMITS.coach_messages_per_day - todayMessageCount);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConversations(user.id);
      setConversations(data);

      const count = await getTodayCoachMessageCount(user.id);
      setTodayMessageCount(count);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const startConversation = useCallback(async (title?: string) => {
    if (!user) return null;

    const conv = await createConversation(user.id, title);
    if (conv) {
      setActiveConversation(conv);
      setMessages([]);
      track('coach_conversation_started');
    }
    return conv;
  }, [user, track]);

  const openConversation = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setActiveConversation(conv);
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
      track('coach_opened', {
        is_first_visit: conversations.length <= 1,
      });
    }
  }, [conversations, track]);

  const send = useCallback(async (content: string) => {
    if (!activeConversation || !canSendMessage) return null;

    setSending(true);
    try {
      track('coach_message_sent', {
        message_length: content.length,
        conversation_message_count: messages.length + 1,
      });

      // Add user message to local state immediately
      const tempUserMsg: CoachMessage = {
        id: `temp_${Date.now()}`,
        conversation_id: activeConversation.id,
        role: 'user',
        content,
        tokens_used: null,
        response_time_ms: null,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const aiMessage = await sendMessage(activeConversation.id, content);

      if (aiMessage) {
        // Replace temp message and add AI response
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          { ...tempUserMsg, id: `user_${Date.now()}` },
          aiMessage,
        ]);

        track('coach_response_received', {
          response_time_ms: aiMessage.response_time_ms,
          response_length: aiMessage.content.length,
        });

        setTodayMessageCount(prev => prev + 1);
      }

      return aiMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      track('coach_error', { error_type: 'send_failed' });
      return null;
    } finally {
      setSending(false);
    }
  }, [activeConversation, canSendMessage, messages, track]);

  const loadAnalysis = useCallback(async () => {
    if (!user) return;
    try {
      const data = await analyzeUserBehavior(user.id);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  }, [user]);

  return {
    conversations,
    activeConversation,
    messages,
    analysis,
    loading,
    sending,
    canSendMessage,
    remainingMessages,
    todayMessageCount,
    loadConversations,
    startConversation,
    openConversation,
    send,
    loadAnalysis,
  };
}
