import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme/tokens';

interface CardButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'success' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function CardButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
}: CardButtonProps) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const bg =
    variant === 'primary' || variant === 'success'
      ? variant === 'success'
        ? COLORS.success
        : COLORS.primary
      : variant === 'danger'
      ? COLORS.error
      : 'transparent';
  const fg = isOutline || isGhost ? COLORS.primary : COLORS.white;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bg },
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: RADIUS.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});