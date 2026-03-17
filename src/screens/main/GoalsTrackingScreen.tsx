import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const COLORS = {
  emerald: '#10b981',
  emeraldDark: '#059669',
  amber: '#f59e0b',
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

const DEFAULT_GOALS = [
  { icon: '📖', label: 'Journal Daily', color: COLORS.emerald },
  { icon: '🧘', label: 'Meditate Daily', color: COLORS.blue },
  { icon: '📚', label: 'Read Trading Book', color: COLORS.purple },
  { icon: '💪', label: 'Exercise', color: COLORS.teal },
  { icon: '😴', label: 'Sleep 8 Hours', color: COLORS.pink },
  { icon: '❌', label: 'No Revenge Trading', color: COLORS.red },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface Goal {
  id: string;
  user_id: string;
  icon: string;
  label: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface GoalCheckin {
  id: string;
  goal_id: string;
  checked_date: string;
  completed: boolean;
}

interface DayCheckins {
  [dayIndex: number]: {
    [goalId: string]: boolean;
  };
}

const GoalsTrackingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkins, setCheckins] = useState<GoalCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customGoalLabel, setCustomGoalLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS.emerald);
  const [dayCheckinsMap, setDayCheckinsMap] = useState<DayCheckins>({});

  const AVAILABLE_COLORS = [
    COLORS.emerald,
    COLORS.blue,
    COLORS.purple,
    COLORS.teal,
    COLORS.pink,
  ];

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (goalsError) throw goalsError;

      const { data: checkinsData, error: checkinsError } = await supabase
        .from('goal_checkins')
        .select('*')
        .eq('user_id', user.id);

      if (checkinsError) throw checkinsError;

      setGoals(goalsData || []);
      setCheckins(checkinsData || []);
      buildDayCheckinsMap(checkinsData || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildDayCheckinsMap = (checkinsData: GoalCheckin[]) => {
    const map: DayCheckins = {};
    checkinsData.forEach(checkin => {
      const date = new Date(checkin.checked_date);
      const dayIndex = date.getDay();
      if (!map[dayIndex]) map[dayIndex] = {};
      map[dayIndex][checkin.goal_id] = checkin.completed;
    });
    setDayCheckinsMap(map);
  };

  const handleAddGoal = async (goalIcon: string, goalLabel: string, goalColor: string) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        icon: goalIcon,
        label: goalLabel,
        color: goalColor,
        is_active: true,
      });

      if (error) throw error;
      fetchGoals();
      setShowAddModal(false);
      setCustomGoalLabel('');
      setSelectedColor(COLORS.emerald);
    } catch (err) {
      console.error('Failed to add goal:', err);
      alert('Failed to add goal');
    }
  };

  const handleToggleDayCheckin = async (goalId: string, dayIndex: number) => {
    if (!user?.id) return;

    const date = getDateForDayIndex(dayIndex);
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentlyChecked = dayCheckinsMap[dayIndex]?.[goalId] || false;

    try {
      if (isCurrentlyChecked) {
        // Delete the checkin
        const { error } = await supabase
          .from('goal_checkins')
          .delete()
          .eq('goal_id', goalId)
          .eq('checked_date', dateStr)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert the checkin
        const { error } = await supabase.from('goal_checkins').insert({
          user_id: user.id,
          goal_id: goalId,
          checked_date: dateStr,
          completed: true,
        });

        if (error) throw error;
      }

      fetchGoals();
    } catch (err) {
      console.error('Failed to toggle checkin:', err);
    }
  };

  const getDateForDayIndex = (dayIndex: number): Date => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = dayIndex - currentDay;
    const date = new Date(today);
    date.setDate(date.getDate() + diff);
    return date;
  };

  const getTodayDayIndex = (): number => {
    return new Date().getDay();
  };

  const getWeekdayBubblesStatus = () => {
    const statusMap: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }; // Mon-Fri
    goals.forEach(goal => {
      WEEKDAYS.forEach((_, dayIndex) => {
        if (dayCheckinsMap[dayIndex]?.[goal.id]) {
          statusMap[dayIndex]++;
        }
      });
    });
    return statusMap;
  };

  const bubblesStatus = getWeekdayBubblesStatus();
  const totalGoals = goals.length;

  const renderWeeklyOverview = () => (
    <View style={styles.weeklyOverviewContainer}>
      <View style={styles.weeklyBubbles}>
        {WEEKDAYS.map((day, i) => {
          const completed = bubblesStatus[i];
          const isToday = getTodayDayIndex() === i + 1 || (i === 4 && getTodayDayIndex() === 5);
          let bubbleStyle = styles.bubbleEmpty;
          let bubbleInner = null;

          if (completed === totalGoals && totalGoals > 0) {
            bubbleStyle = styles.bubbleFilled;
            bubbleInner = <Text style={styles.bubbleCheck}>✓</Text>;
          } else if (completed > 0) {
            bubbleStyle = styles.bubblePartial;
            bubbleInner = (
              <Text style={styles.bubbleCount}>
                {completed}/{totalGoals}
              </Text>
            );
          } else {
            bubbleStyle = styles.bubbleDashed;
            bubbleInner = <Text style={styles.bubbleDay}>{day.charAt(0)}</Text>;
          }

          return (
            <View
              key={i}
              style={[
                styles.bubbleContainer,
                isToday && styles.bubbleContainerToday,
              ]}
            >
              <View style={[styles.bubble, bubbleStyle]}>
                {bubbleInner}
              </View>
              <Text style={styles.bubbleLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderGoalCard = (goal: Goal) => {
    const checkinCount = WEEKDAYS.filter((_, i) => dayCheckinsMap[i]?.[goal.id]).length;
    const progressPercentage = (checkinCount / WEEKDAYS.length) * 100;

    return (
      <View key={goal.id} style={styles.goalCardContainer}>
        <View style={styles.goalCardHeader}>
          <View
            style={[
              styles.goalIconCircle,
              { backgroundColor: `${goal.color}30` },
            ]}
          >
            <Text style={styles.goalCardIcon}>{goal.icon}</Text>
          </View>
          <View style={styles.goalCardContent}>
            <Text style={styles.goalCardLabel}>{goal.label}</Text>
            <Text style={styles.goalCardSubtitle}>
              {checkinCount}/{WEEKDAYS.length} trading days
            </Text>
          </View>
          <Text style={styles.goalCardProgress}>{Math.round(progressPercentage)}%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%`, backgroundColor: goal.color },
            ]}
          />
        </View>

        {/* Weekday Bubbles */}
        <View style={styles.dayBubblesContainer}>
          {WEEKDAYS.map((dayLabel, dayIndex) => {
            const isChecked = dayCheckinsMap[dayIndex]?.[goal.id] || false;
            const isFuture = false; // Simplified for now

            return (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayBubble,
                  isChecked && styles.dayBubbleChecked,
                  isFuture && styles.dayBubbleFuture,
                ]}
                onPress={() => handleToggleDayCheckin(goal.id, dayIndex)}
              >
                {isChecked ? (
                  <SvgCircle
                    cx="10"
                    cy="10"
                    r="8"
                    fill={goal.color}
                  />
                ) : (
                  <>
                    <SvgCircle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke={COLORS.glassBorder}
                      strokeWidth="1"
                    />
                    <Text style={[styles.dayBubbleText, { fontSize: 8 }]}>
                      {dayLabel.charAt(0).toUpperCase()}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleSection}>
          <Text style={styles.headerTitle}>My Goals</Text>
          <Text style={styles.headerSubtitle}>
            {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addGoalButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Overview */}
      {goals.length > 0 && renderWeeklyOverview()}

      {/* Active Goals List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.emerald} />
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No active goals</Text>
          <Text style={styles.emptySubtext}>Create your first goal to get started</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyButtonText}>Add Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.goalsListContainer}
          showsVerticalScrollIndicator={false}
        >
          {goals.map(goal => renderGoalCard(goal))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Goal</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Suggested Goals */}
              <View>
                <Text style={styles.modalSectionTitle}>Suggested Goals</Text>
                {DEFAULT_GOALS.map((goal, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestedGoalItem}
                    onPress={() =>
                      handleAddGoal(goal.icon, goal.label, goal.color)
                    }
                  >
                    <View style={styles.suggestedGoalLeft}>
                      <Text style={styles.suggestedGoalIcon}>{goal.icon}</Text>
                      <Text style={styles.suggestedGoalLabel}>{goal.label}</Text>
                    </View>
                    <Text style={styles.suggestedGoalArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Goal */}
              <View style={styles.customGoalSection}>
                <Text style={styles.modalSectionTitle}>Create Custom Goal</Text>

                {/* Goal Label Input */}
                <TextInput
                  style={styles.customGoalInput}
                  placeholder="Goal name..."
                  placeholderTextColor={COLORS.textMuted}
                  value={customGoalLabel}
                  onChangeText={setCustomGoalLabel}
                  selectionColor={COLORS.emerald}
                />

                {/* Color Picker */}
                <Text style={styles.colorPickerLabel}>Color</Text>
                <View style={styles.colorPickerContainer}>
                  {AVAILABLE_COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color &&
                          styles.colorOptionSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Text style={styles.colorCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Add Custom Goal Button */}
                <TouchableOpacity
                  style={styles.addCustomGoalButton}
                  onPress={() =>
                    customGoalLabel.trim() &&
                    handleAddGoal('⭐', customGoalLabel, selectedColor)
                  }
                >
                  <Text style={styles.addCustomGoalButtonText}>
                    Add Custom Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalsTrackingScreen;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  addGoalButton: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addGoalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weeklyOverviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  weeklyBubbles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bubbleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  bubbleContainerToday: {
    opacity: 1,
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleFilled: {
    backgroundColor: COLORS.emerald,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  bubblePartial: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.emerald,
  },
  bubbleEmpty: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  bubbleDashed: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
  },
  bubbleCheck: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  bubbleCount: {
    fontSize: 12,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  bubbleDay: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bubbleLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  goalsListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  goalCardContainer: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  goalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCardIcon: {
    fontSize: 20,
  },
  goalCardContent: {
    flex: 1,
  },
  goalCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  goalCardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  goalCardProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dayBubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayBubble: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    minHeight: 28,
  },
  dayBubbleChecked: {
    borderColor: 'transparent',
  },
  dayBubbleFuture: {
    opacity: 0.5,
  },
  dayBubbleText: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 16,
  },
  suggestedGoalItem: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestedGoalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestedGoalIcon: {
    fontSize: 20,
  },
  suggestedGoalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  suggestedGoalArrow: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  customGoalSection: {
    marginTop: 12,
  },
  customGoalInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 12,
  },
  colorPickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  colorCheckmark: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  addCustomGoalButton: {
    backgroundColor: COLORS.emerald,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addCustomGoalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
