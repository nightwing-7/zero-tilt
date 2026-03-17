import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useStore } from '../../store/store';

const { width } = Dimensions.get('window');

interface Trader {
  rank: number;
  name: string;
  initials: string;
  badge: string;
  value: number | string;
  replies?: number;
}

type LeaderboardType = 'streak' | 'discipline' | 'helpful';

export default function ProfileScreen({ navigation }: any) {
  const { name, traderName, streak, currentRank } = useStore();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('streak');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Zero Tilt - the trader's mental resilience platform. Check out my profile!`,
        title: 'Join Zero Tilt',
      });
    } catch (error) {
      Alert.alert('Share failed', 'Could not share profile');
    }
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarInitials = getInitials(name || 'User');

  const streakLeaderboard: Trader[] = [
    { rank: 1, name: 'Alex Rivera', initials: 'AR', badge: 'Streak King', value: 127 },
    { rank: 2, name: 'Jordan Lee', initials: 'JL', badge: 'Hot Streak', value: 89 },
    { rank: 3, name: 'Casey Morgan', initials: 'CM', badge: 'Unstoppable', value: 76 },
    { rank: 4, name: 'Taylor Blake', initials: 'TB', badge: 'Rising Star', value: 65 },
    { rank: 5, name: 'Morgan Davis', initials: 'MD', badge: 'Consistent', value: 54 },
    { rank: 6, name: 'Riley Hart', initials: 'RH', badge: 'Focused', value: 43 },
    { rank: 7, name: 'Casey White', initials: 'CW', badge: 'Steady', value: 38 },
    { rank: 8, name: 'Jordan Smith', initials: 'JS', badge: 'Grounded', value: 31 },
    { rank: 9, name: 'Alex Chen', initials: 'AC', badge: 'Dedicated', value: 25 },
    { rank: 10, name: 'Sam Wilson', initials: 'SW', badge: 'Beginner', value: 18 },
  ];

  const disciplineLeaderboard: Trader[] = [
    { rank: 1, name: 'Morgan Davis', initials: 'MD', badge: 'Master', value: '98%' },
    { rank: 2, name: 'Alex Rivera', initials: 'AR', badge: 'Expert', value: '96%' },
    { rank: 3, name: 'Jordan Lee', initials: 'JL', badge: 'Advanced', value: '94%' },
    { rank: 4, name: 'Casey Morgan', initials: 'CM', badge: 'Advanced', value: '92%' },
    { rank: 5, name: 'Taylor Blake', initials: 'TB', badge: 'Proficient', value: '88%' },
    { rank: 6, name: 'Riley Hart', initials: 'RH', badge: 'Proficient', value: '85%' },
    { rank: 7, name: 'Casey White', initials: 'CW', badge: 'Proficient', value: '82%' },
    { rank: 8, name: 'Jordan Smith', initials: 'JS', badge: 'Intermediate', value: '78%' },
    { rank: 9, name: 'Alex Chen', initials: 'AC', badge: 'Beginner', value: '72%' },
    { rank: 10, name: 'Sam Wilson', initials: 'SW', badge: 'Beginner', value: '65%' },
  ];

  const helpfulLeaderboard: Trader[] = [
    { rank: 1, name: 'Morgan Davis', initials: 'MD', badge: 'Community Hero', value: 2847, replies: 312 },
    { rank: 2, name: 'Jordan Lee', initials: 'JL', badge: 'Top Helper', value: 2564, replies: 287 },
    { rank: 3, name: 'Alex Rivera', initials: 'AR', badge: 'Helpful Soul', value: 2341, replies: 256 },
    { rank: 4, name: 'Casey Morgan', initials: 'CM', badge: 'Contributor', value: 2128, replies: 234 },
    { rank: 5, name: 'Taylor Blake', initials: 'TB', badge: 'Contributor', value: 1945, replies: 209 },
    { rank: 6, name: 'Riley Hart', initials: 'RH', badge: 'Engaged', value: 1764, replies: 187 },
    { rank: 7, name: 'Casey White', initials: 'CW', badge: 'Active', value: 1583, replies: 165 },
    { rank: 8, name: 'Jordan Smith', initials: 'JS', badge: 'Active', value: 1402, replies: 142 },
    { rank: 9, name: 'Alex Chen', initials: 'AC', badge: 'Participator', value: 1221, replies: 118 },
    { rank: 10, name: 'Sam Wilson', initials: 'SW', badge: 'Newcomer', value: 845, replies: 89 },
  ];

  const getLeaderboardData = () => {
    switch (activeTab) {
      case 'streak':
        return streakLeaderboard;
      case 'discipline':
        return disciplineLeaderboard;
      case 'helpful':
        return helpfulLeaderboard;
      default:
        return streakLeaderboard;
    }
  };

  const getHeaderColor = () => {
    switch (activeTab) {
      case 'streak':
        return ['#FFD700', '#FFA500'];
      case 'discipline':
        return ['#10b981', '#059669'];
      case 'helpful':
        return ['#EC4899', '#DB2777'];
      default:
        return ['#FFD700', '#FFA500'];
    }
  };

  const leaderboardData = getLeaderboardData();
  const userPosition = currentRank || 15;

  const renderAvatarCircle = (initials: string) => (
    <Svg height="80" width="80">
      <Circle cx="40" cy="40" r="40" fill="#10b981" />
      <SvgText
        x="40"
        y="45"
        fontSize="28"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        {initials}
      </SvgText>
    </Svg>
  );

  const renderLeaderboardItem = (trader: Trader, isUserPosition: boolean) => (
    <View
      key={trader.rank}
      style={[
        styles.leaderboardItem,
        isUserPosition && styles.userPositionItem,
      ]}
    >
      <Text
        style={[
          styles.leaderboardRank,
          isUserPosition && styles.userPositionText,
        ]}
      >
        #{trader.rank}
      </Text>
      <Svg height="36" width="36" style={styles.leaderboardAvatar}>
        <Circle cx="18" cy="18" r="18" fill="#10b981" />
        <SvgText
          x="18"
          y="23"
          fontSize="12"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          {trader.initials}
        </SvgText>
      </Svg>
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{trader.name}</Text>
        <Text style={styles.leaderboardBadge}>{trader.badge}</Text>
      </View>
      <Text
        style={[
          styles.leaderboardValue,
          isUserPosition && styles.userPositionText,
        ]}
      >
        {trader.value}
        {activeTab === 'helpful' && trader.replies ? ` (${trader.replies})` : ''}
      </Text>
      {activeTab === 'discipline' && (
        <View style={styles.disciplineProgressBar}>
          <View
            style={[
              styles.disciplineProgress,
              {
                width: `${parseFloat(trader.value as string)}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Text style={styles.icon}>↗</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.iconButton}
            >
              <Text style={styles.icon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          {renderAvatarCircle(avatarInitials)}
          <View style={styles.profileInfo}>
            <Text style={styles.traderName}>{traderName || 'Trader'}</Text>
            <Text style={styles.realName}>{name || 'User'}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>Rank #{currentRank || 15}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.tiltFreeText}>{streak || 0} days tilt-free 🔥</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>89</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>You haven't posted anything yet</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaderboards</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'streak' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('streak')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'streak' && styles.activeTabText,
              ]}
            >
              Streak
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'discipline' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('discipline')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'discipline' && styles.activeTabText,
              ]}
            >
              Discipline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'helpful' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('helpful')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'helpful' && styles.activeTabText,
              ]}
            >
              Most Helpful
            </Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={getHeaderColor() as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.boardHeader}
        >
          <Text style={styles.boardHeaderText}>Top 10</Text>
        </LinearGradient>

        <View style={styles.leaderboardContainer}>
          {leaderboardData.map((trader) =>
            renderLeaderboardItem(trader, false)
          )}

          <View style={styles.userPositionSeparator} />
          <View style={styles.leaderboardItem}>
            <Text style={[styles.leaderboardRank, styles.userPositionText]}>
              #{userPosition}
            </Text>
            <Svg height="36" width="36" style={styles.leaderboardAvatar}>
              <Circle cx="18" cy="18" r="18" fill="#10b981" />
              <SvgText
                x="18"
                y="23"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                {avatarInitials}
              </SvgText>
            </Svg>
            <View style={styles.leaderboardInfo}>
              <Text style={[styles.leaderboardName, styles.userPositionText]}>
                {traderName || 'You'}
              </Text>
              <Text style={styles.leaderboardBadge}>Your Position</Text>
            </View>
            <Text style={[styles.leaderboardValue, styles.userPositionText]}>
              {activeTab === 'streak'
                ? streak || 0
                : activeTab === 'discipline'
                  ? '87%'
                  : '1,245'}
            </Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referralBanner}
      >
        <Text style={styles.referralTitle}>Share Zero Tilt</Text>
        <Text style={styles.referralText}>
          Invite friends and earn exclusive rewards
        </Text>
        <TouchableOpacity
          style={styles.referralButton}
          onPress={handleShare}
        >
          <Text style={styles.referralButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={styles.menuItemText}>Subscription</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.menuItemText}>Privacy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel' },
              {
                text: 'Log Out',
                onPress: () => navigation.navigate('Auth'),
                style: 'destructive',
              },
            ]);
          }}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    color: 'white',
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1a1a1d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  traderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 2,
  },
  realName: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  rankBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rankBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tiltFreeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#1a1a1d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  boardHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 0,
  },
  boardHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  leaderboardContainer: {
    backgroundColor: '#1a1a1d',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  leaderboardItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
    gap: 8,
  },
  userPositionSeparator: {
    height: 1,
    backgroundColor: '#10b981',
    marginVertical: 4,
  },
  userPositionItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderBottomWidth: 0,
  },
  leaderboardRank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 28,
  },
  leaderboardAvatar: {
    marginRight: 4,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  leaderboardBadge: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  leaderboardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    minWidth: 50,
    textAlign: 'right',
  },
  userPositionText: {
    color: '#10b981',
  },
  disciplineProgressBar: {
    width: 50,
    height: 4,
    backgroundColor: '#2a2a2d',
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 8,
  },
  disciplineProgress: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  referralBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  referralText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  referralButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  referralButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  logoutText: {
    color: '#EF4444',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  spacer: {
    height: 20,
  },
});
