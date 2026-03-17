import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

interface OnboardingFlowProps {
  navigation: any;
  route: any;
}

type OnboardingStep = 'ProfileCard' | 'Quiz' | 'NameAge' | 'Calculating' | 'Analysis' | 'Symptoms' | 'Carousel' | 'Notifications' | 'Paywall';

// SVG Components
const HolographicCardSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <Rect
      x="0"
      y="0"
      width={width}
      height={height}
      fill="url(#grad1)"
      rx="16"
    />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  </Svg>
);

const SpinnerSVG: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <Circle
      cx={size / 2}
      cy={size / 2}
      r={size / 2.5}
      fill="none"
      stroke="rgba(16, 185, 129, 0.3)"
      strokeWidth="3"
    />
    <Circle
      cx={size / 2}
      cy={size / 2}
      r={size / 2.5}
      fill="none"
      stroke="#10b981"
      strokeWidth="3"
      strokeDasharray={`${(size / 2.5) * Math.PI * 0.5}`}
      strokeDashoffset="0"
    />
  </Svg>
);

// Step Components
const ProfileCardStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <View style={styles.stepContainer}>
      <View style={styles.cardContainer}>
        <HolographicCardSVG width={300} height={180} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>ZERO TILT</Text>
          <Text style={styles.cardName}>Trader</Text>
          <View style={styles.cardStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Active Streak:</Text>
              <Text style={styles.statValue}>0 days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Disciplined since:</Text>
              <Text style={styles.statValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Start the Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const QuizStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      question: 'What do you primarily trade?',
      options: ['Crypto', 'Stocks', 'Forex', 'Futures', 'Options', 'All of them'],
    },
    {
      question: 'How often do you tilt?',
      options: ['Rarely', 'Sometimes', 'Often', 'Very Often', 'Almost Always'],
    },
    {
      question: 'Where did you hear about Zero Tilt?',
      options: ['Twitter', 'Reddit', 'Friend', 'YouTube', 'Search', 'Other'],
    },
    {
      question: 'Have you noticed losses getting bigger after a bad trade?',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    },
    {
      question: 'How long have you been trading?',
      options: ['< 6 months', '6-12 months', '1-2 years', '2-5 years', '5+ years'],
    },
    {
      question: 'What is your biggest trading challenge?',
      options: ['Emotional control', 'Risk management', 'Strategy', 'Discipline', 'Losses'],
    },
    {
      question: 'Do you have a trading journal?',
      options: ['Yes, daily', 'Yes, sometimes', 'No, but I should', 'Never'],
    },
    {
      question: 'What is your average trade duration?',
      options: ['Scalping', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months'],
    },
  ];

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleProceed = () => {
    if (answers[currentQuestion] === undefined) {
      Alert.alert('Please select an answer to continue');
      return;
    }
    if (currentQuestion === questions.length - 1) {
      onNext();
    }
  };

  const question = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizProgress}>Question {currentQuestion + 1} of {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.quizQuestion}>{question.question}</Text>
        <View style={styles.quizOptions}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quizOption,
                answers[currentQuestion] === option && styles.quizOptionSelected,
              ]}
              onPress={() => handleSelectAnswer(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quizOptionText,
                  answers[currentQuestion] === option && styles.quizOptionSelectedText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.quizFooter}>
        <TouchableOpacity
          style={[styles.quizNavButton, !isAnswered && styles.disabled]}
          onPress={handleProceed}
          activeOpacity={0.8}
          disabled={!isAnswered}
        >
          <Text style={styles.quizNavButtonText}>
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NameAgeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [traderName, setTraderName] = useState('');

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim() || !age) {
      Alert.alert('Please fill in all required fields');
      return;
    }
    const finalTraderName = traderName.trim() || firstName;
    console.log('Profile:', { firstName, lastName, age, traderName: finalTraderName });
    onNext();
  };

  const ageOptions = Array.from({ length: 73 }, (_, i) => (18 + i).toString());

  return (
    <View style={styles.stepContainer}>
      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Complete Your Profile</Text>
        <Text style={styles.formSubtitle}>Let us know who you are</Text>

        <View style={styles.formInputGroup}>
          <Text style={styles.formLabel}>First Name *</Text>
          <TextInput
            style={styles.formTextInput}
            placeholder="Enter your first name"
            placeholderTextColor="#666666"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.formLabel}>Last Name *</Text>
          <TextInput
            style={styles.formTextInput}
            placeholder="Enter your last name"
            placeholderTextColor="#666666"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.formLabel}>Age *</Text>
          <View style={styles.dropdownPlaceholder}>
            <Text style={styles.dropdownText}>{age || 'Select your age'}</Text>
          </View>
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.formLabel}>Trader Name</Text>
          <TextInput
            style={styles.formTextInput}
            placeholder="e.g. IcyTrader, SniperES (defaults to first name)"
            placeholderTextColor="#666666"
            value={traderName}
            onChangeText={setTraderName}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const CalculatingStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      onNext();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onNext, spinnerRotation]);

  const spinnerRotationInterpolate = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.stepContainer}>
      <View style={styles.calculatingContent}>
        <Animated.View
          style={[
            styles.spinnerWrapper,
            {
              transform: [{ rotate: spinnerRotationInterpolate }],
            },
          ]}
        >
          <SpinnerSVG size={80} />
        </Animated.View>
        <Text style={styles.calculatingText}>Analyzing your trading profile...</Text>
        <Text style={styles.calculatingSubtext}>This won't take long</Text>
      </View>
    </View>
  );
};

const AnalysisStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <View style={styles.stepContainer}>
      <ScrollView style={styles.analysisContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.analysisTitle}>Your Zero Tilt Profile</Text>

        <View style={styles.riskCard}>
          <Text style={styles.riskLabel}>Risk Level</Text>
          <Text style={styles.riskValue}>Moderate-High</Text>
          <Text style={styles.riskDescription}>You tend to increase risk after losses</Text>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Your Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightBullet}>Emotional Control</Text>
            <Text style={styles.insightText}>You struggle maintaining discipline after setbacks</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightBullet}>Recovery Pattern</Text>
            <Text style={styles.insightText}>Recovery trades lead to bigger losses 60% of the time</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightBullet}>Recommendation</Text>
            <Text style={styles.insightText}>Implement daily loss limits and mandatory breaks</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const SymptomsStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const symptoms = [
    'Revenge Trading',
    'Overtrading',
    'Over Leverage',
    'Ignoring Risk',
    'Panic Selling',
    'FOMO Buying',
    'No Stop Loss',
    'Averaging Down',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleNext = () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Please select at least one symptom');
      return;
    }
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <ScrollView style={styles.symptomsContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.symptomsTitle}>Which symptoms do you recognize?</Text>
        <Text style={styles.symptomsSubtitle}>Select all that apply</Text>

        <View style={styles.symptomsGrid}>
          {symptoms.map((symptom, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.symptomChip,
                selectedSymptoms.includes(symptom) && styles.symptomChipSelected,
              ]}
              onPress={() => toggleSymptom(symptom)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.symptomChipText,
                  selectedSymptoms.includes(symptom) && styles.symptomChipTextSelected,
                ]}
              >
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const CarouselStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Join 50,000+ Traders',
      description: 'Connected traders protecting their capital and improving discipline daily',
      icon: '👥',
    },
    {
      title: 'Real-Time Insights',
      description: 'Get actionable feedback on your trading patterns and emotional triggers',
      icon: '📊',
    },
    {
      title: 'Build Better Habits',
      description: 'Structured coaching to develop discipline and consistent profitability',
      icon: '🎯',
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setCurrentSlide(index);
        }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.slideIndicators}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, currentSlide === index && styles.indicatorActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const NotificationsStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>Stay Disciplined</Text>
        <Text style={styles.notificationSubtitle}>Enable notifications for accountability reminders</Text>

        <View style={styles.notificationInfo}>
          <Text style={styles.notificationInfoText}>
            We'll send you gentle reminders to stay on track with your trading goals.
          </Text>
        </View>

        <TouchableOpacity style={styles.permissionButton} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.permissionButtonText}>Enable Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} activeOpacity={0.6}>
          <Text style={styles.skipLink}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PaywallStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Monthly',
      price: '$12.99',
      period: '/month',
      features: ['Full access', 'Analytics', 'Email support'],
    },
    {
      id: 'yearly' as const,
      name: 'Yearly',
      price: '$49.99',
      period: '/year',
      savings: 'Save 67%',
      features: ['Full access', 'Advanced analytics', 'Priority support', 'Ad-free'],
      featured: true,
    },
    {
      id: 'lifetime' as const,
      name: 'Lifetime',
      price: '$149.99',
      period: 'one-time',
      features: ['Lifetime access', 'All features', 'VIP support', 'Priority updates'],
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <ScrollView style={styles.paywallContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.paywallTitle}>Choose Your Plan</Text>
        <Text style={styles.paywallSubtitle}>Start your free 7-day trial</Text>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.featured && styles.planCardFeatured,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
            activeOpacity={0.8}
          >
            {plan.featured && <Text style={styles.planBadge}>Most Popular</Text>}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
            {plan.savings && <Text style={styles.savings}>{plan.savings}</Text>}
            <View style={styles.planFeatures}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={styles.planFeature}>
                  ✓ {feature}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.paywallFooter}>
        <TouchableOpacity style={styles.startButton} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Start Free Trial</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} activeOpacity={0.6}>
          <Text style={styles.restoreLink}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('ProfileCard');

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      'ProfileCard',
      'Quiz',
      'NameAge',
      'Calculating',
      'Analysis',
      'Symptoms',
      'Carousel',
      'Notifications',
      'Paywall',
    ];
    const nextIndex = steps.indexOf(currentStep) + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      navigation.navigate('Main' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 'ProfileCard' && <ProfileCardStep onNext={handleNext} />}
      {currentStep === 'Quiz' && <QuizStep onNext={handleNext} />}
      {currentStep === 'NameAge' && <NameAgeStep onNext={handleNext} />}
      {currentStep === 'Calculating' && <CalculatingStep onNext={handleNext} />}
      {currentStep === 'Analysis' && <AnalysisStep onNext={handleNext} />}
      {currentStep === 'Symptoms' && <SymptomsStep onNext={handleNext} />}
      {currentStep === 'Carousel' && <CarouselStep onNext={handleNext} />}
      {currentStep === 'Notifications' && <NotificationsStep onNext={handleNext} />}
      {currentStep === 'Paywall' && <PaywallStep onNext={handleNext} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  // ProfileCard Step
  cardContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 40,
  },
  cardContent: {
    position: 'absolute',
    width: 300,
    height: 180,
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 2,
  },
  cardName: {
    fontSize: 16,
    color: '#999999',
    marginTop: 4,
  },
  cardStats: {
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statValue: {
    fontSize: 12,
    color: '#f5f5f5',
    fontWeight: '600',
  },
  // Quiz Step
  quizHeader: {
    marginBottom: 24,
  },
  quizProgress: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  quizContent: {
    flex: 1,
    marginBottom: 24,
  },
  quizQuestion: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 24,
    lineHeight: 32,
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  quizOptionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  quizOptionText: {
    fontSize: 15,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  quizOptionSelectedText: {
    color: '#111113',
  },
  quizFooter: {
    paddingTop: 16,
  },
  quizNavButton: {
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 10,
    alignItems: 'center',
  },
  quizNavButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
  },
  disabled: {
    opacity: 0.5,
  },
  // NameAge Step
  formContent: {
    flex: 1,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 32,
  },
  formInputGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  formTextInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#f5f5f5',
    fontSize: 16,
    fontFamily: 'System',
  },
  dropdownPlaceholder: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
  },
  dropdownText: {
    color: '#999999',
    fontSize: 16,
  },
  // Calculating Step
  calculatingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerWrapper: {
    marginBottom: 32,
  },
  calculatingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f5f5',
    textAlign: 'center',
    marginBottom: 8,
  },
  calculatingSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  // Analysis Step
  analysisContent: {
    flex: 1,
    marginBottom: 24,
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 24,
  },
  riskCard: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    marginBottom: 24,
  },
  riskLabel: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  riskDescription: {
    fontSize: 14,
    color: '#999999',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 16,
  },
  insightCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    borderRadius: 8,
    marginBottom: 12,
  },
  insightBullet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 20,
  },
  // Symptoms Step
  symptomsContent: {
    flex: 1,
    marginBottom: 24,
  },
  symptomsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  symptomsSubtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 24,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 8,
  },
  symptomChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  symptomChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f5f5f5',
  },
  symptomChipTextSelected: {
    color: '#111113',
  },
  // Carousel Step
  slide: {
    width: Dimensions.get('window').width - 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  indicatorActive: {
    backgroundColor: '#10b981',
    width: 24,
  },
  // Notifications Step
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
    marginBottom: 12,
  },
  notificationSubtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
  },
  notificationInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    marginBottom: 32,
  },
  notificationInfoText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
  },
  // Paywall Step
  paywallContent: {
    flex: 1,
    marginBottom: 24,
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 24,
  },
  planCard: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  planCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  planCardFeatured: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  planBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10b981',
  },
  period: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 4,
  },
  savings: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 12,
  },
  planFeatures: {
    gap: 8,
  },
  planFeature: {
    fontSize: 13,
    color: '#999999',
  },
  paywallFooter: {
    paddingTop: 16,
  },
  startButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
  },
  skipLink: {
    fontSize: 15,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
  },
  restoreLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
  },
  nextButton: {
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111113',
  },
});

export default OnboardingFlow;
