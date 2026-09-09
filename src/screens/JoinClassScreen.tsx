import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getStudentByUserId, joinSectionByClassCode } from '../db/queries';
import { COLORS } from '../theme/colors';

export default function JoinClassScreen() {
  const { db, currentUser } = useApp();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ section: any; status: 'pending' | 'active' } | null>(null);

  async function handleJoin() {
    if (!db || !currentUser) return;
    if (!classCode.trim()) {
      Alert.alert('Error', 'Please enter the class code.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const student = await getStudentByUserId(db, currentUser.id);
      if (!student) {
        Alert.alert('Error', 'Student profile not found.');
        return;
      }
      const res = await joinSectionByClassCode(db, student.id, classCode);
      setResult(res);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to join class.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="key" size={32} color={COLORS.primary} />
          <Text style={styles.title}>Join a Class</Text>
          <Text style={styles.subtitle}>
            Enter the class code given by your teacher to request enrollment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Class Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="e.g. 7X4-KP2"
            placeholderTextColor={COLORS.textLight}
            value={classCode}
            onChangeText={(t) => setClassCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Ionicons name="paper-plane" size={20} color={COLORS.white} />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Joining...' : 'Request to Join'}
            </Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[styles.resultCard, result.status === 'active' ? styles.successCard : styles.pendingCard]}>
            <Ionicons
              name={result.status === 'active' ? 'checkmark-circle' : 'time'}
              size={28}
              color={result.status === 'active' ? COLORS.success : COLORS.warning}
            />
            <View style={styles.resultBody}>
              <Text style={styles.resultTitle}>
                {result.status === 'active' ? 'Enrolled!' : 'Enrollment Request Sent'}
              </Text>
              <Text style={styles.resultSubtitle}>
                You are now enrolled in{' '}
                <Text style={styles.resultStrong}>
                  {result.section.subjectName} - {result.section.name}
                </Text>
                {result.status === 'pending'
                  ? '. Your request is pending teacher approval.'
                  : '. You can now view your five cards and records.'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>
            Class codes are provided by your teacher. If you don't have one, ask your instructor
            for the code for your section.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    color: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  successCard: {
    backgroundColor: '#DCFCE7',
  },
  pendingCard: {
    backgroundColor: '#FEF3C7',
  },
  resultBody: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  resultStrong: {
    fontWeight: '700',
    color: COLORS.text,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});