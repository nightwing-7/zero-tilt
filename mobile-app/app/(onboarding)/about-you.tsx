import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { TRADING_STYLES, MARKETS, EXPERIENCE_LEVELS } from '../../constants/config';
import { Button } from '../../components/ui/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.dark.tertiary,
    borderRadius: 2,
    marginBottom: spacing[6],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '20%',
    backgroundColor: colors.accent.teal,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
  } as TextStyle,
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginBottom: spacing[6],
  } as TextStyle,
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  } as TextStyle,
  input: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: colors.dark.text.primary,
    fontSize: typography.sizes.base,
  } as TextStyle,
  optionsGrid: {
    gap: spacing[2],
  },
  optionButton: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  optionButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    color: colors.dark.text.secondary,
  } as TextStyle,
  optionTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  nextButton: {
    flex: 1,
  },
});

export default function AboutYouScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [traderName, setTraderName] = useState('');
  const [age, setAge] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  const handleStyleToggle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleMarketToggle = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  const handleNext = () => {
    if (!traderName || !age || selectedStyles.length === 0 || selectedMarkets.length === 0 || !selectedExperience) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    router.push({
      pathname: '/(onboarding)/quiz',
      params: {
        traderName,
        age,
        tradingStyles: JSON.stringify(selectedStyles),
        markets: JSON.stringify(selectedMarkets),
        experienceLevel: selectedExperience,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Tell Us About You</Text>
        <Text style={styles.subtitle}>Let's customize your experience</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trader Name</Text>
          <TextInput
            style={styles.input}
            placeholder="What's your trading name?"
            placeholderTextColor={colors.dark.text.muted}
            value={traderName}
            onChangeText={setTraderName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Your age"
            placeholderTextColor={colors.dark.text.muted}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trading Styles (Select at least one)</Text>
          <View style={styles.optionsGrid}>
            {TRADING_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.optionButton,
                  selectedStyles.includes(style) && styles.optionButtonActive,
                ]}
                onPress={() => handleStyleToggle(style)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedStyles.includes(style) && styles.optionTextActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Markets (Select at least one)</Text>
          <View style={styles.optionsGrid}>
            {MARKETS.map((market) => (
              <TouchableOpacity
                key={market}
                style={[
                  styles.optionButton,
                  selectedMarkets.includes(market) && styles.optionButtonActive,
                ]}
                onPress={() => handleMarketToggle(market)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMarkets.includes(market) && styles.optionTextActive,
                  ]}
                >
                  {market}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Experience Level</Text>
          <View style={styles.optionsGrid}>
            {EXPERIENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  selectedExperience === level && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedExperience(level)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedExperience === level && styles.optionTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Next"
            onPress={handleNext}
            size="lg"
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
