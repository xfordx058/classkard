import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getSectionsByTeacher } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Section } from '../types';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';
import Fab from '../components/Fab';

export default function ClassesListScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadSections();
    }, [currentUser])
  );

  async function loadSections(refresh = false) {
    if (!db || !currentUser) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await getSectionsByTeacher(db, currentUser.id);
      setSections(data);
    } catch {
      setError('Could not load your sections.');
      setSections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      {loading ? (
        <View style={styles.list}>
          <SkeletonList rows={4} height={128} />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => loadSections()} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSection}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadSections(true)} tintColor={COLORS.primary} />
          }
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
      )}
      <Fab onPress={() => navigation.navigate('CreateSection')} label="Create section" />
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
    paddingTop: 24,
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
});
