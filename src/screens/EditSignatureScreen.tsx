import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SignatureScreenComp, { SignatureViewRef } from 'react-native-signature-canvas';
import { useApp } from '../context/AppContext';
import { updateUser } from '../db/queries';
import { COLORS } from '../theme/colors';

export default function EditSignatureScreen() {
  const { db, currentUser, refreshDb } = useApp();
  const navigation = useNavigation<any>();
  const signatureRef = useRef<SignatureViewRef>(null);

  const [saving, setSaving] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const signAttemptedRef = useRef(false);
  const [preview, setPreview] = useState<string | null>(
    currentUser?.signatureData && String(currentUser.signatureData).startsWith('data:image')
      ? String(currentUser.signatureData)
      : null
  );

  async function handleSave(base64: string) {
    if (!db || !currentUser) return;
    setSaving(true);
    try {
      await updateUser(db, currentUser.id, { signatureData: base64 });
      await refreshDb();
      setPreview(base64);
      Alert.alert('Saved', 'Your signature has been saved.', [{ text: 'OK' }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save signature.');
    } finally {
      setSaving(false);
    }
  }

  function handleSignPressed() {
    signAttemptedRef.current = true;
    signatureRef.current?.readSignature();
  }

  function handlePadEmpty() {
    if (signAttemptedRef.current) {
      signAttemptedRef.current = false;
      Alert.alert('Empty Signature', 'Draw your signature in the box first, then tap Save Signature.');
    }
  }

  function handleClearPad() {
    signatureRef.current?.clearSignature();
    setHasDrawn(false);
    signAttemptedRef.current = false;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Draw your signature below. It will be used when signing records.
      </Text>

      <View style={styles.padWrap}>
        <SignatureScreenComp
          ref={signatureRef}
          onOK={handleSave}
          onEmpty={handlePadEmpty}
          onBegin={() => setHasDrawn(true)}
          onClear={() => setHasDrawn(false)}
          dataURL={currentUser?.signatureData && String(currentUser.signatureData).startsWith('data:image') ? String(currentUser.signatureData) : undefined}
          trimWhitespace
          imageType="image/png"
          webStyle={signatureWebStyle}
        />
      </View>

      <TouchableOpacity
        style={[styles.signButton, saving && styles.signButtonDisabled]}
        onPress={handleSignPressed}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Save my signature"
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
            <Text style={styles.signButtonText}>Save Signature</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearPad}>
        <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
        <Text style={styles.clearButtonText}>Clear & Start Over</Text>
      </TouchableOpacity>

      {preview ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Current Signature</Text>
          <View style={styles.previewWrap}>
            <Image
              source={{ uri: preview }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        </View>
      ) : null}

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={COLORS.white} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

const signatureWebStyle = `
  .m-signature-pad {
    display: flex;
    flex-direction: column;
    border: 2px dashed #cfd8d3;
    border-radius: 14px;
    background: #ffffff;
  }
  .m-signature-pad--body { flex: 1; height: auto; border: none; }
  .m-signature-pad--footer { display: none; }
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  instructions: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  padWrap: {
    height: 340,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    marginTop: 14,
    marginBottom: 4,
  },
  signButtonDisabled: {
    opacity: 0.6,
  },
  signButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewWrap: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  savingOverlay: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  savingText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});