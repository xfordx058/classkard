import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface LoadingViewProps {
  label?: string;
  style?: ViewStyle;
}

export default function LoadingView({ label = 'Loading...', style }: LoadingViewProps) {
  return (
    <View style={[styles.container, style]} accessible accessibilityRole="progressbar">
      <Ionicons name="ellipsis-horizontal" size={28} color={COLORS.textLight} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});