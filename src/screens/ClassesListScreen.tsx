import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getSectionsByTeacher } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Section } from '../types';

export default function ClassesListScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSections();
    }, [currentUser])
  );

  async function loadSections() {
    if (!db || !currentUser) return;
    const data = await getSectionsByTeacher(db, currentUser.id);
    setSections(data);
  }

  function renderSection({ item }: { item: Section }) {
    return (
      <TouchableOpacity
        style={styles.sectionCard}
        onPress={() => navigation.navigate('SectionDetail', { sectionId: item.id })}
      >
        <View style={styles.cardTop}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.subjectCode}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.subjectName}>{item.subjectName}</Text>
            <Text style={styles.sectionName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.studentCount ?? 0} students</Text>
          </View>
          <View style={styles.codeContainer}>
            <Ionicons name="key" size={12} color={COLORS.primary} />
            <Text style={styles.classCode}>{item.classCode}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSection}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Sections Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first section to start managing your classes
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSection')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  codeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  cardInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  classCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
});
