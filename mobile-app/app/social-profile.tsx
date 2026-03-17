import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useAnalytics } from '../hooks/useAnalytics';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface UserProfile {
  id: string;
  trader_name: string;
  avatar_url: string | null;
  bio: string | null;
  trading_style: string[];
  markets: string[];
  trading_experience: string;
  created_at: string;
  streakDays: number;
  milestonesUnlocked: number;
  urgesResisted: number;
}

export default function SocialProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { sendRequest, friends } = useFriends();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  const isOwnProfile = userId === user?.id;
  const isFriend = friends.some(f => f.friend_id === userId);

  useEffect(() => {
    track('profile_viewed');
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    if (!userId) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, trader_name, avatar_url, bio, trading_style, markets, trading_experience, created_at')
        .eq('id', userId)
        .single();

      const { data: streakData } = await supabase
        .from('streaks')
        .select('start_date')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      const { data: milestoneData } = await supabase
        .from('milestone_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('is_unlocked', true);

      const { data: urgeData } = await supabase
        .from('urge_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('resisted', true);

      const streakDays = streakData
        ? Math.floor((Date.now() - new Date(streakData.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      setProfile({
        ...profileData,
        streakDays,
        milestonesUnlocked: milestoneData?.length || 0,
        urgesResisted: urgeData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFriendRequest = async () => {
    if (!userId) return;
    const success = await sendRequest(userId);
    if (success) setRequestSent(true);
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        {/* Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {profile.trader_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.traderName}>{profile.trader_name}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.milestonesUnlocked}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.urgesResisted}</Text>
            <Text style={styles.statLabel}>Urges Resisted</Text>
          </View>
        </View>

        {/* Trading Info */}
        {profile.trading_style?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trading Style</Text>
            <View style={styles.tagRow}>
              {profile.trading_style.map((style, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.markets?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Markets</Text>
            <View style={styles.tagRow}>
              {profile.markets.map((market, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{market}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.trading_experience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.experienceText}>
              {profile.trading_experience.charAt(0).toUpperCase() + profile.trading_experience.slice(1)}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {!isOwnProfile && (
          <View style={styles.actions}>
            {isFriend ? (
              <View style={styles.friendBadge}>
                <Text style={styles.friendBadgeText}>Friends</Text>
              </View>
            ) : requestSent ? (
              <View style={styles.requestSentBadge}>
                <Text style={styles.requestSentText}>Request Sent</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.addFriendButton} onPress={handleFriendRequest}>
                <Text style={styles.addFriendText}>+ Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isOwnProfile && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg.primary },
  content: { padding: spacing[4] },
  loadingText: { color: colors.dark.text.tertiary, textAlign: 'center', marginTop: spacing[10] },
  backRow: { marginBottom: spacing[4] },
  backButton: { color: colors.accent.teal, fontSize: typography.sizes.base },
  profileHeader: { alignItems: 'center', marginBottom: spacing[6] },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: typography.weights.bold as any },
  traderName: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.dark.text.primary },
  bio: { color: colors.dark.text.secondary, textAlign: 'center', marginTop: spacing[2], lineHeight: 22 },
  memberSince: { color: colors.dark.text.muted, fontSize: typography.sizes.sm, marginTop: spacing[1] },
  statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] },
  statCard: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  statValue: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.accent.teal },
  statLabel: { color: colors.dark.text.tertiary, fontSize: typography.sizes.xs, marginTop: spacing[1] },
  section: { marginBottom: spacing[4] },
  sectionTitle: { color: colors.dark.text.secondary, fontWeight: typography.weights.semibold as any, marginBottom: spacing[2] },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: { backgroundColor: colors.dark.bg.secondary, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  tagText: { color: colors.dark.text.secondary, fontSize: typography.sizes.sm },
  experienceText: { color: colors.dark.text.primary, fontSize: typography.sizes.base },
  actions: { marginTop: spacing[4], alignItems: 'center' },
  addFriendButton: { backgroundColor: colors.accent.teal, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full },
  addFriendText: { color: '#fff', fontWeight: typography.weights.semibold as any },
  friendBadge: { backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full },
  friendBadgeText: { color: colors.accent.green, fontWeight: typography.weights.semibold as any },
  requestSentBadge: { backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full },
  requestSentText: { color: colors.dark.text.muted },
  editButton: {
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.accent.teal,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    alignSelf: 'center',
  },
  editButtonText: { color: colors.accent.teal, fontWeight: typography.weights.semibold as any },
});
