import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Plan {
  name: string;
  price: string;
  period: string;
  isBestValue: boolean;
  isActive: boolean;
}

export default function SubscriptionScreen({ navigation }: any) {
  const [currentPlan] = useState<Plan>({
    name: 'Zero Tilt Pro',
    price: '$49.99',
    period: '/year',
    isBestValue: false,
    isActive: true,
  });

  const plans: Plan[] = [
    {
      name: 'Monthly',
      price: '$12.99',
      period: '/month',
      isBestValue: false,
      isActive: false,
    },
    {
      name: 'Yearly',
      price: '$49.99',
      period: '/year',
      isBestValue: true,
      isActive: true,
    },
    {
      name: 'Lifetime',
      price: '$149.99',
      period: ' one-time',
      isBestValue: false,
      isActive: false,
    },
  ];

  const features = [
    'Unlimited streak tracking',
    'Full leaderboard access',
    'Community posting',
    'Advanced trading analytics',
    'Weekly performance reports',
    'Push notifications',
    'Custom trading journals',
    'Exclusive webinars',
    'Priority support',
    'Ad-free experience',
  ];

  const handleUpgrade = (plan: Plan) => {
    if (plan.isActive) {
      Alert.alert('Already Active', `You're already subscribed to ${plan.name}`);
    } else {
      Alert.alert(
        'Upgrade Plan',
        `Upgrade to ${plan.name} for ${plan.price}${plan.period}?`,
        [
          { text: 'Cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              Alert.alert('Success', `Successfully upgraded to ${plan.name}`);
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Current Plan Card */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.currentPlanCard}
      >
        <Text style={styles.currentPlanLabel}>Current Plan</Text>
        <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
        <Text style={styles.currentPlanPrice}>
          {currentPlan.price}
          <Text style={styles.currentPlanPeriod}>{currentPlan.period}</Text>
        </Text>
        <Text style={styles.renewalText}>Renews on April 14, 2026</Text>
      </LinearGradient>

      {/* Plans Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        {plans.map((plan, index) => (
          <View
            key={plan.name}
            style={[
              styles.planCard,
              plan.isActive && styles.activePlanCard,
              plan.isBestValue && styles.bestValueCard,
            ]}
          >
            {plan.isBestValue && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            )}

            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.planButton,
                plan.isActive && styles.activePlanButton,
              ]}
              onPress={() => handleUpgrade(plan)}
            >
              <Text
                style={[
                  styles.planButtonText,
                  plan.isActive && styles.activePlanButtonText,
                ]}
              >
                {plan.isActive ? 'Current' : 'Upgrade'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Included</Text>

        <View style={styles.featuresList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureItem}>
              <Text style={styles.featureCheckmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Management Buttons */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.managementButton}>
          <Text style={styles.managementButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
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
  currentPlanCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  currentPlanLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  currentPlanPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  currentPlanPeriod: {
    fontSize: 14,
    fontWeight: '500',
  },
  renewalText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1a1a1d',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2a2a2d',
  },
  activePlanCard: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  bestValueCard: {
    borderColor: '#FFD700',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111113',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  period: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  planButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  activePlanButton: {
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  planButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  activePlanButtonText: {
    color: '#10b981',
  },
  featuresList: {
    backgroundColor: '#1a1a1d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2d',
  },
  featureCheckmark: {
    fontSize: 16,
    color: '#10b981',
    marginRight: 10,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  managementButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  managementButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  spacer: {
    height: 20,
  },
});
