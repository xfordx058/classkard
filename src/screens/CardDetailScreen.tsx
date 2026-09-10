import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getRecordsByStudentAndSection } from '../db/queries';
import { COLORS, CATEGORY_COLORS, STATUS_COLORS } from '../theme/colors';
import { StudentRecord, RecordCategory } from '../types';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';
import Fab from '../components/Fab';

const CATEGORY_LABELS: Record<RecordCategory, string> = {
  ATTENDANCE: 'Attendance',
  LABORATORY: 'Lab',
  QUIZ: 'Quiz',
  EXAM: 'Exam',
  ASSIGNMENT: 'Assignment',
};

export default function CardDetailScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sectionId, studentId, category, fromStudent } = route.params;
  const isTeacher = currentUser?.role === 'teacher';

  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [sectionId, studentId, category])
  );

  async function loadRecords() {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const allRecords = await getRecordsByStudentAndSection(db, studentId, sectionId);
      const filtered = category
        ? allRecords.filter((r) => r.category === category)
        : allRecords;
      setRecords(filtered);
    } catch {
      setError('Could not load records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusLabel(status: string) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function renderRecord({ item }: { item: StudentRecord }) {
    const catColor = CATEGORY_COLORS[item.category] ?? COLORS.textLight;
    const statColor = STATUS_COLORS[item.status] ?? COLORS.textLight;

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={
          isTeacher && (item.status === 'ready_to_sign' || item.status === 'draft')
            ? () => navigation.navigate('Signature', { recordId: item.id })
            : undefined
        }
      >
        <View style={styles.recordTop}>
          <View style={styles.recordLeft}>
            <Text style={styles.recordDate}>{item.date}</Text>
            <Text style={styles.recordTitle} numberOfLines={1}>
              {item.title || CATEGORY_LABELS[item.category]}
            </Text>
          </View>
          <View style={styles.recordRight}>
            {item.category === 'ATTENDANCE' && item.attendanceStatus ? (
              <View style={[styles.badge, { backgroundColor: catColor + '20' }]}>
                <Text style={[styles.badgeText, { color: catColor }]}>
                  {item.attendanceStatus}
                </Text>
              </View>
            ) : item.score != null ? (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  {item.score}/{item.totalScore ?? '?'}
                </Text>
                {item.percentage != null && (
                  <Text style={styles.pctText}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.recordBottom}>
          <View style={[styles.statusBadge, { backgroundColor: statColor + '20' }]}>
            <Text style={[styles.recordStatus, { color: statColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          {(item.status === 'signed' || item.status === 'locked') && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          )}
        </View>
        {item.remarks ? (
          <Text style={styles.remarks} numberOfLines={2}>
            {item.remarks}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category as RecordCategory] ?? COLORS.textLight }]} />
        <Text style={styles.headerTitle}>{CATEGORY_LABELS[category as RecordCategory] ?? category}</Text>
        <Text style={styles.headerCount}>{records.length} records</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          <SkeletonList rows={5} height={80} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={loadRecords} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No records yet</Text>
            </View>
          }
        />
      )}

      {isTeacher && (
        <Fab
          onPress={() =>
            navigation.navigate('AddRecord', {
              sectionId,
              studentId,
              category,
            })
          }
          label="Add record"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  headerCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordLeft: {
    flex: 1,
    marginRight: 12,
  },
  recordDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  pctText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recordBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  remarks: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
