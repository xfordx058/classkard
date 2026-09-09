import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import {
  getSectionsByTeacher,
  getStudentsBySection,
  getSubjects,
} from '../db/queries';
import { COLORS } from '../theme/colors';
import {
  Section,
  Student,
  Subject,
  RecordCategory,
  ATTENDANCE_OPTIONS,
} from '../types';
import { createBulkRecords } from '../db/queries';

type Step = 'section' | 'category' | 'details' | 'entry' | 'review';

export default function QuickEntryScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preselectedSectionId = route.params?.sectionId;

  const [step, setStep] = useState<Step>(preselectedSectionId ? 'category' : 'section');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [category, setCategory] = useState<RecordCategory>('ATTENDANCE');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<Record<number, any>>({});
  const [saving, setSaving] = useState(false);

  const categories: { key: RecordCategory; label: string; icon: string; color: string }[] = [
    { key: 'ATTENDANCE', label: 'Attendance', icon: 'calendar-check', color: COLORS.attendance },
    { key: 'LABORATORY', label: 'Laboratory', icon: 'flask', color: COLORS.laboratory },
    { key: 'QUIZ', label: 'Quiz', icon: 'clipboard-check', color: COLORS.quiz },
    { key: 'EXAM', label: 'Exam', icon: 'document-text', color: COLORS.exam },
    { key: 'ASSIGNMENT', label: 'Assignment', icon: 'book-open', color: COLORS.assignment },
  ];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    if (!db || !currentUser) return;
    const secs = await getSectionsByTeacher(db, currentUser.id);
    setSections(secs);
    if (preselectedSectionId) {
      const sec = secs.find((s) => s.id === preselectedSectionId);
      if (sec) {
        setSelectedSection(sec);
        const studs = await getStudentsBySection(db, preselectedSectionId);
        setStudents(studs);
        const init: Record<number, any> = {};
        studs.forEach((s) => {
          init[s.id] = category === 'ATTENDANCE' ? 'Present' : '';
        });
        setEntries(init);
      }
    }
  }

  async function selectSection(sec: Section) {
    setSelectedSection(sec);
    if (db) {
      const studs = await getStudentsBySection(db, sec.id);
      setStudents(studs);
      const init: Record<number, any> = {};
      studs.forEach((s) => {
        init[s.id] = category === 'ATTENDANCE' ? 'Present' : '';
      });
      setEntries(init);
    }
    setStep('category');
  }

  function selectCategory(cat: RecordCategory) {
    setCategory(cat);
    const init: Record<number, any> = {};
    students.forEach((s) => {
      init[s.id] = cat === 'ATTENDANCE' ? 'Present' : '';
    });
    setEntries(init);
    setStep('details');
  }

  function markAllPresent() {
    const updated = { ...entries };
    students.forEach((s) => {
      updated[s.id] = 'Present';
    });
    setEntries(updated);
  }

  function updateEntry(studentId: number, value: string) {
    setEntries((prev) => ({ ...prev, [studentId]: value }));
  }

  async function handleSave(status: 'draft' | 'ready_to_sign') {
    if (!db || !currentUser || !selectedSection) return;
    if (!date.trim()) {
      Alert.alert('Error', 'Date is required.');
      return;
    }
    setSaving(true);
    try {
      const records = students.map((student) => {
        const val = entries[student.id];
        const base = {
          studentId: student.id,
          sectionId: selectedSection.id,
          category,
          title: title.trim() || `${category} - ${date}`,
          date: date.trim(),
          status,
          createdBy: currentUser.id,
        };

        if (category === 'ATTENDANCE') {
          return { ...base, attendanceStatus: val || 'Present' };
        }
        const numVal = val ? parseFloat(val) : null;
        return {
          ...base,
          score: numVal,
          totalScore: category === 'ASSIGNMENT' ? null : 100,
          recordType: category === 'ASSIGNMENT' ? 'Assignment' : '',
          attendanceStatus: category === 'ASSIGNMENT' ? 'Submitted' : null,
        };
      });

      await createBulkRecords(db, records);
      Alert.alert(
        'Success',
        `${records.length} records ${status === 'ready_to_sign' ? 'saved and ready to sign' : 'saved as draft'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save records.');
    } finally {
      setSaving(false);
    }
  }

  function renderStepIndicator() {
    const steps: Step[] = ['section', 'category', 'details', 'entry'];
    const labels = ['Section', 'Category', 'Details', 'Entry'];
    const currentIdx = steps.indexOf(step);
    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                i <= currentIdx && styles.stepDotActive,
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  i <= currentIdx && styles.stepDotTextActive,
                ]}
              >
                {i + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                i <= currentIdx && styles.stepLabelActive,
              ]}
            >
              {labels[i]}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (step === 'section') {
    return (
      <View style={styles.container}>
        {renderStepIndicator()}
        <Text style={styles.stepTitle}>Select a Section</Text>
        <FlatList
          data={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.selectCard}
              onPress={() => selectSection(item)}
            >
              <View style={styles.selectCardLeft}>
                <Text style={styles.selectCardCode}>{item.subjectCode}</Text>
                <View>
                  <Text style={styles.selectCardName}>{item.subjectName}</Text>
                  <Text style={styles.selectCardSub}>{item.name}</Text>
                </View>
              </View>
              <View style={styles.selectCardRight}>
                <Ionicons name="people" size={14} color={COLORS.textSecondary} />
                <Text style={styles.selectCardCount}>{item.studentCount ?? 0}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (step === 'category') {
    return (
      <View style={styles.container}>
        {renderStepIndicator()}
        <Text style={styles.stepTitle}>Select Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryCard, { borderColor: cat.color }]}
              onPress={() => selectCategory(cat.key)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryCardLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (step === 'details') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {renderStepIndicator()}
        <Text style={styles.stepTitle}>Entry Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title / Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chapter 1 Attendance"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textLight}
            value={date}
            onChangeText={setDate}
          />
        </View>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setStep('entry')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>
          {category} - {students.length} students
        </Text>
        {category === 'ATTENDANCE' && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
            <Ionicons name="checkmark-done" size={16} color={COLORS.success} />
            <Text style={styles.markAllText}>Mark All Present</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.entryList}
        renderItem={({ item, index }) => (
          <View style={styles.entryRow}>
            <Text style={styles.entryIndex}>{index + 1}</Text>
            <View style={styles.entryStudentInfo}>
              <Text style={styles.entryStudentName} numberOfLines={1}>
                {item.lastName}, {item.firstName}
              </Text>
              <Text style={styles.entryStudentNum}>{item.studentNumber}</Text>
            </View>
            {category === 'ATTENDANCE' ? (
              <View style={styles.attendanceOptions}>
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.attOption,
                      entries[item.id] === opt && styles.attOptionActive,
                      entries[item.id] === opt &&
                        opt === 'Present' && { backgroundColor: COLORS.success },
                      entries[item.id] === opt &&
                        opt === 'Absent' && { backgroundColor: COLORS.error },
                      entries[item.id] === opt &&
                        opt === 'Late' && { backgroundColor: COLORS.warning },
                      entries[item.id] === opt &&
                        opt === 'Excused' && { backgroundColor: COLORS.info },
                    ]}
                    onPress={() => updateEntry(item.id, opt)}
                  >
                    <Text
                      style={[
                        styles.attOptionText,
                        entries[item.id] === opt && styles.attOptionTextActive,
                      ]}
                    >
                      {opt[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.scoreInput}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={entries[item.id] ?? ''}
                onChangeText={(v) => updateEntry(item.id, v)}
                keyboardType="decimal-pad"
              />
            )}
          </View>
        )}
      />
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.draftBtn, saving && { opacity: 0.5 }]}
          onPress={() => handleSave('draft')}
          disabled={saving}
        >
          <Text style={styles.draftBtnText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signBtn, saving && { opacity: 0.5 }]}
          onPress={() => handleSave('ready_to_sign')}
          disabled={saving}
        >
          <Text style={styles.signBtnText}>Save & Sign</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    gap: 24,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stepDotTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  list: {
    padding: 16,
  },
  selectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  selectCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectCardCode: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectCardCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  entryList: {
    padding: 16,
    paddingBottom: 100,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 8,
  },
  entryIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    width: 20,
  },
  entryStudentInfo: {
    flex: 1,
  },
  entryStudentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  entryStudentNum: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  attendanceOptions: {
    flexDirection: 'row',
    gap: 4,
  },
  attOption: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attOptionActive: {
    borderWidth: 0,
  },
  attOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  attOptionTextActive: {
    color: COLORS.white,
  },
  scoreInput: {
    width: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
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
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
  },
  signBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
