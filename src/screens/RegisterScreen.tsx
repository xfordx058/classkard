import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { registerStudent } from '../db/queries';
import { COLORS } from '../theme/colors';
import BrandLogo from '../components/BrandLogo';

export default function RegisterScreen() {
  const { db, setCurrentUser } = useApp();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!db) return;
    if (!name.trim() || !studentNumber.trim() || !email.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }
    setLoading(true);
    try {
      const user = await registerStudent(db, name.trim(), studentNumber.trim(), email.trim(), pin);
      setCurrentUser(user);
      Alert.alert(
        'Success',
        'Account created! You can now join classes using a class code.',
        [{ text: 'OK' }]
      );
    } catch (e: any) {
      if (e.message?.includes('A student with this student number')) {
        Alert.alert('Error', e.message);
      } else if (e.message?.includes('UNIQUE')) {
        Alert.alert('Error', 'An account with this email already exists.');
      } else {
        Alert.alert('Error', e.message ?? 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <BrandLogo size={80} showName={false} />
          <Text style={styles.title}>Student Registration</Text>
          <Text style={styles.subtitle}>Create your student account to join classes</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Dela Cruz"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2024-00001"
              placeholderTextColor={COLORS.textLight}
              value={studentNumber}
              onChangeText={setStudentNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="student@school.edu"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a 4-6 digit PIN"
              placeholderTextColor={COLORS.textLight}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter PIN"
              placeholderTextColor={COLORS.textLight}
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginBottom: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
