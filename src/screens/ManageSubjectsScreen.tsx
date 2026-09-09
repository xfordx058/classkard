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
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Subject } from '../types';

export default function ManageSubjectsScreen() {
  const { db } = useApp();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  async function loadSubjects() {
    if (!db) return;
    const data = await getSubjects(db);
    setSubjects(data);
  }

  function openCreate() {
    setEditingSubject(null);
    setCode('');
    setName('');
    setDescription('');
    setModalVisible(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setDescription(subject.description);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!db) return;
    if (!code.trim() || !name.trim()) {
      Alert.alert('Error', 'Subject code and name are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingSubject) {
        await updateSubject(db, editingSubject.id, code.trim(), name.trim(), description.trim());
      } else {
        await createSubject(db, code.trim(), name.trim(), description.trim());
      }
      setModalVisible(false);
      await loadSubjects();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(subject: Subject) {
    if (!db) return;
    Alert.alert('Delete', `Delete subject "${subject.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubject(db, subject.id);
            await loadSubjects();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectCode}>{item.code}</Text>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.subjectDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <View style={styles.subjectActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No subjects yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSubject ? 'Edit Subject' : 'New Subject'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. CS101"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Introduction to Computing"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional description..."
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
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
                style={[styles.saveBtn, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Save'}
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
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  subjectDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subjectActions: {
    flexDirection: 'row',
    gap: 12,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
