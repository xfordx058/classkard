import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, COLORS } from '../theme/colors';
import { RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme/tokens';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const LABELS: Record<string, string> = {
  draft: 'Draft',
  ready_to_sign: 'Ready to Sign',
  signed: 'Signed',
  locked: 'Locked',
  corrected: 'Corrected',
  archived: 'Archived',
  active: 'Active',
  pending: 'Pending',
  approved: 'Approved',
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? COLORS.textLight;
  const text = label ?? LABELS[status] ?? status;

  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
  },
});