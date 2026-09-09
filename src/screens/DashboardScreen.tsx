import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getDashboardStats, getActiveAcademicYear } from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';
import { Section, StudentRecord } from '../types';

export default function DashboardScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [unsignedRecords, setUnsignedRecords] = useState(0);
  const [recentRecords, setRecentRecords] = useState<StudentRecord[]>([]);
  const [academicYear, setAcademicYear] = useState<string>('');

  async function loadData() {
    if (!db || !currentUser) return;
    try {
      const ay = await getActiveAcademicYear(db);
      setAcademicYear(ay?.name ?? 'No active year');
      const stats = await getDashboardStats(db, currentUser.id, ay?.id);
      setSections(stats.sections);
      setTotalStudents(stats.totalStudents);
      setUnsignedRecords(stats.unsignedRecords);
      setRecentRecords(stats.recentRecords);
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentUser])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{currentUser?.name ?? 'Teacher'}</Text>
        </View>
        <View style={styles.yearBadge}>
          <Ionicons name="calendar" size={14} color={COLORS.primaryLight} />
          <Text style={styles.yearText}>{academicYear}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
          <Ionicons name="people" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{totalStudents}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
          <Ionicons name="school" size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{sections.length}</Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
        <TouchableOpacity
          style={[styles.statCard, unsignedRecords > 0 ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#F1F5F3' }]}
          onPress={() => navigation.navigate('UnsignedRecords')}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={unsignedRecords > 0 ? COLORS.warning : COLORS.textLight}
          />
          <Text style={[styles.statNumber, unsignedRecords > 0 && { color: COLORS.warning }]}>
            {unsignedRecords}
          </Text>
          <Text style={styles.statLabel}>To Sign</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('QuickEntry')}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="flash" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.actionLabel}>Quick Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.info }]}>
            <Ionicons name="search" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.actionLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="bar-chart" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.actionLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('UnsignedRecords')}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
            <Ionicons name="create" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.actionLabel}>Sign</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Sections</Text>
      {sections.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={40} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No sections yet</Text>
          <Text style={styles.emptySubtext}>Create a section to get started</Text>
        </View>
      ) : (
        sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionCard}
            onPress={() => navigation.navigate('SectionDetail', { sectionId: section.id })}
          >
            <View style={styles.sectionLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="book" size={18} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.sectionSubject}>
                  {section.subjectCode} - {section.subjectName}
                </Text>
                <Text style={styles.sectionName}>{section.name}</Text>
              </View>
            </View>
            <View style={styles.sectionRight}>
              <Ionicons name="people" size={14} color={COLORS.textSecondary} />
              <Text style={styles.sectionCount}>{section.studentCount ?? 0}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {recentRecords.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          {recentRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('Signature', { recordId: record.id })}
            >
              <View
                style={[
                  styles.recentDot,
                  { backgroundColor: CATEGORY_COLORS[record.category] ?? COLORS.textLight },
                ]}
              />
              <View style={styles.recentContent}>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {record.title || record.category}
                </Text>
                <Text style={styles.recentMeta}>
                  {(record as any).studentName} - {record.date}
                </Text>
              </View>
              {record.status === 'signed' || record.status === 'locked' ? (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              ) : (
                <Ionicons name="time" size={18} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
          ))}
        </>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  recentMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
