import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useStore } from '../../store/store';

type TradingStyle = 'Scalper' | 'Day Trader' | 'Swing' | 'Position';
type Market = 'Futures' | 'Stocks' | 'Options' | 'Crypto' | 'Forex';

export default function EditProfileScreen({ navigation }: any) {
  const { name, traderName, email } = useStore();
  const [fullName, setFullName] = useState(name || '');
  const [trader, setTrader] = useState(traderName || '');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('3-5 years');
  const [tradingStyles, setTradingStyles] = useState<TradingStyle[]>(['Day Trader']);
  const [markets, setMarkets] = useState<Market[]>(['Stocks', 'Options']);

  const tradingStyleOptions: TradingStyle[] = ['Scalper', 'Day Trader', 'Swing', 'Position'];
  const marketOptions: Market[] = ['Futures', 'Stocks', 'Options', 'Crypto', 'Forex'];
  const experienceOptions = ['0-1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

  const toggleTradingStyle = (style: TradingStyle) => {
    if (tradingStyles.includes(style)) {
      setTradingStyles(tradingStyles.filter((s) => s !== style));
    } else {
      setTradingStyles([...tradingStyles, style]);
    }
  };

  const toggleMarket = (market: Market) => {
    if (markets.includes(market)) {
      setMarkets(markets.filter((m) => m !== market));
    } else {
      setMarkets([...markets, market]);
    }
  };

  const handleSave = () => {
    if (!fullName.trim() || !trader.trim()) {
      Alert.alert('Incomplete', 'Please fill in all required fields');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
            navigation.navigate('Auth');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Email Field */}
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>{email || 'user@example.com'}</Text>
        </View>
        <Text style={styles.helperText}>Email cannot be changed</Text>
      </View>

      {/* Full Name Field */}
      <View style={styles.section}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#6B7280"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Trader Name Field */}
      <View style={styles.section}>
        <Text style={styles.label}>Trader Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your trader name"
          placeholderTextColor="#6B7280"
          value={trader}
          onChangeText={setTrader}
        />
        <Text style={styles.helperText}>This is how other traders will see you</Text>
      </View>

      {/* Trading Style */}
      <View style={styles.section}>
        <Text style={styles.label}>Trading Style</Text>
        <View style={styles.chipContainer}>
          {tradingStyleOptions.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.chip,
                tradingStyles.includes(style) && styles.activeChip,
              ]}
              onPress={() => toggleTradingStyle(style)}
            >
              <Text
                style={[
                  styles.chipText,
                  tradingStyles.includes(style) && styles.activeChipText,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Markets */}
      <View style={styles.section}>
        <Text style={styles.label}>Markets</Text>
        <View style={styles.chipContainer}>
          {marketOptions.map((market) => (
            <TouchableOpacity
              key={market}
              style={[
                styles.chip,
                markets.includes(market) && styles.activeChip,
              ]}
              onPress={() => toggleMarket(market)}
            >
              <Text
                style={[
                  styles.chipText,
                  markets.includes(market) && styles.activeChipText,
                ]}
              >
                {market}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your trading journey"
          placeholderTextColor="#6B7280"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.label}>Trading Experience</Text>
        <View style={styles.dropdownContainer}>
          {experienceOptions.map((exp) => (
            <TouchableOpacity
              key={exp}
              style={[
                styles.dropdownOption,
                experience === exp && styles.activeDropdownOption,
              ]}
              onPress={() => setExperience(exp)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  experience === exp && styles.activeDropdownText,
                ]}
              >
                {exp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

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
    paddingHorizontal: 16,
    marginTop: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#2a2a2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
  },
  textArea: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#0f0f11',
    borderWidth: 1,
    borderColor: '#2a2a2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  disabledText: {
    color: '#6B7280',
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  activeChip: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeChipText: {
    color: 'white',
  },
  dropdownContainer: {
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#2a2a2d',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  activeDropdownOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dropdownText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  activeDropdownText: {
    color: '#10b981',
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  spacer: {
    height: 20,
  },
});
