import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getRecordById, signRecord, createAuditLog } from '../db/queries';
import { COLORS, CATEGORY_COLORS, STATUS_COLORS } from '../theme/colors';
import { StudentRecord } from '../types';

export default function SignatureScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { recordId } = route.params;

  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRecord();
    }, [recordId])
  );

  async function loadRecord() {
    if (!db) return;
    setFetching(true);
    const r = await getRecordById(db, recordId);
    setRecord(r);
    setFetching(false);
  }

  const isSigned = record?.status === 'signed' || record?.status === 'locked';

  async function handleSign() {
    if (!db || !currentUser || !record) return;
    setLoading(true);
    try {
      const sigData = currentUser.signatureData
        || `${currentUser.name} - ${new Date().toISOString()}`;
      await signRecord(db, record.id, currentUser.id, sigData);
      await createAuditLog(
        db,
        record.id,
        currentUser.id,
        'sign',
        record.status,
        'signed',
        'Record signed and locked'
      );
      Alert.alert('Signed', 'Record has been signed and locked.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to sign record.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching || !record) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading record...</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[record.category] ?? COLORS.textLight;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isSigned ? (
        <View style={styles.statusHeader}>
          <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
          <Text style={styles.signedTitle}>Record Signed</Text>
          <Text style={styles.signedSubtitle}>
            This record has been signed and locked.
          </Text>
        </View>
      ) : (
        <View style={styles.statusHeader}>
          <Ionicons name="document-text" size={36} color={COLORS.warning} />
          <Text style={styles.reviewTitle}>Review Record</Text>
          <Text style={styles.reviewSubtitle}>Everything looks correct?</Text>
        </View>
      )}

      <View style={styles.detailCard}>
        <View style={[styles.categoryBar, { backgroundColor: catColor }]} />
        <View style={styles.detailContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {record.category}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student</Text>
            <Text style={styles.detailValue}>
              {(record as any).studentName ?? 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>{record.title || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{record.date}</Text>
          </View>

          {record.category === 'ATTENDANCE' && record.attendanceStatus && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attendance</Text>
              <Text style={styles.detailValue}>{record.attendanceStatus}</Text>
            </View>
          )}

          {record.score != null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Score</Text>
              <Text style={styles.detailValue}>
                {record.score} / {record.totalScore ?? '?'}
                {record.percentage != null ? ` (${record.percentage.toFixed(1)}%)` : ''}
              </Text>
            </View>
          )}

          {record.remarks ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remarks</Text>
              <Text style={styles.detailValue}>{record.remarks}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: STATUS_COLORS[record.status] ?? COLORS.text }]}>
              {record.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{record.createdAt}</Text>
          </View>

          {record.signedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Signed At</Text>
              <Text style={styles.detailValue}>{record.signedAt}</Text>
            </View>
          )}
        </View>
      </View>

      {!isSigned && (
        <TouchableOpacity
          style={[styles.signButton, loading && { opacity: 0.5 }]}
          onPress={handleSign}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="lock-closed" size={20} color={COLORS.white} />
          )}
          <Text style={styles.signButtonText}>
            {loading ? 'Signing...' : 'Sign & Lock'}
          </Text>
        </TouchableOpacity>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  signedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: 12,
  },
  signedSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  categoryBar: {
    height: 4,
  },
  detailContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  signButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
});
