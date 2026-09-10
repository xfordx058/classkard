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
import { createUser, loginByPin } from '../db/queries';
import { COLORS } from '../theme/colors';
import BrandLogo from '../components/BrandLogo';

export default function LoginScreen() {
  const { db, setCurrentUser } = useApp();
  const navigation = useNavigation<any>();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!db) return;
    if (!email.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please enter email and PIN.');
      return;
    }
    setLoading(true);
    try {
      const user = await loginByPin(db, email.trim(), pin);
      if (!user) {
        Alert.alert('Error', 'Invalid email or PIN.');
        return;
      }
      setCurrentUser(user);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
    if (!db) return;
    if (!name.trim() || !email.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (pin.length < 6) {
      Alert.alert('Error', 'PIN must be at least 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }
    setLoading(true);
    try {
      const user = await createUser(db, name.trim(), email.trim(), pin, 'teacher');
      setCurrentUser(user);
    } catch (e: any) {
      if (e.message?.includes('UNIQUE')) {
        Alert.alert('Error', 'An account with this email already exists.');
      } else {
        Alert.alert('Error', e.message ?? 'Failed to create account.');
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
        <View style={styles.logoContainer}>
          <BrandLogo size={112} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isCreateMode ? 'Create Teacher Account' : 'Teacher Login'}
          </Text>

          {isCreateMode && (
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
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="teacher@school.edu"
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
              placeholder="Enter 4-6 digit PIN"
              placeholderTextColor={COLORS.textLight}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
          </View>

          {isCreateMode && (
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
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isCreateMode ? handleCreateAccount : handleLogin}
            disabled={loading}
          >
            <Ionicons
              name={isCreateMode ? 'person-add' : 'log-in'}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.buttonText}>
              {loading
                ? 'Please wait...'
                : isCreateMode
                ? 'Create Account'
                : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsCreateMode(!isCreateMode);
              setName('');
              setEmail('');
              setPin('');
              setConfirmPin('');
            }}
          >
            <Text style={styles.toggleText}>
              {isCreateMode
                ? 'Already have an account? Login'
                : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.studentLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.studentLinkText}>
              Student? Register here
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>ClassKard v1.0 - Teacher Edition</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: COLORS.primary,
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
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  studentLink: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  studentLinkText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});
