import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  bg: '#111113',
  primary: '#10b981',
  secondary: '#1e293b',
  tertiary: '#475569',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#f59e0b',
};

interface ChatMessage {
  id: string;
  type: 'user' | 'coach';
  text: string;
}

const COACH_RESPONSES: { [key: string]: string } = {
  'revenge-trade': 'Revenge trading is one of the most destructive patterns. Here\'s what I recommend: First, step away from the charts for 30 minutes. Use that time to journal what happened and identify your emotional trigger. When you come back, ask yourself: "Does this setup meet my trading plan criteria?" If not, skip it. Your job is to follow your plan, not to make back losses immediately. Remember, the market will always be there tomorrow.',
  'review-plan': 'Great question! Here\'s the framework I recommend: 1) Setup criteria - What specific conditions trigger your entries? Be precise. 2) Risk management - Max loss per trade, daily loss limit. 3) Position sizing - How many contracts/shares based on your account? 4) Profit targets - Where do you exit winners? 5) Trigger emotions - What feelings signal you should stop trading? Write these down and review them every morning before trading.',
  'motivation': 'Trading is a marathon, not a sprint. Every professional trader you admire has blown accounts and had losing weeks. What separates them is resilience. Your discipline today becomes your success tomorrow. Track your progress in your journal, celebrate small wins, and remember why you started. You\'ve got this!',
  'before-trading': 'Pre-trading routine is critical. Here\'s mine: 1) Check the news - Any major events? 2) Review your trade plan - What\'s your max daily loss? 3) Identify setups - What are you looking for today? 4) Warm-up - Do a few paper trades to get in the zone. 5) Deep breaths - Mental reset. Then start with smaller position sizes until you feel sharp. No trading when tired or emotional.',
  'default': 'I hear you. Remember: your emotions are valid, but they shouldn\'t drive your trades. The best traders separate feelings from decisions. Take a deep breath. What specific situation are you facing right now?',
};

const QUICK_PROMPTS = [
  { text: 'I\'m feeling tempted to revenge trade', key: 'revenge-trade' },
  { text: 'Help me review my trading plan', key: 'review-plan' },
  { text: 'I need motivation', key: 'motivation' },
  { text: 'What should I do before trading?', key: 'before-trading' },
];

export default function CoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'coach',
      text: 'Hey there, I\'m your AI trading coach. How can I help you stay disciplined today?',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleQuickPrompt = (key: string) => {
    const selectedPrompt = QUICK_PROMPTS.find((p) => p.key === key);
    if (selectedPrompt) {
      sendMessage(selectedPrompt.text);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate coach response delay
    setTimeout(() => {
      const response =
        COACH_RESPONSES[
          Object.keys(COACH_RESPONSES).find((key) =>
            text.toLowerCase().includes(key.split('-').join(' '))
          ) || 'default'
        ] || COACH_RESPONSES['default'];

      const coachMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        text: response,
      };

      setMessages((prev) => [...prev, coachMessage]);
    }, 600);

    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coachHeader}>
          <View style={styles.coachAvatar}>
            <MaterialCommunityIcons name="robot-happy" size={32} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.coachName}>AI Trading Coach</Text>
            <Text style={styles.coachStatus}>Always here to help</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.type === 'user' && styles.userMessageRow,
            ]}
          >
            {msg.type === 'coach' && (
              <View style={styles.coachBubbleAvatar}>
                <MaterialCommunityIcons name="robot-happy" size={16} color={COLORS.primary} />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.type === 'coach' && styles.coachBubble,
                msg.type === 'user' && styles.userBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.type === 'user' && styles.userMessageText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Prompts - only show if first message */}
      {messages.length === 1 && (
        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsLabel}>Quick questions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt.key}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt.key)}
              >
                <Text style={styles.quickPromptText}>{prompt.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={{ maxHeight: 100 }}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about trading psychology..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(inputText)}
        >
          <MaterialCommunityIcons name="send" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  coachStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  coachBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  coachBubble: {
    backgroundColor: COLORS.secondary,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
  },
  userMessageText: {
    color: COLORS.bg,
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  quickPromptsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  quickPromptsContent: {
    paddingRight: 16,
  },
  quickPrompt: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.tertiary,
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
