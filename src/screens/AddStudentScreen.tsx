import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { createStudent, enrollStudent } from '../db/queries';
import { COLORS } from '../theme/colors';

export default function AddStudentScreen() {
  const { db } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sectionId } = route.params;

  const [studentNumber, setStudentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!db) return;
    if (!studentNumber.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Student number, first name, and last name are required.');
      return;
    }
    setLoading(true);
    try {
      const student = await createStudent(
        db,
        studentNumber.trim(),
        firstName.trim(),
        middleName.trim(),
        lastName.trim()
      );
      await enrollStudent(db, student.id, sectionId);
      Alert.alert('Success', `${student.firstName} ${student.lastName} has been added.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      if (e.message?.includes('UNIQUE')) {
        Alert.alert('Error', 'A student with this number already exists.');
      } else {
        Alert.alert('Error', e.message ?? 'Failed to add student.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerCard}>
          <Ionicons name="person-add" size={28} color={COLORS.white} />
          <Text style={styles.headerTitle}>Add Student</Text>
          <Text style={styles.headerSubtitle}>Manually enroll a student</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2024-00001"
              placeholderTextColor={COLORS.textLight}
              value={studentNumber}
              onChangeText={setStudentNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan"
              placeholderTextColor={COLORS.textLight}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Middle Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={COLORS.textLight}
              value={middleName}
              onChangeText={setMiddleName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dela Cruz"
              placeholderTextColor={COLORS.textLight}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && { opacity: 0.5 }]}
            onPress={handleAdd}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add & Enroll Student'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
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
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
