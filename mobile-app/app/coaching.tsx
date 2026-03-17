import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCoaching } from '../hooks/useCoaching';
import { CoachMessage } from '../services/coaching';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function CoachingScreen() {
  const router = useRouter();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    canSendMessage,
    remainingMessages,
    startConversation,
    openConversation,
    send,
  } = useCoaching();

  const [input, setInput] = useState('');
  const [showConversations, setShowConversations] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleStartChat = async () => {
    await startConversation();
    setShowConversations(false);
  };

  const handleOpenChat = async (conversationId: string) => {
    await openConversation(conversationId);
    setShowConversations(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !canSendMessage) return;

    const message = input.trim();
    setInput('');
    await send(message);
  };

  const renderMessage = ({ item }: { item: CoachMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiHeader}>
            <Text style={styles.aiName}>Mika</Text>
            <Text style={styles.aiLabel}>AI Coach</Text>
          </View>
        )}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent.teal} size="large" style={{ marginTop: spacing[10] }} />
      </SafeAreaView>
    );
  }

  // Conversation list view
  if (showConversations && !activeConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <TouchableOpacity onPress={handleStartChat}>
            <Text style={styles.newChatButton}>+ New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coachIntro}>
          <Text style={styles.coachAvatar}>🤖</Text>
          <Text style={styles.coachName}>Meet Mika</Text>
          <Text style={styles.coachDesc}>
            Your personal trading psychology coach. Ask about managing emotions,
            building discipline, or processing a difficult trading day.
          </Text>
        </View>

        {!canSendMessage && (
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>
              Daily message limit reached. Upgrade to Pro for unlimited coaching.
            </Text>
          </View>
        )}

        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.conversationList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => handleOpenChat(item.id)}
              >
                <Text style={styles.conversationTitle}>{item.title}</Text>
                <View style={styles.conversationMeta}>
                  <Text style={styles.conversationMessages}>
                    {item.message_count} messages
                  </Text>
                  <Text style={styles.conversationDate}>
                    {new Date(item.updated_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Start a conversation with Mika to get personalized coaching</Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartChat}>
              <Text style={styles.startButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Chat view
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            setShowConversations(true);
          }}>
            <Text style={styles.backButton}>← Chats</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mika</Text>
          <View style={{ width: 60 }} />
        </View>

        {messages.length === 0 && (
          <View style={styles.welcomeMessage}>
            <Text style={styles.welcomeEmoji}>🤖</Text>
            <Text style={styles.welcomeText}>
              Hi! I'm Mika, your trading psychology coach. How can I help you today?
            </Text>
            <View style={styles.promptSuggestions}>
              {[
                'I had a tough trading day',
                "I'm struggling with FOMO",
                'Help me build discipline',
                'I just relapsed',
              ].map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.promptChip}
                  onPress={() => {
                    setInput(prompt);
                  }}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {sending && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Mika is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          {!canSendMessage ? (
            <TouchableOpacity
              style={styles.upgradeBar}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.upgradeText}>
                Daily limit reached. Upgrade to Pro →
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.chatInput}
                placeholder="Message Mika..."
                placeholderTextColor={colors.dark.text.muted}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!input.trim() || sending}
              >
                <Text style={styles.sendButtonText}>→</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {canSendMessage && remainingMessages < Infinity && (
          <Text style={styles.remainingText}>
            {remainingMessages} messages remaining today
          </Text>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backButton: { color: colors.accent.teal, fontSize: typography.sizes.base },
  headerTitle: { color: colors.dark.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any },
  newChatButton: { color: colors.accent.teal, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold as any },
  coachIntro: { alignItems: 'center', padding: spacing[6] },
  coachAvatar: { fontSize: 64, marginBottom: spacing[2] },
  coachName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  coachDesc: { color: colors.dark.text.tertiary, textAlign: 'center', marginTop: spacing[2], lineHeight: 22, paddingHorizontal: spacing[4] },
  limitBanner: { backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: spacing[3], marginHorizontal: spacing[4], borderRadius: borderRadius.md },
  limitText: { color: colors.accent.amber, textAlign: 'center', fontSize: typography.sizes.sm },
  conversationList: { padding: spacing[4] },
  conversationCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  conversationTitle: { color: colors.dark.text.primary, fontWeight: typography.weights.semibold as any, marginBottom: spacing[1] },
  conversationMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  conversationMessages: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  conversationDate: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  emptyState: { alignItems: 'center', padding: spacing[8] },
  emptyText: { color: colors.dark.text.tertiary, textAlign: 'center', marginBottom: spacing[4] },
  startButton: { backgroundColor: colors.accent.teal, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full },
  startButtonText: { color: '#fff', fontWeight: typography.weights.semibold as any },
  welcomeMessage: { alignItems: 'center', padding: spacing[6] },
  welcomeEmoji: { fontSize: 48, marginBottom: spacing[2] },
  welcomeText: { color: colors.dark.text.secondary, textAlign: 'center', marginBottom: spacing[4], lineHeight: 22 },
  promptSuggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing[2] },
  promptChip: { backgroundColor: colors.dark.bg.secondary, paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.dark.border },
  promptChipText: { color: colors.dark.text.secondary, fontSize: typography.sizes.sm },
  messagesList: { padding: spacing[4], paddingBottom: spacing[2] },
  messageBubble: { maxWidth: '80%', borderRadius: borderRadius.lg, padding: spacing[3], marginBottom: spacing[2] },
  userBubble: { backgroundColor: colors.accent.teal, alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: colors.dark.bg.secondary, alignSelf: 'flex-start' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] },
  aiName: { color: colors.accent.teal, fontWeight: typography.weights.semibold as any, fontSize: typography.sizes.sm },
  aiLabel: { color: colors.dark.text.muted, fontSize: typography.sizes.xs },
  messageText: { fontSize: typography.sizes.base, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: colors.dark.text.secondary },
  messageTime: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.5)', marginTop: spacing[1], alignSelf: 'flex-end' },
  typingIndicator: { paddingHorizontal: spacing[4], paddingBottom: spacing[2] },
  typingText: { color: colors.dark.text.muted, fontSize: typography.sizes.sm, fontStyle: 'italic' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    color: colors.dark.text.primary,
    maxHeight: 100,
    fontSize: typography.sizes.base,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: '#fff', fontSize: 20, fontWeight: typography.weights.bold as any },
  upgradeBar: {
    flex: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  upgradeText: { color: colors.accent.amber, fontWeight: typography.weights.semibold as any },
  remainingText: {
    color: colors.dark.text.muted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    paddingBottom: spacing[2],
  },
});
