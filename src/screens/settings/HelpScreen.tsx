import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen({ navigation }: any) {
  const [bugReport, setBugReport] = useState('');
  const [feedback, setFeedback] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'How is my streak calculated?',
      answer:
        'Your streak counts consecutive days without breaking your trading discipline. The counter resets if you act on an urge to trade impulsively or against your plan.',
    },
    {
      question: 'Can I recover a lost streak?',
      answer:
        'Streaks are permanent once broken to maintain integrity. However, you can start a new streak immediately and your best streak record is preserved for historical tracking.',
    },
    {
      question: 'How do leaderboards work?',
      answer:
        'Leaderboards rank traders by three categories: streak duration, discipline score (% of days following your plan), and community helpfulness. Rankings update daily.',
    },
    {
      question: 'Is my data private?',
      answer:
        'Yes. Your trading data is encrypted and only shared according to your privacy settings. You can control profile visibility, message access, and leaderboard participation.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'You can reach our support team via email at support@zerotilt.io or use the contact form in the Help section. We aim to respond within 24 hours.',
    },
  ];

  const handleReportBug = () => {
    if (!bugReport.trim()) {
      Alert.alert('Empty Report', 'Please describe the bug you encountered');
      return;
    }
    Alert.alert(
      'Bug Reported',
      'Thank you for reporting. Our team will investigate this issue.',
      [
        {
          text: 'OK',
          onPress: () => setBugReport(''),
        },
      ]
    );
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Empty Feedback', 'Please share your feedback with us');
      return;
    }
    Alert.alert(
      'Feedback Received',
      'Thank you for helping us improve Zero Tilt!',
      [
        {
          text: 'OK',
          onPress: () => setFeedback(''),
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@zerotilt.io').catch(() => {
      Alert.alert('Error', 'Could not open email client');
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Report Bug */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report a Bug</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the issue you experienced"
          placeholderTextColor="#6B7280"
          value={bugReport}
          onChangeText={setBugReport}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleReportBug}>
          <Text style={styles.submitButtonText}>Submit Bug Report</Text>
        </TouchableOpacity>
      </View>

      {/* Send Feedback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send Feedback</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us what you think about Zero Tilt"
          placeholderTextColor="#6B7280"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSendFeedback}>
          <Text style={styles.submitButtonText}>Send Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={handleContactSupport}
        >
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>support@zerotilt.io</Text>
          </View>
          <Text style={styles.contactArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() =>
              setExpandedFAQ(expandedFAQ === index ? null : index)
            }
          >
            <View style={styles.faqQuestionContainer}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqToggle}>
                {expandedFAQ === index ? '−' : '+'}
              </Text>
            </View>
            {expandedFAQ === index && (
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>ZERO TILT</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            The trader's mental resilience platform
          </Text>
          <Text style={styles.aboutCopyright}>© 2026 Zero Tilt. All rights reserved.</Text>
        </View>
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
  input: {
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#2a2a2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
  },
  textArea: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  contactArrow: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 8,
  },
  faqItem: {
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
  faqToggle: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: '600',
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2d',
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  aboutCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: 'white',
    marginBottom: 12,
  },
  aboutCopyright: {
    fontSize: 12,
    color: '#6B7280',
  },
  spacer: {
    height: 20,
  },
});
