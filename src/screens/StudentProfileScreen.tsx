import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getStudentById, getSectionById, getRecordCountByCategory, getStudentByUserId, getStudentSections } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Student, Section, CARD_CONFIG } from '../types';

export default function StudentProfileScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentId, sectionId, fromStudent } = route.params ?? {};

  const [student, setStudent] = useState<Student | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [studentId, sectionId, fromStudent])
  );

  async function loadData() {
    if (!db) return;
    setLoading(true);
    let st: Student | null = null;
    if (studentId) {
      st = await getStudentById(db, studentId);
    }
    if (!st && currentUser) {
      st = await getStudentByUserId(db, currentUser.id);
    }
    setStudent(st);

    let sec: Section | null = null;
    if (sectionId) {
      sec = await getSectionById(db, sectionId);
    } else if (st) {
      const stSections = await getStudentSections(db, st.id);
      sec = stSections[0] ?? null;
    }
    setSection(sec);

    if (st && sec) {
      const c = await getRecordCountByCategory(db, st.id, sec.id);
      setCounts(c);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!section) {
    return (
      <View style={styles.center}>
        <Ionicons name="school-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No enrolled classes</Text>
        <Text style={styles.emptySubtitle}>
          Join a class first to see your five cards.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student?.firstName?.[0] ?? '?'}{student?.lastName?.[0] ?? '?'}
          </Text>
        </View>
        <Text style={styles.studentName}>
          {student?.lastName}, {student?.firstName} {student?.middleName}
        </Text>
        <Text style={styles.studentNumber}>{student?.studentNumber}</Text>
        {section && (
          <View style={styles.sectionBadge}>
            <Ionicons name="school" size={14} color={COLORS.primary} />
            <Text style={styles.sectionText}>
              {section.subjectCode} - {section.name}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Record Overview</Text>
      <View style={styles.cardsGrid}>
        {CARD_CONFIG.map((card) => {
          const recordCount = counts[card.category] ?? 0;
          return (
            <TouchableOpacity
              key={card.category}
              style={[styles.cardButton, { borderTopColor: card.color }]}
              onPress={() =>
                navigation.navigate('CardDetail', {
                  sectionId,
                  studentId: student?.id ?? studentId,
                  category: card.category,
                  fromStudent,
                })
              }
            >
              <View style={[styles.cardIcon, { backgroundColor: card.color + '1A' }]}>
                <Ionicons name={card.icon as any} size={22} color={card.color} />
              </View>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={[styles.cardCount, { color: card.color }]}>{recordCount}</Text>
              <Text style={styles.cardHint}>
                {recordCount === 0 ? 'No records yet' : `${recordCount} record${recordCount > 1 ? 's' : ''}`}
              </Text>
              <View style={styles.cardLink}>
                <Text style={[styles.cardLinkText, { color: card.color }]}>View Card</Text>
                <Ionicons name="chevron-forward" size={14} color={card.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() =>
          navigation.navigate('StudentTimeline', {
            studentId: student?.id ?? studentId,
            sectionId,
            fromStudent,
          })
        }
      >
        <Ionicons name="time" size={20} color={COLORS.primary} />
        <Text style={styles.historyButtonText}>View All History</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  content: {
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  studentNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  sectionText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  cardButton: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  cardCount: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  cardHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  cardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  cardLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  historyButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});
