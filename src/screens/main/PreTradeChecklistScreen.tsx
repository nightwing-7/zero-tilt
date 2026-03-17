import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';

// Color overrides for this screen
const COLORS = {
  ...colors,
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
};

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom?: boolean;
}

const suggestedItems = [
  'Reviewed my trading plan',
  'Set stop losses',
  'Checked economic calendar',
  'Emotional state: Calm and focused',
  'Risk management rules clear',
  'No revenge trading motivation',
  'Proper position sizing calculated',
  'Trading journal reviewed',
];

const PreTradeChecklistScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Reviewed my trading plan', completed: false },
    { id: '2', text: 'Set stop losses', completed: false },
    { id: '3', text: 'Checked economic calendar', completed: false },
    { id: '4', text: 'Emotional state: Calm and focused', completed: false },
    { id: '5', text: 'Risk management rules clear', completed: false },
    { id: '6', text: 'No revenge trading motivation', completed: false },
    { id: '7', text: 'Proper position sizing calculated', completed: false },
    { id: '8', text: 'Trading journal reviewed', completed: false },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingLongPress, setEditingLongPress] = useState<string | null>(null);

  useEffect(() => {
    loadChecklistItems();
  }, [user?.id]);

  const loadChecklistItems = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;

      // Map database items to component state
      if (data) {
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          text: item.text,
          completed: false,
          isCustom: !item.is_default,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error loading checklist items:', error);
    }
  };

  const toggleItem = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addCustomItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText,
        completed: false,
        isCustom: true,
      };
      setItems([...items, newItem]);
      setNewItemText('');
      setShowAddModal(false);
    }
  };

  const addSuggestedItem = (text: string) => {
    // Check if item already exists
    if (!items.some((item) => item.text === text)) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text,
        completed: false,
        isCustom: false,
      };
      setItems([...items, newItem]);
    }
  };

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pre-Trade Checklist</Text>
          <Text style={styles.progressCounter}>
            {completedCount}/{totalCount} completed
          </Text>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <Svg
            width={120}
            height={120}
            viewBox="0 0 120 120"
            style={styles.progressRing}
          >
            {/* Background circle */}
            <Circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={colors.glassBorder}
              strokeWidth="6"
            />
            {/* Progress circle */}
            <Circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={COLORS.emerald}
              strokeWidth="6"
              strokeDasharray={`${(completionPercent / 100) * 314.159} 314.159`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <View style={styles.progressText}>
            <Text style={styles.progressPercent}>{Math.round(completionPercent)}%</Text>
          </View>
        </View>

        {/* Checklist Items */}
        <View style={styles.itemsContainer}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                key={item.id}
                style={styles.itemRow}
                onLongPress={() => setEditingLongPress(item.id)}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted,
                  ]}
                  onPress={() => toggleItem(item.id)}
                >
                  {item.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>

                {/* Item Text */}
                <Text
                  style={[
                    styles.itemText,
                    item.completed && styles.itemTextCompleted,
                  ]}
                >
                  {item.text}
                </Text>

                {/* Delete Button */}
                {editingLongPress === item.id && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      deleteItem(item.id);
                      setEditingLongPress(null);
                    }}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </Pressable>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Add Custom Item Button */}
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addItemButtonText}>+ Add Custom Item</Text>
        </TouchableOpacity>

        {/* Add from Suggestions */}
        <TouchableOpacity
          style={styles.suggestionsButton}
          onPress={() => setShowSuggestionsModal(true)}
        >
          <Text style={styles.suggestionsButtonText}>Add from suggestions</Text>
          <Text style={styles.suggestionsChevron}>›</Text>
        </TouchableOpacity>

        {/* Status Banner */}
        {isAllCompleted ? (
          <View style={[styles.statusBanner, styles.statusBannerSuccess]}>
            <Text style={styles.statusEmoji}>✅</Text>
            <Text style={styles.statusText}>You're cleared to trade!</Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, styles.statusBannerWarning]}>
            <Text style={styles.statusEmoji}>⚠️</Text>
            <Text style={styles.statusText}>
              Complete your checklist before trading
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Custom Item Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add Custom Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter checklist item..."
              placeholderTextColor={colors.textMuted}
              value={newItemText}
              onChangeText={setNewItemText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowAddModal(false);
                  setNewItemText('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonAdd}
                onPress={addCustomItem}
              >
                <Text style={styles.modalButtonAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSuggestionsModal(false)}
        >
          <Pressable style={styles.suggestionsModalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Suggested Items</Text>
            <FlatList
              data={suggestedItems}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const alreadyAdded = items.some((i) => i.text === item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.suggestionItem,
                      alreadyAdded && styles.suggestionItemAdded,
                    ]}
                    onPress={() => {
                      if (!alreadyAdded) {
                        addSuggestedItem(item);
                      }
                    }}
                    disabled={alreadyAdded}
                  >
                    <Text
                      style={[
                        styles.suggestionText,
                        alreadyAdded && styles.suggestionTextAdded,
                      ]}
                    >
                      {item}
                    </Text>
                    {alreadyAdded && (
                      <Text style={styles.suggestionCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              scrollEnabled={false}
            />
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setShowSuggestionsModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default PreTradeChecklistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  } as ViewStyle,
  header: {
    marginBottom: 28,
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  } as TextStyle,
  progressCounter: {
    fontSize: 14,
    color: COLORS.textMuted,
  } as TextStyle,
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
    height: 120,
  } as ViewStyle,
  progressRing: {
    position: 'absolute',
  } as ViewStyle,
  progressText: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  progressPercent: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.emerald,
  } as TextStyle,
  itemsContainer: {
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.emerald,
  },
  checkmark: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  itemTextCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  addItemButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.emerald,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  addItemButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestionsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.glass,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: 24,
  },
  suggestionsButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsChevron: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
  },
  statusBannerSuccess: {
    backgroundColor: COLORS.emerald + '20',
    borderWidth: 1,
    borderColor: COLORS.emerald + '40',
  },
  statusBannerWarning: {
    backgroundColor: COLORS.amber + '20',
    borderWidth: 1,
    borderColor: COLORS.amber + '40',
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusText: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  suggestionsModalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.glass,
    borderRadius: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: 16,
    minHeight: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonAdd: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
  },
  modalButtonAddText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  suggestionItemAdded: {
    opacity: 0.5,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  suggestionTextAdded: {
    color: COLORS.textMuted,
  },
  suggestionCheckmark: {
    color: COLORS.emerald,
    fontWeight: '700',
    fontSize: 14,
  },
});
