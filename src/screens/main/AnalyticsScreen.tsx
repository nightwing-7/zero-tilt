import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText, G, Path } from 'react-native-svg';

const COLORS = {
  emerald: '#10b981',
  emeraldDark: '#059669',
  amber: '#f59e0b',
  amberDark: '#d97706',
  red: '#ef4444',
  background: '#111113',
  textPrimary: '#fff',
  textSecondary: '#e0e0e0',
  textMuted: '#a0a0a0',
  textDim: '#666',
  card: 'rgba(255,255,255,0.04)',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',
  purple: '#a855f7',
  blue: '#3b82f6',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

// Demo data
const DEMO_DATA = {
  traderName: 'Alex Chen',
  currentRank: 'Top 23%',
  currentStreak: 23,
  bestStreak: 42,
  avgStreak: 18,
  relapses: 3,
  disciplineScore: 2840,
  disciplinePercentage: 87,
  journalEntries: 18,
  urgesResisted: 83,
  ranking: 'Top 23%',
  tradingDays: '4/5',
  urgesResistedCount: '6/7',
  tiltEpisodes: 1,
  planFollowed: 80,
  daysWithoutTilt: 12,
  checklistRate: 87,
  breathingSessions: 9,
  goalsHitRate: 72,
  urgesResistedPct: 83,
  totalUrges: 24,
  avgIntensity: 7.2,
  resistedPct: 83,
  streakHistory: [
    { days: 23, status: 'active' },
    { days: 12, status: 'completed' },
    { days: 8, status: 'completed' },
    { days: 5, status: 'completed' },
  ],
  triggerBreakdown: [
    { label: 'Revenge Trading', value: 40 },
    { label: 'FOMO', value: 30 },
    { label: 'Overconfidence', value: 20 },
    { label: 'Stress', value: 10 },
  ],
  moodHistory: [5, 4, 3, 4, 5, 4, 3],
  radarData: {
    'Plan Adherence': 85,
    'Risk Mgmt': 72,
    'Emotion Control': 78,
    'Patience': 68,
    'Consistency': 82,
    'Self-Awareness': 74,
  },
  weeklyActivity: [8, 6, 5, 9, 7, 4, 3],
};

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Great', score: 5 },
  { emoji: '🙂', label: 'Good', score: 4 },
  { emoji: '😐', label: 'Okay', score: 3 },
  { emoji: '😔', label: 'Bad', score: 2 },
  { emoji: '😢', label: 'Terrible', score: 1 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SKILLS = [
  { icon: '🧠', label: 'Pattern Recognition' },
  { icon: '⏸️', label: 'Impulse Control' },
  { icon: '📊', label: 'Data Analysis' },
  { icon: '😤', label: 'Frustration Tolerance' },
  { icon: '🎯', label: 'Focus' },
  { icon: '💪', label: 'Discipline' },
  { icon: '🔄', label: 'Adaptability' },
  { icon: '📈', label: 'Growth Mindset' },
];

const BRAIN_PHASES = [
  { label: 'Awareness', percentage: 20 },
  { label: 'Resistance', percentage: 40 },
  { label: 'Reconditioning', percentage: 60 },
  { label: 'Mastery', percentage: 80 },
  { label: 'Fully Rewired', percentage: 100 },
];

interface StreakRingProps {
  current: number;
  goal: number;
  size: number;
}

const StreakRing: React.FC<StreakRingProps> = ({ current, goal, size }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2.5;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((current / goal) * 100, 100);
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Svg width={size} height={size} style={styles.chartSvg}>
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={COLORS.glassBorder}
        strokeWidth="8"
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={COLORS.emerald}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${centerX} ${centerY})`}
      />
      <SvgText
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        fill={COLORS.textPrimary}
        fontSize="32"
        fontWeight="bold"
      >
        {current}
      </SvgText>
      <SvgText
        x={centerX}
        y={centerY + 16}
        textAnchor="middle"
        fill={COLORS.textMuted}
        fontSize="12"
      >
        / {goal} days
      </SvgText>
    </Svg>
  );
};

interface BarChartProps {
  values: number[];
  size: number;
  maxValue?: number;
  labels?: string[];
}

const BarChart: React.FC<BarChartProps> = ({ values, size, maxValue = Math.max(...values, 1), labels = DAYS }) => {
  const width = size;
  const height = 120;
  const barWidth = (width - 60) / values.length;
  const chartHeight = height - 40;

  return (
    <Svg width={width} height={height} style={styles.chartSvg}>
      {values.map((val, i) => {
        const barHeight = (val / maxValue) * chartHeight;
        const x = 30 + i * barWidth;
        const y = height - 30 - barHeight;
        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth - 6}
              height={barHeight}
              fill={COLORS.emerald}
              rx="4"
            />
            <SvgText
              x={x + (barWidth - 6) / 2}
              y={height - 10}
              textAnchor="middle"
              fill={COLORS.textMuted}
              fontSize="10"
            >
              {labels?.[i] || ''}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

interface RadarChartProps {
  data: Record<string, number>;
  size: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2.5;
  const levels = 5;
  const labels = Object.keys(data);
  const values = Object.values(data);
  const numAxes = labels.length;
  const angle = (Math.PI * 2) / numAxes;

  const gridCircles = [];
  for (let i = 1; i <= levels; i++) {
    const r = (radius / levels) * i;
    gridCircles.push(
      <Circle
        key={`grid-${i}`}
        cx={centerX}
        cy={centerY}
        r={r}
        fill="none"
        stroke={COLORS.glassBorder}
        strokeWidth="1"
      />
    );
  }

  const axes = [];
  for (let i = 0; i < numAxes; i++) {
    const x = centerX + radius * Math.cos(angle * i - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle * i - Math.PI / 2);
    axes.push(
      <Line
        key={`axis-${i}`}
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke={COLORS.glassBorder}
        strokeWidth="1"
      />
    );
  }

  const polygonPoints = values
    .map((val, i) => {
      const r = (radius / 100) * val;
      const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
      const y = centerY + r * Math.sin(angle * i - Math.PI / 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={size} height={size} style={styles.chartSvg}>
      {gridCircles}
      {axes}
      <Polygon
        points={polygonPoints}
        fill={`${COLORS.emerald}30`}
        stroke={COLORS.emerald}
        strokeWidth="2"
      />
    </Svg>
  );
};

interface HorizontalProgressBarProps {
  label: string;
  value: number;
}

const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({ label, value }) => (
  <View style={styles.progressBarContainer}>
    <View style={styles.progressBarLabel}>
      <Text style={styles.progressBarLabelText}>{label}</Text>
      <Text style={styles.progressBarValue}>{value}%</Text>
    </View>
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${value}%`, backgroundColor: COLORS.emerald },
        ]}
      />
    </View>
  </View>
);

interface StatsCardModalProps {
  visible: boolean;
  onClose: () => void;
}

const StatsCardModal: React.FC<StatsCardModalProps> = ({ visible, onClose }) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my Zero Tilt stats! I\'m on a ${DEMO_DATA.currentStreak} day streak with ${DEMO_DATA.disciplinePercentage}% discipline. Join me on Zero Tilt! #NoTilt #ZeroTilt`,
        title: 'My Zero Tilt Stats',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Card Content */}
          <View style={styles.statsCard}>
            {/* Header with Brand */}
            <View style={styles.cardHeader}>
              <View style={styles.cardBrandContainer}>
                <Text style={styles.cardBrand}>ZERO TILT</Text>
                <Text style={styles.cardShield}>🛡️</Text>
              </View>
            </View>

            {/* User Section */}
            <View style={styles.cardUserSection}>
              <Text style={styles.cardUserName}>{DEMO_DATA.traderName}</Text>
              <Text style={styles.cardUserRank}>{DEMO_DATA.currentRank}</Text>
            </View>

            {/* Streak Ring */}
            <View style={styles.cardRingContainer}>
              <StreakRing current={DEMO_DATA.currentStreak} goal={90} size={100} />
            </View>

            {/* Mini Stats */}
            <View style={styles.cardMiniStatsRow}>
              <View style={styles.cardMiniStat}>
                <Text style={styles.cardMiniStatValue}>{DEMO_DATA.disciplinePercentage}%</Text>
                <Text style={styles.cardMiniStatLabel}>Discipline</Text>
              </View>
              <View style={styles.cardMiniStat}>
                <Text style={styles.cardMiniStatValue}>{DEMO_DATA.journalEntries}</Text>
                <Text style={styles.cardMiniStatLabel}>Journals</Text>
              </View>
              <View style={styles.cardMiniStat}>
                <Text style={styles.cardMiniStatValue}>{DEMO_DATA.urgesResisted}%</Text>
                <Text style={styles.cardMiniStatLabel}>Urges Beat</Text>
              </View>
            </View>

            {/* Brain Rewiring Progress */}
            <View style={styles.cardBrainSection}>
              <Text style={styles.cardBrainLabel}>Brain Rewiring Progress</Text>
              <View style={styles.cardBrainBars}>
                {BRAIN_PHASES.map((phase, i) => (
                  <View key={i} style={styles.cardBrainPhase}>
                    <View
                      style={[
                        styles.cardBrainPhaseBar,
                        { width: `${phase.percentage}%` },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.cardBrainLabels}>
                {BRAIN_PHASES.map((phase, i) => (
                  <Text key={i} style={styles.cardBrainPhaseName}>
                    {phase.label}
                  </Text>
                ))}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLeft}>
                <Text style={styles.cardFooterWebsite}>zerotilt.io</Text>
              </View>
              <View style={styles.cardFooterCenter}>
                <Text style={styles.cardFooterHashtags}>#ZeroTilt #NoTilt</Text>
              </View>
              <View style={styles.cardFooterRight}>
                <View style={styles.cardQRPlaceholder}>
                  <Text style={styles.cardQRText}>QR</Text>
                </View>
              </View>
            </View>

            {/* Supported By Bar */}
            <View style={styles.cardSupportedBar}>
              <Text style={styles.cardSupportedText}>Supported by ZERO TILT</Text>
              <View style={styles.cardPromoCode}>
                <Text style={styles.cardPromoText}>NoTilt</Text>
              </View>
            </View>
          </View>

          {/* Share Buttons */}
          <View style={styles.shareButtonsContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>𝕏</Text>
              <Text style={styles.shareButtonLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>📷</Text>
              <Text style={styles.shareButtonLabel}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>🔗</Text>
              <Text style={styles.shareButtonLabel}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'urges' | 'mood'>('overview');
  const [statsModalVisible, setStatsModalVisible] = useState(false);

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {(['overview', 'stats', 'urges', 'mood'] as const).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Days Clean Ring */}
      <View style={styles.sectionContainer}>
        <View style={styles.ringContainer}>
          <StreakRing current={DEMO_DATA.currentStreak} goal={90} size={160} />
        </View>
        <Text style={styles.rankLabel}>{DEMO_DATA.ranking}</Text>
      </View>

      {/* Brain Rewiring Progress */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Brain Rewiring Progress</Text>
        <View style={styles.brainPhasesContainer}>
          {BRAIN_PHASES.map((phase, i) => (
            <View key={i} style={styles.brainPhaseCard}>
              <View
                style={[
                  styles.brainPhaseIndicator,
                  {
                    backgroundColor:
                      i <= 1 ? COLORS.emerald : i <= 2 ? COLORS.amber : COLORS.textMuted,
                  },
                ]}
              />
              <Text style={styles.brainPhaseLabel}>{phase.label}</Text>
              <Text style={styles.brainPhasePercent}>{phase.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatLabel}>Current Streak</Text>
          <Text style={styles.quickStatValue}>{DEMO_DATA.currentStreak}</Text>
          <Text style={styles.quickStatUnit}>days</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatLabel}>Best Streak</Text>
          <Text style={styles.quickStatValue}>{DEMO_DATA.bestStreak}</Text>
          <Text style={styles.quickStatUnit}>days</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatLabel}>Discipline Score</Text>
          <Text style={styles.quickStatValue}>{DEMO_DATA.disciplinePercentage}%</Text>
          <Text style={styles.quickStatUnit}>score</Text>
        </View>
      </View>

      {/* Weekly Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <BarChart values={DEMO_DATA.weeklyActivity} size={ScreenWidth - 40} />
      </View>

      {/* Coach Card */}
      <TouchableOpacity style={styles.coachCard} activeOpacity={0.8}>
        <Text style={styles.coachIcon}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.coachTitle}>Talk to Coach</Text>
          <Text style={styles.coachSubtitle}>Get personalized advice</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Share Stats Button */}
      <TouchableOpacity
        style={styles.shareStatsButton}
        onPress={() => setStatsModalVisible(true)}
      >
        <Text style={styles.shareStatsButtonText}>📊 Share My Stats Card</Text>
      </TouchableOpacity>

      {/* Stat Cards Row 1 - 3 Column */}
      <View style={styles.statCardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👑</Text>
          <Text style={styles.statValue}>{DEMO_DATA.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{DEMO_DATA.avgStreak}</Text>
          <Text style={styles.statLabel}>Avg Streak</Text>
        </View>
        <View style={[styles.statCard, styles.relapseCard]}>
          <Text style={styles.statIcon}>↓</Text>
          <Text style={styles.statValue}>{DEMO_DATA.relapses}</Text>
          <Text style={styles.statLabel}>Relapses</Text>
        </View>
      </View>

      {/* 2 Column: Discipline & Ranking */}
      <View style={styles.statCardsRow}>
        <View style={styles.disciplineCard}>
          <Text style={styles.disciplineIcon}>🛡️</Text>
          <Text style={styles.disciplineValue}>{DEMO_DATA.disciplineScore}</Text>
          <Text style={styles.disciplineLabel}>Discipline Score</Text>
        </View>
        <View style={styles.disciplineCard}>
          <Text style={styles.disciplineIcon}>🏆</Text>
          <Text style={styles.disciplineValue}>{DEMO_DATA.ranking}</Text>
          <Text style={styles.disciplineLabel}>Ranking</Text>
        </View>
      </View>

      {/* This Week Summary */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekSummaryGrid}>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{DEMO_DATA.tradingDays}</Text>
            <Text style={styles.weekStatLabel}>Trading Days</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{DEMO_DATA.urgesResistedCount}</Text>
            <Text style={styles.weekStatLabel}>Urges Resisted</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{DEMO_DATA.tiltEpisodes}</Text>
            <Text style={styles.weekStatLabel}>Tilt Episodes</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{DEMO_DATA.planFollowed}%</Text>
            <Text style={styles.weekStatLabel}>Plan Followed</Text>
          </View>
        </View>
      </View>

      {/* Trading Discipline Profile */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trading Discipline Profile</Text>
        <View style={styles.radarContainer}>
          <RadarChart data={DEMO_DATA.radarData} size={300} />
        </View>
      </View>

      {/* Trading Stats Grid */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trading Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.daysWithoutTilt}</Text>
            <Text style={styles.gridStatLabel}>Days Without Tilt</Text>
          </View>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.checklistRate}%</Text>
            <Text style={styles.gridStatLabel}>Checklist Rate</Text>
          </View>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.journalEntries}</Text>
            <Text style={styles.gridStatLabel}>Journal Entries</Text>
          </View>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.breathingSessions}</Text>
            <Text style={styles.gridStatLabel}>Breathing Sessions</Text>
          </View>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.goalsHitRate}%</Text>
            <Text style={styles.gridStatLabel}>Goals Hit Rate</Text>
          </View>
          <View style={styles.gridStat}>
            <Text style={styles.gridStatValue}>{DEMO_DATA.urgesResistedPct}%</Text>
            <Text style={styles.gridStatLabel}>Urges Resisted</Text>
          </View>
        </View>
      </View>

      {/* Streak History */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Streak History</Text>
        {DEMO_DATA.streakHistory.map((streak, i) => (
          <View key={i} style={styles.streakHistoryItem}>
            <View>
              <Text style={styles.streakHistoryValue}>{streak.days} days</Text>
              <Text style={styles.streakHistoryStatus}>
                {streak.status === 'active' ? '🟢 Active' : '✓ Completed'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Skills You're Building */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Skills You're Building</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map((skill, i) => (
            <View key={i} style={styles.skillCard}>
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={styles.skillLabel}>{skill.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderUrgesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Main Trigger Display */}
      <View style={styles.mainTriggerContainer}>
        <Text style={styles.mainTriggerEmoji}>📊</Text>
        <Text style={styles.mainTriggerLabel}>Revenge Trading</Text>
        <Text style={styles.mainTriggerValue}>40% of all urges</Text>
      </View>

      {/* Tip Card */}
      <View style={[styles.tipCard, { borderLeftColor: COLORS.emerald }]}>
        <Text style={styles.tipTitle}>💡 Tip</Text>
        <Text style={styles.tipText}>
          Revenge trading typically follows losses. Take a break and reset before continuing.
        </Text>
      </View>

      {/* Stat Cards */}
      <View style={styles.statCardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statValue}>{DEMO_DATA.totalUrges}</Text>
          <Text style={styles.statLabel}>Total Urges</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{DEMO_DATA.avgIntensity.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Intensity</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✓</Text>
          <Text style={styles.statValue}>{DEMO_DATA.resistedPct}%</Text>
          <Text style={styles.statLabel}>% Resisted</Text>
        </View>
      </View>

      {/* Trigger Breakdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trigger Breakdown</Text>
        {DEMO_DATA.triggerBreakdown.map((trigger, i) => (
          <HorizontalProgressBar key={i} label={trigger.label} value={trigger.value} />
        ))}
      </View>

      {/* Your Urge Patterns */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Urge Patterns</Text>
        <View style={styles.patternCard}>
          <Text style={styles.patternText}>
            Peak urges occur between 10 AM - 12 PM, especially after losing trades.
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderMoodTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Mood Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodSelector}>
          {MOOD_EMOJIS.map(m => (
            <TouchableOpacity key={m.score} style={styles.moodSelectorButton} activeOpacity={0.7}>
              <Text style={styles.moodSelectorEmoji}>{m.emoji}</Text>
              <Text style={styles.moodSelectorLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood History Chart */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <Svg width={ScreenWidth - 40} height={140} style={styles.chartSvg}>
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(i => (
            <Line
              key={`grid-${i}`}
              x1="30"
              y1={20 + i * 16}
              x2={ScreenWidth - 70}
              y2={20 + i * 16}
              stroke={COLORS.glassBorder}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}
          {/* Mood line */}
          {DEMO_DATA.moodHistory.map((mood, i) => {
            if (i === DEMO_DATA.moodHistory.length - 1) return null;
            const x1 = 30 + (i / (DEMO_DATA.moodHistory.length - 1)) * (ScreenWidth - 100);
            const y1 = 100 - (mood / 5) * 80;
            const nextMood = DEMO_DATA.moodHistory[i + 1];
            const x2 = 30 + ((i + 1) / (DEMO_DATA.moodHistory.length - 1)) * (ScreenWidth - 100);
            const y2 = 100 - (nextMood / 5) * 80;
            return (
              <Line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLORS.emerald}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          {/* Mood dots */}
          {DEMO_DATA.moodHistory.map((mood, i) => {
            const x = 30 + (i / (DEMO_DATA.moodHistory.length - 1)) * (ScreenWidth - 100);
            const y = 100 - (mood / 5) * 80;
            return (
              <Circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill={COLORS.emerald}
                stroke={COLORS.background}
                strokeWidth="2"
              />
            );
          })}
        </Svg>
      </View>

      {/* Mood Distribution */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Mood Distribution</Text>
        <View style={styles.moodDistribution}>
          {MOOD_EMOJIS.map((m, i) => (
            <View key={i} style={styles.moodDistRow}>
              <Text style={styles.moodDistEmoji}>{m.emoji}</Text>
              <Text style={styles.moodDistLabel}>{m.label}</Text>
              <View style={styles.moodDistBar}>
                <View
                  style={[
                    styles.moodDistFill,
                    { width: `${Math.random() * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.moodDistCount}>{Math.floor(Math.random() * 12) + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'urges' && renderUrgesTab()}
        {activeTab === 'mood' && renderMoodTab()}
      </View>

      {/* Stats Card Modal */}
      <StatsCardModal visible={statsModalVisible} onClose={() => setStatsModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.emerald,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  /* Overview Tab */
  ringContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSvg: {
    alignSelf: 'center',
  },
  rankLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  brainPhasesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  brainPhaseCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  brainPhaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  brainPhaseLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  brainPhasePercent: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 6,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickStatUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  coachCard: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  coachIcon: {
    fontSize: 32,
  },
  coachTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  coachSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /* Stats Tab */
  shareStatsButton: {
    backgroundColor: COLORS.emerald,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  shareStatsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  relapseCard: {
    borderColor: COLORS.red,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  disciplineCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  disciplineIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  disciplineValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  disciplineLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  weekSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekStat: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  weekStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  radarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridStat: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  gridStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  gridStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  streakHistoryItem: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  streakHistoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  streakHistoryStatus: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  skillIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  skillLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  /* Urges Tab */
  mainTriggerContainer: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTriggerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mainTriggerLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mainTriggerValue: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  tipCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarLabelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressBarValue: {
    fontSize: 12,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  patternCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 12,
  },
  patternText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  /* Mood Tab */
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodSelectorButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  moodSelectorEmoji: {
    fontSize: 20,
  },
  moodSelectorLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  moodDistribution: {
    gap: 12,
  },
  moodDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodDistEmoji: {
    fontSize: 18,
    width: 24,
  },
  moodDistLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    width: 80,
  },
  moodDistBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  moodDistFill: {
    height: '100%',
    backgroundColor: COLORS.emerald,
  },
  moodDistCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    width: 24,
    textAlign: 'right',
  },

  /* Stats Card Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: ScreenWidth - 30,
    alignItems: 'center',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'linear-gradient(135deg, #1a1a1d 0%, #0d0d0f 100%)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardBrand: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 2,
  },
  cardShield: {
    fontSize: 24,
  },
  cardUserSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardUserRank: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardRingContainer: {
    marginBottom: 16,
  },
  cardMiniStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  cardMiniStat: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cardMiniStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardMiniStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardBrainSection: {
    width: '100%',
    marginBottom: 12,
  },
  cardBrainLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBrainBars: {
    gap: 4,
  },
  cardBrainPhase: {
    height: 6,
    backgroundColor: COLORS.glass,
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardBrainPhaseBar: {
    height: '100%',
    backgroundColor: COLORS.emerald,
    borderRadius: 3,
  },
  cardBrainLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cardBrainPhaseName: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    marginBottom: 12,
  },
  cardFooterLeft: {
    flex: 1,
  },
  cardFooterWebsite: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  cardFooterCenter: {
    flex: 1,
    alignItems: 'center',
  },
  cardFooterHashtags: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  cardFooterRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardQRPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardQRText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardSupportedBar: {
    width: '100%',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSupportedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  cardPromoCode: {
    backgroundColor: COLORS.amber,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cardPromoText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.background,
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  shareButtonText: {
    fontSize: 18,
  },
  shareButtonLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default AnalyticsScreen;
