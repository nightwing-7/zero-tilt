export const FREE_TIER_LIMITS = {
  maxJournalEntries: 100,
  maxUrgeLogsPerDay: 50,
  maxDailyPledges: 1,
  maxBreathingSessions: 10,
  maxMilestones: 50,
};

export const TILT_TRIGGERS = [
  'FOMO',
  'Revenge Trading',
  'Boredom',
  'Overconfidence',
  'Fear of Missing Out',
  'Loss Aversion',
  'Overtrading',
  'Breaking Rules',
  'Leverage Abuse',
  'News Reaction',
];

export const COPING_STRATEGIES = [
  'Took a break',
  'Called a friend',
  'Went for a walk',
  'Did breathing exercise',
  'Reviewed trading plan',
  'Meditation',
  'Cold shower',
  'Journaled thoughts',
  'Played a game',
  'Listened to music',
];

export const MOOD_EMOJIS = {
  terrible: '😢',
  poor: '😟',
  neutral: '😐',
  good: '🙂',
  excellent: '🤩',
};

export const MOOD_VALUES = {
  terrible: 1,
  poor: 2,
  neutral: 3,
  good: 4,
  excellent: 5,
};

export const URGE_OUTCOMES = ['Resisted', 'Gave in', 'Distracted'];

export const MILESTONE_TIERS = {
  bronze: { name: 'Bronze', color: '#b87d3b', minPoints: 0 },
  silver: { name: 'Silver', color: '#c0c0c0', minPoints: 500 },
  gold: { name: 'Gold', color: '#ffd700', minPoints: 1500 },
  platinum: { name: 'Platinum', color: '#e5e4e2', minPoints: 3000 },
  diamond: { name: 'Diamond', color: '#b9f2ff', minPoints: 5000 },
};

export const MILESTONE_CATEGORIES = {
  streaks: 'Streaks',
  discipline: 'Discipline',
  journaling: 'Journaling',
  psychology: 'Psychology',
  community: 'Community',
};

export const BREATHING_PATTERN = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

export const DEFAULT_PLEDGE_TEXT = `I commit to mastering my trading psychology today.
I will follow my trading plan, manage risk responsibly, and journal every trade.
I will resist impulsive decisions and honor my stop losses.
Today, I trade with discipline and emotional control.`;

export const TRADING_STYLES = [
  'Day Trading',
  'Swing Trading',
  'Position Trading',
  'Scalping',
  'Options Trading',
  'Forex Trading',
  'Crypto Trading',
];

export const EXPERIENCE_LEVELS = [
  'Just Starting',
  'Less than 1 Year',
  '1-3 Years',
  '3-5 Years',
  '5+ Years',
];

export const MARKETS = [
  'Stocks',
  'Options',
  'Forex',
  'Crypto',
  'Futures',
  'Commodities',
];

export const TILT_ASSESSMENT_QUESTIONS = [
  {
    question: 'How often do you make revenge trades after a loss?',
    answers: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    question: 'How much do you overtrade when highly emotional?',
    answers: ['Not at all', 'Slightly', 'Moderately', 'Significantly', 'Extremely'],
  },
  {
    question: 'How often do you break your trading rules?',
    answers: ['Almost never', 'Occasionally', 'Sometimes', 'Frequently', 'Very frequently'],
  },
  {
    question: 'How much does FOMO affect your trading decisions?',
    answers: ['Not at all', 'Barely', 'Somewhat', 'Significantly', 'Very much'],
  },
  {
    question: 'How often do you exit winning trades too early due to fear?',
    answers: ['Rarely', 'Sometimes', 'Often', 'Very often', 'Almost always'],
  },
];

export const RISK_LEVELS = {
  0: { level: 'Excellent', description: 'You have strong emotional discipline' },
  1: { level: 'Good', description: 'You handle emotions fairly well' },
  2: { level: 'Moderate', description: 'You have some emotional challenges' },
  3: { level: 'High', description: 'Emotions significantly impact your trading' },
  4: { level: 'Critical', description: 'Your emotions are severely affecting your trading' },
};
