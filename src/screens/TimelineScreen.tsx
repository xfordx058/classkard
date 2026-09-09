import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getStudentTimeline } from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
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

export default function TimelineScreen() {
  const { db } = useApp();
  const route = useRoute<any>();
  const { studentId } = route.params;

  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [filter, setFilter] = useState<RecordCategory | 'ALL'>('ALL');

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [studentId, filter])
  );

  async function loadRecords() {
    if (!db) return;
    const data = await getStudentTimeline(db, studentId, {
      category: filter === 'ALL' ? undefined : filter,
    });
    setRecords(data);
  }

  function renderRecord({ item }: { item: StudentRecord }) {
    const catColor = CATEGORY_COLORS[item.category] ?? COLORS.textLight;

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, { backgroundColor: catColor }]} />
          <View style={styles.timelineLine} />
        </View>
        <View style={styles.timelineCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || CATEGORY_LABELS[item.category]}
          </Text>
          <View style={styles.cardDetails}>
            {item.category === 'ATTENDANCE' && item.attendanceStatus ? (
              <Text style={styles.cardDetail}>{item.attendanceStatus}</Text>
            ) : item.score != null ? (
              <Text style={styles.cardDetail}>
                Score: {item.score}/{item.totalScore ?? '?'}
                {item.percentage != null ? ` (${item.percentage.toFixed(1)}%)` : ''}
              </Text>
            ) : null}
            <Text style={styles.cardSection}>
              {(item as any).subjectCode} - {(item as any).sectionName}
            </Text>
          </View>
          {item.remarks ? (
            <Text style={styles.cardRemarks} numberOfLines={2}>
              {item.remarks}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={FILTER_OPTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRecord}
        contentContainerStyle={styles.timeline}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  timeline: {
    padding: 16,
    paddingBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    marginLeft: 8,
  },
  cardHeader: {
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
  cardDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDetail: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardSection: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardRemarks: {
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
