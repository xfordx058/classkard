import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getStudentsBySection, getSectionById, createBulkRecords } from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';
import { Student, Section, RecordCategory } from '../types';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';
import { useToast } from '../components/Toast';

export default function BulkScoreEntryScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { toast } = useToast();
  const { sectionId, category, title, date } = route.params as {
    sectionId: number;
    category: RecordCategory;
    title: string;
    date: string;
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [scores, setScores] = useState<Record<number, { score: string; total: string }>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [sectionId])
  );

  async function loadData() {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const sec = await getSectionById(db, sectionId);
      setSection(sec);
      const studs = await getStudentsBySection(db, sectionId);
      setStudents(studs);
      const init: Record<number, { score: string; total: string }> = {};
      studs.forEach((s) => {
        init[s.id] = { score: '', total: '100' };
      });
      setScores(init);
    } catch {
      setError('Could not load students.');
      setStudents([]);
      setSection(null);
    } finally {
      setLoading(false);
    }
  }

  function updateScore(studentId: number, field: 'score' | 'total', value: string) {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  }

  async function handleSave(status: 'draft' | 'ready_to_sign') {
    if (!db || !currentUser) {
      Alert.alert('Error', 'You need to be signed in to save records.');
      return;
    }
    if (students.length === 0) {
      Alert.alert('Error', 'This class has no students yet.');
      return;
    }
    setSaving(true);
    try {
      const records = students.map((student) => {
        const s = scores[student.id];
        const scoreVal = s?.score ? parseFloat(s.score) : null;
        const totalVal = s?.total ? parseFloat(s.total) : null;
        return {
          studentId: student.id,
          sectionId,
          category,
          title: title || `${category} - ${date}`,
          date,
          score: scoreVal,
          totalScore: totalVal,
          recordType: category === 'LABORATORY' ? 'Active' : '',
          status,
          createdBy: currentUser.id,
        };
      });

      await createBulkRecords(db, records);
      Alert.alert(
        'Success',
        `${records.length} records ${status === 'ready_to_sign' ? 'saved and ready to sign' : 'saved as draft'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      toast('success', `${records.length} records saved`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save records.');
    } finally {
      setSaving(false);
    }
  }

  const catColor = CATEGORY_COLORS[category] ?? COLORS.textLight;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{title || category}</Text>
          <Text style={styles.headerMeta}>
            {section?.subjectCode} - {section?.name} | {date} | {students.length} students
          </Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, styles.colIndex]}>#</Text>
        <Text style={[styles.colHeader, styles.colName]}>Student</Text>
        <Text style={[styles.colHeader, styles.colScore]}>Score</Text>
        <Text style={[styles.colHeader, styles.colTotal]}>Total</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          <SkeletonList rows={6} height={56} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => { setLoading(true); loadData(); }} />
      ) : (
        <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.colCell, styles.colIndex]}>{index + 1}</Text>
            <View style={styles.colName}>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.lastName}, {item.firstName}
              </Text>
              <Text style={styles.studentNum}>{item.studentNumber}</Text>
            </View>
            <TextInput
              style={[styles.colCell, styles.colScore, styles.scoreInput]}
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
              value={scores[item.id]?.score ?? ''}
              onChangeText={(v) => updateScore(item.id, 'score', v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.colCell, styles.colTotal, styles.scoreInput]}
              placeholder="100"
              placeholderTextColor={COLORS.textLight}
              value={scores[item.id]?.total ?? ''}
              onChangeText={(v) => updateScore(item.id, 'total', v)}
              keyboardType="decimal-pad"
            />
          </View>
        )}
      />
      )}

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.draftBtn, saving && { opacity: 0.6 }]}
          onPress={() => handleSave('draft')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <Text style={styles.draftBtnText}>Save Draft</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signBtn, saving && { opacity: 0.6 }]}
          onPress={() => handleSave('ready_to_sign')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              <Text style={styles.signBtnText}>Save & Sign All</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  colIndex: {
    width: 30,
  },
  colName: {
    flex: 1,
  },
  colScore: {
    width: 65,
    textAlign: 'center',
  },
  colTotal: {
    width: 65,
    textAlign: 'center',
  },
  list: {
    padding: 12,
    paddingBottom: 100,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  colCell: {
    fontSize: 13,
    color: COLORS.text,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentNum: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  draftBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  draftBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  signBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    gap: 6,
  },
  signBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
