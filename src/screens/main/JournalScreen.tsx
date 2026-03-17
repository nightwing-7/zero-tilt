import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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
};

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  content: string;
  tags: string[];
}

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: '2026-03-14',
    title: 'Solid trading day',
    mood: '😊',
    content: 'Completed 3 trades with 2 wins. Managed emotions well and followed my plan. Really happy with the discipline today.',
    tags: ['Post-Trade', 'Wins'],
  },
  {
    id: '2',
    date: '2026-03-13',
    title: 'Pre-trading checklist',
    mood: '🎯',
    content: 'Setup: ES breakout above 5200. Risk 100 points. Reward 200 points. Conviction: 8/10. Good risk-reward ratio today.',
    tags: ['Pre-Trade'],
  },
  {
    id: '3',
    date: '2026-03-12',
    title: 'Had a tilt moment',
    mood: '😤',
    content: 'Got frustrated after a stop loss. Caught myself before opening another trade. Used breathing techniques. Need to work on frustration tolerance.',
    tags: ['Tilt Reflection', 'Post-Trade'],
  },
  {
    id: '4',
    date: '2026-03-11',
    title: 'Planning for the week',
    mood: '💪',
    content: 'Max 5 trades per day. Focus on ES and NQ. Avoid choppy hours 10-12am. Set daily P&L target of $500.',
    tags: ['Pre-Trade', 'Strategies'],
  },
  {
    id: '5',
    date: '2026-03-10',
    title: 'Reflection on losses',
    mood: '😔',
    content: 'Lost 3 trades in a row. Pattern: entered without clear setup confirmation. Decision: wait for 2 confirming candles next time.',
    tags: ['Post-Trade', 'Tilt Reflection'],
  },
];

const MOOD_OPTIONS = ['😊', '😤', '🎯', '💪', '😔'] as const;
const TAG_OPTIONS = ['Pre-Trade', 'Post-Trade', 'Tilt Reflection', 'Strategies', 'Psychology'] as const;
const FILTER_TABS = ['All', 'Pre-Trade', 'Post-Trade', 'Reflections'] as const;

const JournalEntryCard: React.FC<{
  entry: JournalEntry;
  onDelete: (id: string) => void;
}> = ({ entry, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(entry.id);
          setShowDelete(false);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.entryCard}
      onLongPress={() => setShowDelete(true)}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <View>
          <View style={styles.dateAndMood}>
            <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString()}</Text>
            <Text style={styles.entryMood}>{entry.mood}</Text>
          </View>
          <Text style={styles.entryTitle}>{entry.title}</Text>
        </View>
      </View>

      <Text style={styles.entryPreview} numberOfLines={2}>
        {entry.content}
      </Text>

      <View style={styles.tagsContainer}>
        {entry.tags.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {showDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="trash-can" size={18} color={COLORS.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('😊');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleAddEntry = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Fields', 'Please fill in title and content');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title,
      mood: selectedMood,
      content,
      tags: selectedTags.length > 0 ? selectedTags : ['Post-Trade'],
    };

    setEntries([newEntry, ...entries]);
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setSelectedMood('😊');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredEntries =
    selectedFilter === 'All'
      ? entries
      : entries.filter((e) =>
          selectedFilter === 'Reflections'
            ? e.tags.includes('Tilt Reflection')
            : e.tags.includes(selectedFilter)
        );

  const isEmpty = filteredEntries.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.bg} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              selectedFilter === tab && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(tab)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === tab && styles.activeFilterText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty State */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name={"journal" as any}
            size={64}
            color={COLORS.tertiary}
          />
          <Text style={styles.emptyText}>Start journaling your trading thoughts</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.emptyButtonText}>Write First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.entriesScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.entriesContent}
        >
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </ScrollView>
      )}

      {/* Create Entry Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Entry</Text>
              <TouchableOpacity onPress={() => {
                resetForm();
                setShowModal(false);
              }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Mood Selector */}
              <Text style={styles.sectionLabel}>How are you feeling?</Text>
              <View style={styles.moodSelector}>
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodOption,
                      selectedMood === mood && styles.activeMoodOption,
                    ]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={styles.moodText}>{mood}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <Text style={styles.sectionLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Entry title..."
                placeholderTextColor={COLORS.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              {/* Content */}
              <Text style={styles.sectionLabel}>What's on your mind?</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Write your thoughts here..."
                placeholderTextColor={COLORS.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />

              {/* Tags */}
              <Text style={styles.sectionLabel}>Type of Entry</Text>
              <View style={styles.tagsGrid}>
                {TAG_OPTIONS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      selectedTags.includes(tag) && styles.activeTagOption,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagOptionText,
                        selectedTags.includes(tag) && styles.activeTagOptionText,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddEntry}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScroll: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  filterContent: {
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  activeFilterTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bg,
  },
  entriesScroll: {
    flex: 1,
  },
  entriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  entryCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  entryHeader: {
    marginBottom: 10,
  },
  dateAndMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  entryMood: {
    fontSize: 18,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  entryPreview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 4,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  moodOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeMoodOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  moodText: {
    fontSize: 28,
  },
  titleInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 20,
  },
  contentInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 20,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.tertiary,
  },
  activeTagOption: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  tagOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTagOptionText: {
    color: COLORS.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.bg,
  },
});
