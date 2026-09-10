import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getAcademicYears, getSubjects, createSection } from '../db/queries';
import { COLORS } from '../theme/colors';
import { AcademicYear, Subject } from '../types';
import Skeleton from '../components/Skeleton';
import ErrorView from '../components/ErrorView';

export default function CreateSectionScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const years = await getAcademicYears(db);
      setAcademicYears(years);
      const active = years.find((y) => y.status === 'active');
      if (active) setSelectedYear(active);
      const subs = await getSubjects(db);
      setSubjects(subs);
    } catch {
      setError('Could not load options for creating a section.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!db || !currentUser) return;
    if (!selectedYear) {
      Alert.alert('Error', 'Select an academic year.');
      return;
    }
    if (!selectedSubject) {
      Alert.alert('Error', 'Select a subject.');
      return;
    }
    if (!sectionName.trim()) {
      Alert.alert('Error', 'Enter a section name.');
      return;
    }
    setCreating(true);
    try {
      const section = await createSection(
        db,
        selectedYear.id,
        selectedSubject.id,
        currentUser.id,
        sectionName.trim()
      );
      Alert.alert(
        'Section Created',
        `Class code: ${section.classCode}\n\nShare this code with your students.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create section.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? (
        <View style={styles.loadingBlock}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={i === 2 ? 64 : 96} radius={14} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => { setLoading(true); loadData(); }} />
      ) : (
        <>
      <View style={styles.headerCard}>
        <Ionicons name="add-circle" size={28} color={COLORS.white} />
        <Text style={styles.headerTitle}>Create New Section</Text>
      </View>

      <Text style={styles.sectionLabel}>Academic Year</Text>
      <View style={styles.optionsRow}>
        {academicYears.map((year) => (
          <TouchableOpacity
            key={year.id}
            style={[
              styles.optionCard,
              selectedYear?.id === year.id && styles.optionActive,
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text
              style={[
                styles.optionText,
                selectedYear?.id === year.id && styles.optionTextActive,
              ]}
            >
              {year.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Subject</Text>
      <View style={styles.optionsRow}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={[
              styles.optionCard,
              selectedSubject?.id === subject.id && styles.optionActive,
            ]}
            onPress={() => setSelectedSubject(subject)}
          >
            <Text
              style={[
                styles.optionText,
                selectedSubject?.id === subject.id && styles.optionTextActive,
              ]}
            >
              {subject.code} - {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Section Name</Text>
        <View style={styles.inputField}>
          <Ionicons name="pencil" size={16} color={COLORS.textSecondary} />
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. A, B, CS3A"
            placeholderTextColor={COLORS.textLight}
            value={sectionName}
            onChangeText={setSectionName}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={18} color={COLORS.info} />
        <Text style={styles.infoText}>
          A unique class code will be auto-generated. Students can use it to join this section.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.createButton, creating && { opacity: 0.5 }]}
        onPress={handleCreate}
        disabled={creating}
        accessibilityRole="button"
        accessibilityLabel="Create section"
      >
        <Ionicons name="add-circle" size={20} color={COLORS.white} />
        <Text style={styles.createButtonText}>
          {creating ? 'Creating...' : 'Create Section'}
        </Text>
      </TouchableOpacity>
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
    paddingBottom: 40,
  },
  loadingBlock: {
    paddingTop: 8,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  optionCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.white,
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
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  nameChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nameChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nameInput: {
    flex: 1,
  },
  nameInputText: {
    fontSize: 15,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textLight,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.info,
    flex: 1,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
});
