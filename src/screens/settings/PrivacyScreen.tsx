import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';

export default function PrivacyScreen({ navigation }: any) {
  const [profilePublic, setProfilePublic] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a JSON file and sent to your email',
      [
        { text: 'Cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data export initiated. Check your email shortly.');
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Data Deleted', 'All your data has been permanently deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Profile Visibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>

        <View style={styles.toggleItem}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Public Profile</Text>
            <Text style={styles.toggleDescription}>
              Other traders can view your profile
            </Text>
          </View>
          <Switch
            value={profilePublic}
            onValueChange={setProfilePublic}
            trackColor={{ false: '#2a2a2d', true: '#10b981' }}
            thumbColor={profilePublic ? '#ffffff' : '#6B7280'}
          />
        </View>

        <View style={styles.toggleItem}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Show Trading Stats</Text>
            <Text style={styles.toggleDescription}>
              Display your streak and performance metrics
            </Text>
          </View>
          <Switch
            value={showStats}
            onValueChange={setShowStats}
            trackColor={{ false: '#2a2a2d', true: '#10b981' }}
            thumbColor={showStats ? '#ffffff' : '#6B7280'}
          />
        </View>

        <View style={styles.toggleItem}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Allow Direct Messages</Text>
            <Text style={styles.toggleDescription}>
              Receive messages from other traders
            </Text>
          </View>
          <Switch
            value={allowMessages}
            onValueChange={setAllowMessages}
            trackColor={{ false: '#2a2a2d', true: '#10b981' }}
            thumbColor={allowMessages ? '#ffffff' : '#6B7280'}
          />
        </View>

        <View style={styles.toggleItem}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Show in Leaderboards</Text>
            <Text style={styles.toggleDescription}>
              Appear in public leaderboard rankings
            </Text>
          </View>
          <Switch
            value={showInLeaderboard}
            onValueChange={setShowInLeaderboard}
            trackColor={{ false: '#2a2a2d', true: '#10b981' }}
            thumbColor={showInLeaderboard ? '#ffffff' : '#6B7280'}
          />
        </View>
      </View>

      {/* Data & Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Analytics</Text>

        <View style={styles.toggleItem}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Usage Analytics</Text>
            <Text style={styles.toggleDescription}>
              Help us improve by sharing usage data
            </Text>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ false: '#2a2a2d', true: '#10b981' }}
            thumbColor={analytics ? '#ffffff' : '#6B7280'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportData}
        >
          <Text style={styles.actionButtonText}>Export My Data</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={handleDeleteAllData}
        >
          <Text style={[styles.actionButtonText, styles.deleteActionText]}>
            Delete All Data
          </Text>
          <Text style={[styles.actionArrow, styles.deleteActionArrow]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity
          style={styles.legalLink}
          onPress={() =>
            openLink('https://example.com/privacy')
          }
        >
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
          <Text style={styles.legalArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalLink}
          onPress={() =>
            openLink('https://example.com/terms')
          }
        >
          <Text style={styles.legalLinkText}>Terms of Service</Text>
          <Text style={styles.legalArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalLink}
          onPress={() =>
            openLink('https://example.com/cookies')
          }
        >
          <Text style={styles.legalLinkText}>Cookie Policy</Text>
          <Text style={styles.legalArrow}>›</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  deleteActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  deleteActionText: {
    color: '#EF4444',
  },
  actionArrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  deleteActionArrow: {
    color: '#EF4444',
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  legalLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  legalArrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  spacer: {
    height: 20,
  },
});
