import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getStudentTimeline, getStudentByUserId } from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';
import { StudentRecord, RecordCategory } from '../types';

const CATEGORY_LABELS: Record<RecordCategory, string> = {
  ATTENDANCE: 'Attendance',
  LABORATORY: 'Laboratory',
  QUIZ: 'Quiz',
  EXAM: 'Exam',
  ASSIGNMENT: 'Assignment',
};

const FILTER_OPTIONS: { key: RecordCategory | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ATTENDANCE', label: 'Attendance' },
  { key: 'LABORATORY', label: 'Lab' },
  { key: 'QUIZ', label: 'Quiz' },
  { key: 'EXAM', label: 'Exam' },
  { key: 'ASSIGNMENT', label: 'Assignment' },
];

export default function StudentTimelineScreen() {
  const { db, currentUser } = useApp();
  const route = useRoute<any>();
  const { studentId: paramStudentId, sectionId } = route.params ?? {};

  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [filter, setFilter] = useState<RecordCategory | 'ALL'>('ALL');
  const [studentId, setStudentId] = useState<number | null>(paramStudentId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [studentId, filter])
  );

  async function loadRecords(refresh = false) {
    if (!db || !currentUser) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      let sid = studentId;
      if (!sid) {
        const st = await getStudentByUserId(db, currentUser.id);
        if (!st) return;
        sid = st.id;
        setStudentId(sid);
      }
      const data = await getStudentTimeline(db, sid, {
        category: filter === 'ALL' ? undefined : filter,
      });
      setRecords(data);
    } catch {
      setError('Could not load your records.');
      setRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function renderRecord({ item }: { item: StudentRecord }) {
    const catColor = CATEGORY_COLORS[item.category] ?? COLORS.textLight;

    return (
      <View style={styles.recordCard}>
        <View style={[styles.colorBar, { backgroundColor: catColor }]} />
        <View style={styles.recordContent}>
          <View style={styles.recordTop}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
            <Text style={styles.recordDate}>{item.date}</Text>
          </View>
          <Text style={styles.recordTitle} numberOfLines={2}>
            {item.title || CATEGORY_LABELS[item.category]}
          </Text>
          <View style={styles.recordDetails}>
            {item.category === 'ATTENDANCE' && item.attendanceStatus ? (
              <Text style={styles.recordScore}>{item.attendanceStatus}</Text>
            ) : item.score != null ? (
              <Text style={styles.recordScore}>
                {item.score}/{item.totalScore ?? '?'}
                {item.percentage != null ? ` (${item.percentage.toFixed(1)}%)` : ''}
              </Text>
            ) : null}
            <View style={styles.sectionInfo}>
              <Ionicons name="school" size={12} color={COLORS.textSecondary} />
              <Text style={styles.sectionText}>
                {(item as any).subjectCode} - {(item as any).sectionName}
              </Text>
            </View>
          </View>
          {item.remarks ? (
            <Text style={styles.remarks} numberOfLines={2}>
              {item.remarks}
            </Text>
          ) : null}
          <View style={styles.statusRow}>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item.label}`}
              accessibilityState={{ selected: filter === item.key }}
            >
              <Text
                style={[styles.filterText, filter === item.key && styles.filterTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.list}>
          <SkeletonList rows={5} height={92} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => { setLoading(true); loadRecords(); }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadRecords(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
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
  filterBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  colorBar: {
    width: 4,
  },
  recordContent: {
    flex: 1,
    padding: 14,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordScore: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
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
  statusRow: {
    flexDirection: 'row',
    marginTop: 8,
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
