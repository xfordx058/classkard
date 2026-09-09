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
import { getUnsignedRecords } from '../db/queries';
import { COLORS, CATEGORY_COLORS } from '../theme/colors';

export default function UnsignedRecordsScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  async function loadRecords() {
    if (!db || !currentUser) return;
    const data = await getUnsignedRecords(db, currentUser.id);
    setRecords(data);
  }

  function renderRecord({ item }: { item: any }) {
    const catColor = CATEGORY_COLORS[item.category] ?? COLORS.textLight;

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => navigation.navigate('Signature', { recordId: item.id })}
      >
        <View style={[styles.colorBar, { backgroundColor: catColor }]} />
        <View style={styles.recordContent}>
          <View style={styles.recordTop}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>
                {item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {item.title || item.category}
          </Text>
          <View style={styles.recordMeta}>
            <Text style={styles.metaText}>{item.sectionName}</Text>
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRecord}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.success} />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubtext}>No records waiting to be signed</Text>
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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  recordContent: {
    flex: 1,
    padding: 14,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
