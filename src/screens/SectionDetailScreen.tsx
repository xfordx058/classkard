import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getSectionById, getStudentsBySection, getEnrollmentRequests } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Section, Student, Enrollment } from '../types';

export default function SectionDetailScreen() {
  const { db } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sectionId } = route.params;

  const [section, setSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [sectionId])
  );

  async function loadData() {
    if (!db) return;
    const sec = await getSectionById(db, sectionId);
    setSection(sec);
    const studs = await getStudentsBySection(db, sectionId);
    setStudents(studs);
    const pending = await getEnrollmentRequests(db, sectionId);
    setPendingCount(pending.length);
  }

  function renderStudent({ item, index }: { item: Student; index: number }) {
    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() =>
          navigation.navigate('StudentProfile', {
            studentId: item.id,
            sectionId: sectionId,
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName[0]}
            {item.lastName[0]}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.lastName}, {item.firstName} {item.middleName}
          </Text>
          <Text style={styles.studentNumber}>{item.studentNumber}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {section && (
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.subjectLabel}>
              {section.subjectCode} - {section.subjectName}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>{section.name}</Text>
          <View style={styles.codeRow}>
            <Ionicons name="key" size={16} color={COLORS.secondary} />
            <Text style={styles.classCode}>{section.classCode}</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Class Code', `Share this code with students:\n\n${section.classCode}`);
              }}
            >
              <Ionicons name="information-circle" size={18} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddStudent', { sectionId })}
        >
          <Ionicons name="person-add" size={18} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Add Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('EnrollmentRequests', { sectionId })}
        >
          <Ionicons name="people-circle" size={18} color={COLORS.secondary} />
          <Text style={styles.actionBtnText}>
            Requests {pendingCount > 0 ? `(${pendingCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('QuickEntry', { sectionId })
          }
        >
          <Ionicons name="flash" size={18} color={COLORS.success} />
          <Text style={styles.actionBtnText}>Quick Entry</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>
        Enrolled Students ({students.length})
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderStudent}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No students enrolled yet</Text>
            <Text style={styles.emptySubtext}>
              Add students manually or share the class code
            </Text>
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
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  classCode: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 2,
  },
  actionRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
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
    textAlign: 'center',
  },
});
