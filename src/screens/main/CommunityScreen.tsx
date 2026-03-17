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
  danger: '#ef4444',
  success: '#10b981',
  info: '#06b6d4',
};

interface Post {
  id: string;
  userId: string;
  userName: string;
  rank: string;
  avatar: string;
  timestamp: string;
  content: string;
  category: 'Wins' | 'Struggles' | 'Strategies' | 'Questions';
  likes: number;
  comments: number;
  liked: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  message: string;
  timestamp: string;
}

interface TradingPod {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  icon: string;
}

interface Friend {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  streak: number;
  lastActive: string;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alex Chen',
    rank: 'Pro Trader',
    avatar: 'AC',
    timestamp: '2 hours ago',
    content: 'Just hit a 5-trade winning streak! Stuck to my trading plan and avoided FOMO on that spike. Discipline pays off!',
    category: 'Wins',
    likes: 124,
    comments: 18,
    liked: false,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jordan Smith',
    rank: 'Trader',
    avatar: 'JS',
    timestamp: '4 hours ago',
    content: 'Blown my account twice in the past year. I know revenge trading is my biggest weakness. How do you all manage the urge to get even?',
    category: 'Struggles',
    likes: 87,
    comments: 34,
    liked: false,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Maya Rodriguez',
    rank: 'Elite',
    avatar: 'MR',
    timestamp: '6 hours ago',
    content: 'Trading psychology tip: Keep a journal of your trades. Review it weekly to identify patterns in your emotional decisions.',
    category: 'Strategies',
    likes: 215,
    comments: 45,
    liked: false,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Sam Patel',
    rank: 'Apprentice',
    avatar: 'SP',
    timestamp: '8 hours ago',
    content: 'What\'s the best way to avoid overtrading? I keep opening positions when I should be waiting for better setups.',
    category: 'Questions',
    likes: 56,
    comments: 22,
    liked: false,
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Chris Lee',
    rank: 'Pro Trader',
    avatar: 'CL',
    timestamp: '10 hours ago',
    content: 'Implementing a 2-trade-per-day max rule this month. Quality over quantity. Already feeling less stressed and more focused.',
    category: 'Wins',
    likes: 198,
    comments: 41,
    liked: false,
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alex Chen',
    avatar: 'AC',
    message: 'Anyone else struggle with patience when waiting for the right setup?',
    timestamp: '2:15 PM',
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Maya Rodriguez',
    avatar: 'MR',
    message: 'All the time. I set alerts and walk away from the charts until I see them.',
    timestamp: '2:18 PM',
  },
  {
    id: '3',
    userId: 'user2',
    userName: 'Jordan Smith',
    avatar: 'JS',
    message: 'That\'s smart. I get antsy after 20 minutes of no trades.',
    timestamp: '2:21 PM',
  },
  {
    id: '4',
    userId: 'user5',
    userName: 'Chris Lee',
    avatar: 'CL',
    message: 'Try meditating during slow periods. Helps clear your mind and refocus.',
    timestamp: '2:25 PM',
  },
  {
    id: '5',
    userId: 'user4',
    userName: 'Sam Patel',
    avatar: 'SP',
    message: 'Just implemented a 15-min timer. If no setup appears, I take a break.',
    timestamp: '2:28 PM',
  },
  {
    id: '6',
    userId: 'user1',
    userName: 'Alex Chen',
    avatar: 'AC',
    message: 'The timer idea is gold. Prevents overtrading and keeps me disciplined.',
    timestamp: '2:31 PM',
  },
  {
    id: '7',
    userId: 'user3',
    userName: 'Maya Rodriguez',
    avatar: 'MR',
    message: 'Exactly. Structure removes emotion from the equation.',
    timestamp: '2:33 PM',
  },
  {
    id: '8',
    userId: 'user2',
    userName: 'Jordan Smith',
    avatar: 'JS',
    message: 'Starting this today. Thanks everyone!',
    timestamp: '2:35 PM',
  },
];

const MOCK_PODS: TradingPod[] = [
  {
    id: '1',
    name: 'ES Scalpers',
    description: 'High-frequency traders focused on E-mini S&P 500 scalping',
    members: 7,
    maxMembers: 10,
    icon: '📈',
  },
  {
    id: '2',
    name: 'NQ Day Traders',
    description: 'Nasdaq futures swing traders sharing daily setups',
    members: 5,
    maxMembers: 8,
    icon: '💹',
  },
  {
    id: '3',
    name: 'Futures Focus',
    description: 'All futures traders discussing strategies and psychology',
    members: 8,
    maxMembers: 12,
    icon: '🎯',
  },
  {
    id: '4',
    name: 'Options Gang',
    description: 'Options traders learning volatility and premium strategies',
    members: 6,
    maxMembers: 10,
    icon: '📊',
  },
];

const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alex Chen',
    avatar: 'AC',
    streak: 12,
    lastActive: 'Online now',
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Maya Rodriguez',
    avatar: 'MR',
    streak: 28,
    lastActive: '15 min ago',
  },
  {
    id: '3',
    userId: 'user5',
    userName: 'Chris Lee',
    avatar: 'CL',
    streak: 45,
    lastActive: '3 hours ago',
  },
  {
    id: '4',
    userId: 'user2',
    userName: 'Jordan Smith',
    avatar: 'JS',
    streak: 5,
    lastActive: '1 hour ago',
  },
  {
    id: '5',
    userId: 'user4',
    userName: 'Sam Patel',
    avatar: 'SP',
    streak: 8,
    lastActive: 'Today',
  },
];

const CATEGORIES = ['All', 'Wins', 'Struggles', 'Strategies', 'Questions'] as const;

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Wins':
      return COLORS.success;
    case 'Struggles':
      return COLORS.danger;
    case 'Strategies':
      return COLORS.info;
    case 'Questions':
      return COLORS.accent;
    default:
      return COLORS.primary;
  }
};

const PostCard: React.FC<{ post: Post; onLike: (postId: string) => void }> = ({
  post,
  onLike,
}) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRankRow}>
            <Text style={styles.userName}>{post.userName}</Text>
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor:
                    post.rank === 'Elite'
                      ? '#fbbf24'
                      : post.rank === 'Pro Trader'
                        ? COLORS.primary
                        : '#8b5cf6',
                },
              ]}
            >
              <Text style={styles.rankText}>{post.rank}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.postContent}>{post.content}</Text>

    <View style={styles.categoryRow}>
      <View
        style={[
          styles.categoryTag,
          { backgroundColor: getCategoryColor(post.category) + '20' },
        ]}
      >
        <Text style={[styles.categoryText, { color: getCategoryColor(post.category) }]}>
          {post.category}
        </Text>
      </View>
    </View>

    <View style={styles.postFooter}>
      <TouchableOpacity
        style={styles.postAction}
        onPress={() => onLike(post.id)}
      >
        <MaterialCommunityIcons
          name={post.liked ? 'heart' : 'heart-outline'}
          size={18}
          color={post.liked ? COLORS.danger : COLORS.textSecondary}
        />
        <Text style={styles.actionText}>{post.likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.postAction}>
        <MaterialCommunityIcons
          name="comment-outline"
          size={18}
          color={COLORS.textSecondary}
        />
        <Text style={styles.actionText}>{post.comments}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.postAction}>
        <MaterialCommunityIcons
          name="share-outline"
          size={18}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ChatMessageBubble: React.FC<{ message: ChatMessage; isOwn: boolean }> = ({
  message,
  isOwn,
}) => (
  <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
    {!isOwn && (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{message.avatar}</Text>
      </View>
    )}
    <View
      style={[
        styles.messageBubble,
        isOwn && { backgroundColor: COLORS.primary },
      ]}
    >
      {!isOwn && <Text style={styles.messageUserName}>{message.userName}</Text>}
      <Text style={styles.messageText}>{message.message}</Text>
      <Text style={styles.messageTime}>{message.timestamp}</Text>
    </View>
  </View>
);

const PodCard: React.FC<{ pod: TradingPod }> = ({ pod }) => (
  <View style={styles.podCard}>
    <View style={styles.podHeader}>
      <Text style={styles.podIcon}>{pod.icon}</Text>
      <View style={styles.podInfo}>
        <Text style={styles.podName}>{pod.name}</Text>
        <Text style={styles.podMembers}>
          {pod.members} / {pod.maxMembers} members
        </Text>
      </View>
    </View>
    <Text style={styles.podDescription}>{pod.description}</Text>
    <TouchableOpacity style={styles.joinButton}>
      <Text style={styles.joinButtonText}>Join Pod</Text>
    </TouchableOpacity>
  </View>
);

const FriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
  <View style={styles.friendCard}>
    <View style={styles.friendInfo}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{friend.avatar}</Text>
      </View>
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{friend.userName}</Text>
        <View style={styles.streakBadge}>
          <MaterialCommunityIcons
            name="fire"
            size={14}
            color={COLORS.accent}
          />
          <Text style={styles.streakText}>{friend.streak} day streak</Text>
        </View>
        <Text style={styles.lastActive}>{friend.lastActive}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.messageButton}>
      <MaterialCommunityIcons name="message-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'forum' | 'chat' | 'pods' | 'friends'>('forum');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [chatInput, setChatInput] = useState('');

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      <View style={styles.tabBar}>
        {(['forum', 'chat', 'pods', 'friends'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'forum' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.createPostButton}>
            <MaterialCommunityIcons name="pencil-plus" size={20} color={COLORS.bg} />
            <Text style={styles.createPostButtonText}>Create a Post</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.activeCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLikePost}
            />
          ))}
        </ScrollView>
      )}

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.chatMessages}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_MESSAGES.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.userId === 'user1'}
              />
            ))}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Share your thoughts..."
              placeholderTextColor={COLORS.textSecondary}
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <MaterialCommunityIcons name="send" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'pods' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.createPodButton}>
            <MaterialCommunityIcons name="plus-circle" size={20} color={COLORS.bg} />
            <Text style={styles.createPodButtonText}>Create a Pod</Text>
          </TouchableOpacity>

          {MOCK_PODS.map((pod) => (
            <PodCard key={pod.id} pod={pod} />
          ))}
        </ScrollView>
      )}

      {activeTab === 'friends' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {MOCK_FRIENDS.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  createPostButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bg,
    marginLeft: 8,
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 4,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCategoryChipText: {
    color: COLORS.bg,
  },
  postCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  postHeader: {
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bg,
  },
  userInfo: {
    flex: 1,
  },
  nameRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.bg,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.tertiary,
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  messageUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
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
  createPodButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bg,
    marginLeft: 8,
  },
  podCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  podHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  podIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  podInfo: {
    flex: 1,
  },
  podName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  podMembers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  podDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  friendInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  friendDetails: {
    flex: 1,
    marginLeft: 10,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  streakText: {
    fontSize: 12,
    color: COLORS.accent,
    marginLeft: 4,
    fontWeight: '600',
  },
  lastActive: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
