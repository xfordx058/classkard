import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import {
  getSectionsByTeacher,
  getActiveAcademicYear,
  getDashboardStats,
} from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';
import { Section } from '../types';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';

const REPORT_ITEMS = [
  { key: 'student', title: 'Student Summary', icon: 'person', color: COLORS.primary },
  { key: 'section', title: 'Section Summary', icon: 'school', color: COLORS.success },
  { key: 'attendance', title: 'Attendance Summary', icon: 'calendar-check', color: COLORS.attendance },
  { key: 'quiz', title: 'Quiz Summary', icon: 'clipboard-check', color: COLORS.quiz },
  { key: 'lab', title: 'Lab Summary', icon: 'flask', color: COLORS.laboratory },
  { key: 'exam', title: 'Exam Summary', icon: 'document-text', color: COLORS.exam },
  { key: 'assignment', title: 'Assignment Summary', icon: 'book-open', color: COLORS.assignment },
  { key: 'unsigned', title: 'Unsigned Records', icon: 'document-lock', color: COLORS.warning },
];

export default function ReportsScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [unsignedCount, setUnsignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    if (!db || !currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const ay = await getActiveAcademicYear(db);
      const secs = await getSectionsByTeacher(db, currentUser.id, ay?.id);
      setSections(secs);
      if (secs.length > 0 && !selectedSection) {
        setSelectedSection(secs[0]);
      }
      const stats = await getDashboardStats(db, currentUser.id, ay?.id);
      setUnsignedCount(stats.unsignedRecords);
    } catch {
      setError('Could not load reports.');
    } finally {
      setLoading(false);
    }
  }

  function renderReportItem(item: typeof REPORT_ITEMS[0]) {
    return (
      <TouchableOpacity
        key={item.key}
        style={styles.reportCard}
        onPress={() => {
          if (item.key === 'unsigned') {
            navigation.navigate('UnsignedRecords');
          } else {
            Alert.alert(
              item.title,
              selectedSection
                ? `${selectedSection.subjectCode} - ${selectedSection.name}\n\nSummary data will be displayed here in the full version.`
                : 'Select a section first.'
            );
          }
        }}
      >
        <View style={[styles.reportIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        <Text style={styles.reportTitle}>{item.title}</Text>
        {item.key === 'unsigned' && unsignedCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{unsignedCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? (
        <View style={styles.loadingBlock}>
          <SkeletonList rows={6} height={64} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => { setLoading(true); loadData(); }} />
      ) : sections.length === 0 ? (
        <Text style={styles.noSections}>
          Create a section to view reports.
        </Text>
      ) : (
        <>
      <View style={styles.sectionSelector}>
        <Text style={styles.selectorLabel}>Active Section:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sectionChips}>
            {sections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={[
                  styles.chip,
                  selectedSection?.id === sec.id && styles.chipActive,
                ]}
                onPress={() => setSelectedSection(sec)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${sec.subjectCode} ${sec.name}`}
                accessibilityState={{ selected: selectedSection?.id === sec.id }}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSection?.id === sec.id && styles.chipTextActive,
                  ]}
                >
                  {sec.subjectCode} - {sec.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>Available Reports</Text>
      {REPORT_ITEMS.map((item) => renderReportItem(item))}
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
  loadingBlock: {
    paddingTop: 8,
  },
  noSections: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingTop: 80,
  },
  sectionSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sectionChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
