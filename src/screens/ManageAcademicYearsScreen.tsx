import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getAcademicYears, createAcademicYear, updateAcademicYearStatus, deleteAcademicYear } from '../db/queries';
import { COLORS } from '../theme/colors';
import { AcademicYear } from '../types';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';
import Fab from '../components/Fab';
import { useToast } from '../components/Toast';

export default function ManageAcademicYearsScreen() {
  const { db } = useApp();
  const { toast } = useToast();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadYears();
    }, [])
  );

  async function loadYears() {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAcademicYears(db);
      setYears(data);
    } catch {
      setError('Could not load academic years.');
      setYears([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!db) return;
    if (!name.trim() || !startDate.trim() || !endDate.trim()) {
      toast('warning', 'Please fill in all fields.');
      return;
    }
    setSaving(true);
    try {
      await createAcademicYear(db, name.trim(), startDate.trim(), endDate.trim());
      setModalVisible(false);
      setName('');
      setStartDate('');
      setEndDate('');
      toast('success', 'Academic year created');
      await loadYears();
    } catch (e: any) {
      toast('error', e.message ?? 'Failed to create academic year.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(year: AcademicYear) {
    if (!db) return;
    const newStatus = year.status === 'active' ? 'inactive' : 'active';
    try {
      await updateAcademicYearStatus(db, year.id, newStatus);
      toast('info', `Year marked ${newStatus}`);
      await loadYears();
    } catch (e: any) {
      toast('error', e.message ?? 'Failed to update.');
    }
  }

  async function handleDelete(year: AcademicYear) {
    if (!db) return;
    Alert.alert('Delete', `Delete academic year "${year.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAcademicYear(db, year.id);
            toast('info', 'Academic year deleted');
            await loadYears();
          } catch (e: any) {
            toast('error', e.message ?? 'Failed to delete.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.list}>
          <SkeletonList rows={5} height={72} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={loadYears} />
      ) : (
        <FlatList
          data={years}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.yearCard}>
              <View style={styles.yearInfo}>
                <Text style={styles.yearName}>{item.name}</Text>
                <Text style={styles.yearDates}>
                  {item.startDate} to {item.endDate}
                </Text>
              </View>
              <View style={styles.yearActions}>
                <TouchableOpacity
                  style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}
                  onPress={() => toggleStatus(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${item.name} ${item.status === 'active' ? 'inactive' : 'active'}`}
                >
                  <Text style={[styles.statusText, item.status === 'active' ? styles.activeText : styles.inactiveText]}>
                    {item.status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.name}`}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No academic years</Text>
            </View>
          }
        />
      )}

      <Fab onPress={() => setModalVisible(true)} label="Add academic year" />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Academic Year</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2025-2026"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textLight}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textLight}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, saving && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                <Text style={styles.createBtnText}>
                  {saving ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  yearCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  yearInfo: {
    flex: 1,
  },
  yearName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  yearDates: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  yearActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: COLORS.success + '20',
  },
  inactiveBadge: {
    backgroundColor: COLORS.textLight + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeText: {
    color: COLORS.success,
  },
  inactiveText: {
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
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
    backgroundColor: COLORS.surfaceAlt,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
