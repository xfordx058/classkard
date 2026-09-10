import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import {
  getEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment,
  approveAllEnrollments,
} from '../db/queries';
import { COLORS } from '../theme/colors';
import { Enrollment } from '../types';
import { useToast } from '../components/Toast';
import { SkeletonList } from '../components/Skeleton';
import ErrorView from '../components/ErrorView';

export default function EnrollmentRequestsScreen() {
  const { db } = useApp();
  const route = useRoute<any>();
  const { sectionId } = route.params;
  const { toast } = useToast();

  const [requests, setRequests] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [sectionId])
  );

  async function loadRequests(refresh = false) {
    if (!db) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await getEnrollmentRequests(db, sectionId);
      setRequests(data);
    } catch {
      setError('Could not load enrollment requests.');
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleApprove(id: number) {
    if (!db || busyId !== null) return;
    setBusyId(id);
    try {
      await approveEnrollment(db, id, sectionId);
      await loadRequests();
      toast('success', 'Enrollment approved');
    } catch (e: any) {
      toast('error', e?.message ?? 'Failed to approve.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: number) {
    if (!db || busyId !== null) return;
    Alert.alert('Reject', 'Remove this enrollment request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setBusyId(id);
          try {
            await rejectEnrollment(db, id, sectionId);
            await loadRequests();
            toast('info', 'Enrollment request removed');
          } catch (e: any) {
            toast('error', e?.message ?? 'Failed to reject.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  }

  async function handleApproveAll() {
    if (!db || approvingAll) return;
    Alert.alert('Approve All', `Approve ${requests.length} pending requests?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve All',
        onPress: async () => {
          setApprovingAll(true);
          try {
            await approveAllEnrollments(db, sectionId);
            await loadRequests();
            toast('success', 'All requests approved');
          } catch (e: any) {
            toast('error', e?.message ?? 'Failed.');
          } finally {
            setApprovingAll(false);
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
        <ErrorView message={error} onRetry={() => loadRequests()} />
      ) : (
        <>
      {requests.length > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.countText}>
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.approveAllBtn}
            onPress={handleApproveAll}
            disabled={approvingAll}
            accessibilityRole="button"
            accessibilityLabel="Approve all requests"
          >
            {approvingAll ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
            )}
            <Text style={styles.approveAllText}>Approve All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.white} />
            </View>
            <View style={styles.requestInfo}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.studentNumber}>{item.studentNumber}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item.id)}
                disabled={busyId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Approve ${item.studentName}`}
              >
                {busyId === item.id ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReject(item.id)}
                disabled={busyId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Reject ${item.studentName}`}
              >
                {busyId === item.id ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Ionicons name="close" size={18} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
      />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  approveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
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
});
