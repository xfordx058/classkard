import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { createRecord } from '../db/queries';
import { COLORS } from '../theme/colors';
import {
  RecordCategory,
  ATTENDANCE_OPTIONS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_TYPES,
  PARTICIPATION_TYPES,
} from '../types';

export default function AddRecordScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sectionId, studentId, category, bulkStudents } = route.params as {
    sectionId: number;
    studentId?: number;
    category: RecordCategory;
    bulkStudents?: number[];
  };

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState('Submitted');
  const [assignmentType, setAssignmentType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [dateSubmitted, setDateSubmitted] = useState('');
  const [participationType, setParticipationType] = useState('Active');
  const [recordType, setRecordType] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(status: 'draft' | 'ready_to_sign') {
    if (!db || !currentUser) {
      Alert.alert('Error', 'You need to be signed in to save records.');
      return;
    }
    if (!studentId && !(bulkStudents && bulkStudents.length > 0)) {
      Alert.alert('Error', 'No student selected for this record.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Error', 'Date is required.');
      return;
    }
    setSaving(true);
    try {
      const students = bulkStudents && bulkStudents.length > 0 ? bulkStudents : [studentId!];
      for (const sid of students) {
        const data: any = {
          studentId: sid,
          sectionId,
          category,
          title: title.trim() || category,
          date: date.trim(),
          status,
          remarks: remarks.trim(),
          createdBy: currentUser.id,
        };

        if (category === 'ATTENDANCE') {
          data.attendanceStatus = attendanceStatus;
          data.timeIn = timeIn.trim() || null;
          data.timeOut = timeOut.trim() || null;
        } else if (category === 'QUIZ' || category === 'EXAM') {
          data.score = score ? parseFloat(score) : null;
          data.totalScore = totalScore ? parseFloat(totalScore) : null;
          data.recordType = recordType.trim();
        } else if (category === 'LABORATORY') {
          data.score = score ? parseFloat(score) : null;
          data.totalScore = totalScore ? parseFloat(totalScore) : null;
          data.recordType = participationType;
        } else if (category === 'ASSIGNMENT') {
          data.score = score ? parseFloat(score) : null;
          data.totalScore = totalScore ? parseFloat(totalScore) : null;
          data.attendanceStatus = assignmentStatus;
          data.recordType = assignmentType;
          data.dueDate = dueDate.trim() || null;
        }

        await createRecord(db, data);
      }

      const msg =
        status === 'ready_to_sign'
          ? 'Records created and ready for signing.'
          : 'Records saved as draft.';
      Alert.alert('Success', msg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  }

  function renderDropdown(
    label: string,
    options: string[],
    value: string,
    onChange: (v: string) => void
  ) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.optionsRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, value === opt && styles.optionActive]}
              onPress={() => onChange(opt)}
            >
              <Text
                style={[styles.optionText, value === opt && styles.optionTextActive]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.categoryHeader}>
        <Ionicons name="create" size={20} color={COLORS.white} />
        <Text style={styles.categoryTitle}>
          New {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} Record
        </Text>
      </View>

      {bulkStudents && bulkStudents.length > 0 && (
        <View style={styles.bulkNotice}>
          <Ionicons name="people" size={16} color={COLORS.info} />
          <Text style={styles.bulkText}>
            Creating record for {bulkStudents.length} students
          </Text>
        </View>
      )}

      {category !== 'ATTENDANCE' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title / Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chapter 1 Quiz"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      )}

      {category === 'ATTENDANCE' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Title (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Roll Call"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      )}

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

      {category === 'ATTENDANCE' && (
        <>
          {renderDropdown('Status', ATTENDANCE_OPTIONS, attendanceStatus, setAttendanceStatus)}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Time In</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.textLight}
                value={timeIn}
                onChangeText={setTimeIn}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Time Out</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.textLight}
                value={timeOut}
                onChangeText={setTimeOut}
              />
            </View>
          </View>
        </>
      )}

      {(category === 'QUIZ' || category === 'EXAM') && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Quiz 1, Midterm"
              placeholderTextColor={COLORS.textLight}
              value={recordType}
              onChangeText={setRecordType}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Score</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={score}
                onChangeText={setScore}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Items</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={totalScore}
                onChangeText={setTotalScore}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </>
      )}

      {category === 'LABORATORY' && (
        <>
          {renderDropdown('Participation Type', PARTICIPATION_TYPES, participationType, setParticipationType)}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Score</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={score}
                onChangeText={setScore}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Max Score</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={totalScore}
                onChangeText={setTotalScore}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </>
      )}

      {category === 'ASSIGNMENT' && (
        <>
          {renderDropdown('Assignment Type', ASSIGNMENT_TYPES, assignmentType, setAssignmentType)}
          {renderDropdown('Status', ASSIGNMENT_STATUS_OPTIONS, assignmentStatus, setAssignmentStatus)}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Score</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={score}
                onChangeText={setScore}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Max Score</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                value={totalScore}
                onChangeText={setTotalScore}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textLight}
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date Submitted</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textLight}
                value={dateSubmitted}
                onChangeText={setDateSubmitted}
              />
            </View>
          </View>
        </>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional remarks..."
          placeholderTextColor={COLORS.textLight}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.draftButton, saving && styles.buttonDisabled]}
          onPress={() => handleSave('draft')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.draftButtonText}>Save Draft</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signButton, saving && styles.buttonDisabled]}
          onPress={() => handleSave('ready_to_sign')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              <Text style={styles.signButtonText}>Save & Sign</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  bulkNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  bulkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.info,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  signButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    gap: 6,
  },
  signButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
