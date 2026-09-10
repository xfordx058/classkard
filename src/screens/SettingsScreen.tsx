import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { clearDatabase } from '../db/database';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme/colors';

export default function SettingsScreen() {
  const { currentUser, setCurrentUser, refreshDb } = useApp();
  const navigation = useNavigation<any>();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setCurrentUser(null);
        },
      },
    ]);
  }

  function handleClearData() {
    Alert.alert(
      'Clear Local Data',
      'This clears the local cache and signs you out. Your cloud data is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearDatabase();
              await refreshDb();
              setCurrentUser(null);
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to clear data.');
            }
          },
        },
      ]
    );
  }

  const menuItems = [
    {
      icon: 'person',
      label: 'Edit Profile',
      color: COLORS.primary,
      onPress: () => Alert.alert('Edit Profile', 'Profile editing coming soon.'),
    },
    {
      icon: 'calendar',
      label: 'Manage Academic Years',
      color: COLORS.success,
      onPress: () => navigation.navigate('ManageAcademicYears'),
    },
    {
      icon: 'book',
      label: 'Manage Subjects',
      color: COLORS.info,
      onPress: () => navigation.navigate('ManageSubjects'),
    },
    {
      icon: 'brush',
      label: 'My Signature',
      color: COLORS.info,
      onPress: () => navigation.navigate('EditSignature'),
    },
    {
      icon: 'download',
      label: 'Export Database',
      color: COLORS.secondary,
      onPress: () => Alert.alert('Export', 'Database export coming soon.'),
    },
    {
      icon: 'trash',
      label: 'Clear Local Data',
      color: COLORS.error,
      onPress: handleClearData,
    },
    {
      icon: 'log-out',
      label: 'Logout',
      color: COLORS.error,
      onPress: handleLogout,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'T'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser?.name}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {(() => {
                const role = currentUser?.role ?? '';
                return role.charAt(0).toUpperCase() + role.slice(1);
              })()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
          onPress={item.onPress}
        >
          <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <Text style={[styles.menuLabel, item.color === COLORS.error && { color: COLORS.error }]}>
            {item.label}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      ))}

      <Text style={styles.versionText}>ClassKard v1.0 - Teacher Edition</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 32,
  },
});
