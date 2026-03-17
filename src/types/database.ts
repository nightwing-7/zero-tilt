export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ---- Row types (what you get back from SELECT) ----

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  trading_style: string | null;
  experience_level: string | null;
  pledge_text: string | null;
  why_i_trade: string | null;
  onboarding_completed: boolean;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  timezone: string | null;
  notifications_enabled: boolean;
  daily_reminder_time: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
  trader_name: string | null;
  bio: string | null;
  markets: string[];
  quiz_responses: Json;
  tilt_risk_level: string;
}

export interface StreakRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  days: number;
  is_current: boolean;
  ended_reason: string | null;
  created_at: string;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  mood: string | null;
  mood_score: number | null;
  title: string | null;
  content: string;
  tags: string[];
  is_pre_trade: boolean;
  is_post_trade: boolean;
  is_tilt_reflection: boolean;
  created_at: string;
  updated_at: string;
}

export interface UrgeLogRow {
  id: string;
  user_id: string;
  intensity: number;
  intensity_label: string | null;
  trigger_type: string;
  location: string | null;
  is_alone: boolean | null;
  responses: string[];
  resisted: boolean;
  breathing_completed: boolean;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export interface GoalRow {
  id: string;
  user_id: string;
  label: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

export interface GoalCheckinRow {
  id: string;
  user_id: string;
  goal_id: string;
  checked_date: string;
  completed: boolean;
  created_at: string;
}

export interface ChecklistItemRow {
  id: string;
  user_id: string;
  text: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export interface ChecklistCompletionRow {
  id: string;
  user_id: string;
  checklist_item_id: string;
  completed_date: string;
  checked: boolean;
  created_at: string;
}

export interface DailyPledgeRow {
  id: string;
  user_id: string;
  pledge_date: string;
  pledged: boolean;
  created_at: string;
}

export interface DailyCheckinRow {
  id: string;
  user_id: string;
  checkin_date: string;
  status: string;
  mood_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface PostRow {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  category: string | null;
  likes_count: number;
  comments_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface PostLikeRow {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PodRow {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
  trading_style: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface PodMemberRow {
  id: string;
  pod_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

export interface BadgeRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  requirement_type: string;
  requirement_value: number;
  sort_order: number;
}

export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface BreathingSessionRow {
  id: string;
  user_id: string;
  session_type: string | null;
  duration_seconds: number;
  completed: boolean;
  context: string | null;
  created_at: string;
}

export interface QuizResponseRow {
  id: string;
  user_id: string;
  question_key: string;
  answer: string;
  created_at: string;
}

export interface GameSessionRow {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  duration_seconds: number | null;
  context: string | null;
  created_at: string;
}

export interface NotificationPreferencesRow {
  id: string;
  user_id: string;
  pre_market_reminder: boolean;
  post_market_reflection: boolean;
  daily_checkin: boolean;
  urge_cooldown_alert: boolean;
  streak_milestones: boolean;
  weekly_report: boolean;
  community_posts: boolean;
  direct_messages: boolean;
  updated_at: string;
}

export interface PrivacySettingsRow {
  id: string;
  user_id: string;
  profile_visible: boolean;
  show_streak: boolean;
  show_leaderboard: boolean;
  show_activity: boolean;
  analytics_opt_in: boolean;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  revenue_cat_id: string | null;
  created_at: string;
}

// ---- Database type for Supabase client ----

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      streaks: {
        Row: StreakRow;
        Insert: Partial<StreakRow> & { user_id: string };
        Update: Partial<StreakRow>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: Partial<JournalEntryRow> & { user_id: string; content: string };
        Update: Partial<JournalEntryRow>;
        Relationships: [];
      };
      urge_logs: {
        Row: UrgeLogRow;
        Insert: Partial<UrgeLogRow> & { user_id: string; intensity: number; trigger_type: string };
        Update: Partial<UrgeLogRow>;
        Relationships: [];
      };
      goals: {
        Row: GoalRow;
        Insert: Partial<GoalRow> & { user_id: string; label: string };
        Update: Partial<GoalRow>;
        Relationships: [];
      };
      goal_checkins: {
        Row: GoalCheckinRow;
        Insert: Partial<GoalCheckinRow> & { user_id: string; goal_id: string; checked_date: string };
        Update: Partial<GoalCheckinRow>;
        Relationships: [];
      };
      checklist_items: {
        Row: ChecklistItemRow;
        Insert: Partial<ChecklistItemRow> & { user_id: string; text: string };
        Update: Partial<ChecklistItemRow>;
        Relationships: [];
      };
      checklist_completions: {
        Row: ChecklistCompletionRow;
        Insert: Partial<ChecklistCompletionRow> & { user_id: string; checklist_item_id: string; completed_date: string };
        Update: Partial<ChecklistCompletionRow>;
        Relationships: [];
      };
      daily_pledges: {
        Row: DailyPledgeRow;
        Insert: Partial<DailyPledgeRow> & { user_id: string; pledge_date: string };
        Update: Partial<DailyPledgeRow>;
        Relationships: [];
      };
      daily_checkins: {
        Row: DailyCheckinRow;
        Insert: Partial<DailyCheckinRow> & { user_id: string; checkin_date: string; status: string };
        Update: Partial<DailyCheckinRow>;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: Partial<PostRow> & { user_id: string; content: string };
        Update: Partial<PostRow>;
        Relationships: [];
      };
      comments: {
        Row: CommentRow;
        Insert: Partial<CommentRow> & { post_id: string; user_id: string; content: string };
        Update: Partial<CommentRow>;
        Relationships: [];
      };
      post_likes: {
        Row: PostLikeRow;
        Insert: Partial<PostLikeRow> & { post_id: string; user_id: string };
        Update: Partial<PostLikeRow>;
        Relationships: [];
      };
      pods: {
        Row: PodRow;
        Insert: Partial<PodRow> & { name: string; created_by: string };
        Update: Partial<PodRow>;
        Relationships: [];
      };
      pod_members: {
        Row: PodMemberRow;
        Insert: Partial<PodMemberRow> & { pod_id: string; user_id: string };
        Update: Partial<PodMemberRow>;
        Relationships: [];
      };
      friendships: {
        Row: FriendshipRow;
        Insert: Partial<FriendshipRow> & { requester_id: string; addressee_id: string };
        Update: Partial<FriendshipRow>;
        Relationships: [];
      };
      badges: {
        Row: BadgeRow;
        Insert: Partial<BadgeRow> & { slug: string; name: string; requirement_type: string; requirement_value: number };
        Update: Partial<BadgeRow>;
        Relationships: [];
      };
      user_badges: {
        Row: UserBadgeRow;
        Insert: Partial<UserBadgeRow> & { user_id: string; badge_id: string };
        Update: Partial<UserBadgeRow>;
        Relationships: [];
      };
      breathing_sessions: {
        Row: BreathingSessionRow;
        Insert: Partial<BreathingSessionRow> & { user_id: string; duration_seconds: number };
        Update: Partial<BreathingSessionRow>;
        Relationships: [];
      };
      quiz_responses: {
        Row: QuizResponseRow;
        Insert: Partial<QuizResponseRow> & { user_id: string; question_key: string; answer: string };
        Update: Partial<QuizResponseRow>;
        Relationships: [];
      };
      game_sessions: {
        Row: GameSessionRow;
        Insert: Partial<GameSessionRow> & { user_id: string; game_type: string };
        Update: Partial<GameSessionRow>;
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferencesRow;
        Insert: Partial<NotificationPreferencesRow> & { user_id: string };
        Update: Partial<NotificationPreferencesRow>;
        Relationships: [];
      };
      privacy_settings: {
        Row: PrivacySettingsRow;
        Insert: Partial<PrivacySettingsRow> & { user_id: string };
        Update: Partial<PrivacySettingsRow>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Partial<SubscriptionRow> & { user_id: string };
        Update: Partial<SubscriptionRow>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
