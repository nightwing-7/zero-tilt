import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { useRoute, useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { TILT_ASSESSMENT_QUESTIONS, RISK_LEVELS } from '../../constants/config';
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
    width: '40%',
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
  question: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.dark.text.primary,
    marginBottom: spacing[4],
  } as TextStyle,
  answerButton: {
    backgroundColor: colors.dark.secondary,
    borderColor: colors.dark.border,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
  },
  answerButtonActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.tealLight,
  },
  answerText: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
  } as TextStyle,
  answerTextActive: {
    color: colors.dark.bg.primary,
    fontWeight: '600',
  } as TextStyle,
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});

export default function QuizScreen() {
  const route = useRoute();
  const router = useRouter();

  const params = useMemo(() => ({
    traderName: route.params?.traderName as string || '',
    age: route.params?.age as string || '',
    tradingStyles: JSON.parse((route.params?.tradingStyles as string) || '[]'),
    markets: JSON.parse((route.params?.markets as string) || '[]'),
    experienceLevel: route.params?.experienceLevel as string || '',
  }), [route.params]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] === undefined) {
      Alert.alert('Error', 'Please select an answer');
      return;
    }

    if (currentQuestion < TILT_ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const riskLevel = Math.floor(
        answers.reduce((sum, ans) => sum + ans, 0) / answers.length
      );

      router.push({
        pathname: '/(onboarding)/symptoms',
        params: {
          ...params,
          tiltRiskLevel: riskLevel.toString(),
        },
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  const question = TILT_ASSESSMENT_QUESTIONS[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isLastQuestion = currentQuestion === TILT_ASSESSMENT_QUESTIONS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestion + 1) / TILT_ASSESSMENT_QUESTIONS.length) * 100}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.title}>Tilt Risk Assessment</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestion + 1} of {TILT_ASSESSMENT_QUESTIONS.length}
        </Text>

        <Text style={styles.question}>{question.question}</Text>

        <View>
          {question.answers.map((answer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer === index && styles.answerButtonActive,
              ]}
              onPress={() => handleAnswer(index)}
            >
              <Text
                style={[
                  styles.answerText,
                  selectedAnswer === index && styles.answerTextActive,
                ]}
              >
                {answer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            size="lg"
            style={styles.backButton}
          />
          <Button
            title={isLastQuestion ? 'Continue' : 'Next'}
            onPress={handleNext}
            size="lg"
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
