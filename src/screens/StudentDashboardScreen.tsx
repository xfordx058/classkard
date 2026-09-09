import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getStudentByUserId, getStudentSections, getStudentEnrollments } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Section, Enrollment } from '../types';

export default function StudentDashboardScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!db || !currentUser) return;
    const student = await getStudentByUserId(db, currentUser.id);
    if (!student) {
      setSections([]);
      setStudentId(null);
      setLoading(false);
      return;
    }
    setStudentId(student.id);
    const secs = await getStudentSections(db, student.id);
    setSections(secs);
    const enrollments = await getStudentEnrollments(db, student.id);
    setPendingCount(enrollments.filter((e) => e.status === 'pending').length);
    setLoading(false);
  }, [db, currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.greeting}>
          Hello, {currentUser?.name?.split(' ')[0] ?? 'Student'}
        </Text>
        <Text style={styles.subtitle}>Your enrolled classes and records</Text>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => navigation.navigate('JoinClass')}
      >
        <Ionicons name="add-circle" size={22} color={COLORS.white} />
        <Text style={styles.joinButtonText}>Join a Class</Text>
      </TouchableOpacity>

      {pendingCount > 0 && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={18} color={COLORS.warning} />
          <Text style={styles.pendingText}>
            You have {pendingCount} pending enrollment request{pendingCount > 1 ? 's' : ''}. Waiting
            for teacher approval.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>My Classes</Text>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No classes yet</Text>
          <Text style={styles.emptySubtitle}>
            Use the Join a Class button above and enter your teacher's class code to get started.
          </Text>
        </View>
      ) : (
        sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionCard}
            onPress={() =>
              navigation.navigate('StudentProfile', {
                sectionId: section.id,
                studentId: studentId ?? 0,
                fromStudent: true,
              })
            }
          >
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.subjectBadge, { backgroundColor: COLORS.primary + '15' }]}>
                <Text style={styles.subjectCode}>{section.subjectCode}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.sectionName}>{section.name}</Text>
            <Text style={styles.subjectName}>{section.subjectName}</Text>
            <View style={styles.sectionMetaRow}>
              <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={styles.sectionMeta}>
                {section.academicYearName} • {section.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subjectName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  sectionMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});