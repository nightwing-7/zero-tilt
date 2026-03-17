import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G, Path } from 'react-native-svg';

const COLORS = {
  bg: '#111113',
  primary: '#10b981',
  secondary: '#1e293b',
  tertiary: '#475569',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  danger: '#ef4444',
};

interface PanicButtonScreenProps {
  relapsed?: boolean;
}

const BreathingCircleTimer: React.FC<{ phase: number; cycleNumber: number }> = ({
  phase,
  cycleNumber,
}) => {
  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const phaseLabels = ['4s', '4s', '4s', '4s'];

  return (
    <View style={styles.timerContainer}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        {/* Background circle */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={COLORS.tertiary}
          strokeWidth="2"
        />
        {/* Progress circle */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={COLORS.primary}
          strokeWidth="3"
          strokeDasharray={`${(phase / 4) * 565.4} 565.4`}
          strokeLinecap="round"
        />
        {/* Center text */}
        <G x="50" y="70">
          <Text style={styles.phaseLabel}>{phases[phase]}</Text>
          <Text style={styles.phaseTime}>{phaseLabels[phase]}</Text>
        </G>
      </Svg>

      <View style={styles.cycleCounter}>
        <Text style={styles.cycleText}>Cycle {cycleNumber}/3</Text>
      </View>
    </View>
  );
};

const SideEffectItem: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <View style={styles.sideEffectItem}>
    <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.danger} />
    <Text style={styles.sideEffectLabel}>{label}</Text>
  </View>
);

const CalmDownMode: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isBreathing, setIsBreathing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isBreathing) return;

    let interval: NodeJS.Timeout;
    let animationTimer: NodeJS.Timeout;

    const phaseDuration = 4000; // 4 seconds

    const runPhase = (phase: number) => {
      // Animate circle based on phase
      if (phase === 0) {
        // Inhale - scale up
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: phaseDuration,
          useNativeDriver: true,
        }).start();
      } else if (phase === 2) {
        // Exhale - scale down
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: phaseDuration,
          useNativeDriver: true,
        }).start();
      }

      animationTimer = setTimeout(() => {
        const nextPhase = (phase + 1) % 4;

        if (nextPhase === 0) {
          if (currentCycle === 3) {
            setIsBreathing(false);
            setCurrentCycle(1);
            setCurrentPhase(0);
            return;
          }
          setCurrentCycle((prev) => prev + 1);
        }

        setCurrentPhase(nextPhase);
      }, phaseDuration);
    };

    runPhase(currentPhase);

    return () => {
      clearTimeout(animationTimer);
      clearInterval(interval);
    };
  }, [isBreathing, currentPhase, currentCycle, scaleAnim]);

  const sideEffects = [
    { icon: 'bank', label: 'Blown Accounts' },
    { icon: 'brain', label: 'Impaired Judgment' },
    { icon: 'cash-remove', label: 'Financial Loss' },
    { icon: 'heart-broken', label: 'Damaged Confidence' },
    { icon: 'stress', label: 'Anxiety & Stress' },
    { icon: 'cancel', label: 'Broken Discipline' },
    { icon: 'file-document-alert', label: 'Failed Evaluations' },
    { icon: 'heart-multiple', label: 'Relationship Strain' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.calmContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Calm Down Mode</Text>

      {/* Breathing Exercise */}
      <View style={styles.breathSection}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.breatheText}>BREATHE</Text>
        </Animated.View>
      </View>

      {/* Timer */}
      {isBreathing ? (
        <BreathingCircleTimer phase={currentPhase} cycleNumber={currentCycle} />
      ) : (
        <View style={styles.instructionBox}>
          <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
          <Text style={styles.instructionText}>
            Box breathing guide: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Complete 3 cycles.
          </Text>
        </View>
      )}

      {/* Start/Stop Button */}
      <TouchableOpacity
        style={[styles.actionButton, isBreathing && styles.activeActionButton]}
        onPress={() => {
          setIsBreathing(!isBreathing);
          if (!isBreathing) {
            setCurrentPhase(0);
            setCurrentCycle(1);
          }
        }}
      >
        <MaterialCommunityIcons
          name={isBreathing ? 'pause' : 'play'}
          size={24}
          color={COLORS.bg}
        />
        <Text style={styles.actionButtonText}>
          {isBreathing ? 'Pause Breathing' : 'Start Breathing'}
        </Text>
      </TouchableOpacity>

      {/* Why I Trade Reminder */}
      <View style={styles.reminderCard}>
        <MaterialCommunityIcons name="lightbulb-on" size={28} color={COLORS.primary} />
        <Text style={styles.reminderTitle}>Why I Trade</Text>
        <Text style={styles.reminderText}>
          You started trading because of a goal. Remember your purpose. Every tilt moment is a chance to strengthen your discipline and become a better trader.
        </Text>
      </View>

      {/* Side Effects of Tilting */}
      <Text style={styles.sectionTitle}>Side Effects of Tilting</Text>
      <View style={styles.sideEffectsGrid}>
        {sideEffects.map((effect, idx) => (
          <SideEffectItem
            key={idx}
            icon={effect.icon}
            label={effect.label}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const RelapsedMode: React.FC = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.relapsedContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>You've Relapsed</Text>

      {/* Supportive Message */}
      <View style={styles.supportiveCard}>
        <MaterialCommunityIcons name="heart-plus" size={40} color={COLORS.primary} />
        <Text style={styles.supportiveTitle}>It's okay. Every great trader has setbacks.</Text>
        <Text style={styles.supportiveText}>
          This doesn't define you. What matters now is your next decision. You have the strength to get back on track.
        </Text>
      </View>

      {/* Action Cards */}
      <Text style={styles.sectionTitle}>What You Can Do</Text>

      <TouchableOpacity style={styles.actionCard}>
        <View style={styles.actionCardIcon}>
          <MaterialCommunityIcons name={"journal" as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Write in Journal</Text>
          <Text style={styles.actionCardDesc}>Reflect on what happened and your feelings</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <View style={styles.actionCardIcon}>
          <MaterialCommunityIcons name="comment-multiple" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Talk to Community</Text>
          <Text style={styles.actionCardDesc}>Share your experience with other traders</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <View style={styles.actionCardIcon}>
          <MaterialCommunityIcons name="account-tie" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Contact Coach</Text>
          <Text style={styles.actionCardDesc}>Get personalized guidance and support</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Start Fresh Button */}
      <TouchableOpacity style={styles.startFreshButton}>
        <MaterialCommunityIcons name="reload" size={20} color={COLORS.bg} />
        <Text style={styles.startFreshText}>Start Fresh (Reset Streak)</Text>
      </TouchableOpacity>

      {/* Motivational Section */}
      <View style={styles.motivationalCard}>
        <Text style={styles.motivationalText}>This doesn't define you</Text>
        <Text style={styles.motivationalSubtext}>
          One mistake doesn't erase your progress. Use this moment to learn and come back stronger.
        </Text>
      </View>
    </ScrollView>
  );
};

export default function PanicButtonScreen({
  relapsed = false,
}: PanicButtonScreenProps) {
  return (
    <View style={styles.fullContainer}>
      {relapsed ? <RelapsedMode /> : <CalmDownMode />}
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  calmContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  relapsedContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Calm Down Mode
  breathSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breatheText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.bg,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  cycleCounter: {
    marginTop: 16,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  phaseTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  instructionBox: {
    backgroundColor: COLORS.secondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 16,
  },
  activeActionButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  reminderCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 16,
  },
  sideEffectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  sideEffectItem: {
    width: '48%',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  sideEffectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Relapsed Mode
  supportiveCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  supportiveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  supportiveText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  startFreshButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 20,
  },
  startFreshText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.bg,
  },
  motivationalCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  motivationalSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
