import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import SignatureScreenComp, { SignatureViewRef } from 'react-native-signature-canvas';
import { useApp } from '../context/AppContext';
import { getRecordById, signRecord, createAuditLog, updateUser } from '../db/queries';
import { COLORS, CATEGORY_COLORS, STATUS_COLORS } from '../theme/colors';
import { StudentRecord } from '../types';

export default function SignatureScreen() {
  const { db, currentUser } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { recordId } = route.params;

  const signatureRef = useRef<SignatureViewRef>(null);

  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedImage, setSignedImage] = useState<string | null>(null);

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
    if (r?.signatureData && String(r.signatureData).startsWith('data:image')) {
      setSignedImage(String(r.signatureData));
    }
    setFetching(false);
  }

  const isSigned = record?.status === 'signed' || record?.status === 'locked';

  async function handleConfirm(sigBase64: string) {
    if (!db || !currentUser || !record) return;
    setLoading(true);
    try {
      await signRecord(db, record.id, currentUser.id, sigBase64);
      await updateUser(db, currentUser.id, { signatureData: sigBase64 });
      await createAuditLog(
        db,
        record.id,
        currentUser.id,
        'sign',
        record.status,
        'signed',
        'Record signed and locked'
      );
      setSignedImage(sigBase64);
      setHasSignature(true);
      Alert.alert('Signed', 'Record has been signed and locked.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to sign record.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
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

      {isSigned ? (
        signedImage ? (
          <View style={styles.signatureCard}>
            <View style={styles.signatureHeader}>
              <Ionicons name="brush" size={18} color={COLORS.success} />
              <Text style={styles.signatureHeaderText}>Drawn Signature</Text>
            </View>
            <View style={styles.signatureImageWrap}>
              <Image
                source={{ uri: signedImage }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.signatureMeta}>
              Signed by {currentUser?.name ?? 'Teacher'} · {record.signedAt}
            </Text>
          </View>
        ) : (
          <View style={styles.signatureCard}>
            <Text style={styles.signatureMeta}>
              Signed by {currentUser?.name ?? 'Teacher'}
            </Text>
          </View>
        )
      ) : (
        <View>
          <Text style={styles.padTitle}>Draw your signature in the box</Text>
          <View style={styles.padWrap}>
            <SignatureScreenComp
              ref={signatureRef}
              onOK={handleConfirm}
              onEmpty={() => setHasSignature(false)}
              onBegin={() => setHasSignature(true)}
              onClear={() => setHasSignature(false)}
              dataURL={currentUser?.signatureData && String(currentUser.signatureData).startsWith('data:image') ? String(currentUser.signatureData) : undefined}
              clearText="Clear"
              confirmText="Sign"
              trimWhitespace
              imageType="image/png"
              webStyle={signatureWebStyle}
            />
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
            <Text style={styles.clearButtonText}>Clear & Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const signatureWebStyle = `
  .m-signature-pad { border: 2px dashed #cfd8d3; border-radius: 14px; background: #ffffff; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { padding-top: 8px; }
  .m-signature-pad--footer .description { display: none; }
  .m-signature-pad--footer .button {
    background: #22C55E; color: #ffffff; border-radius: 8px;
    font-weight: 700; font-size: 14px;
  }
  .m-signature-pad--footer .button.clear { background: #f1f5f3; color: #475569; }
`;

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
  padTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  padWrap: {
    height: 320,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  signatureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  signatureHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureImageWrap: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  signatureMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
});