import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ViewProps } from 'react-native';
import { GLASS, RADIUS, SHADOW, COLORS } from '../theme/tokens';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  solid?: boolean;
  accentColor?: string;
}

export default function GlassCard({ children, style, solid, accentColor, ...rest }: GlassCardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        solid && styles.solid,
        accentColor ? { borderTopColor: accentColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...GLASS,
    borderRadius: RADIUS.lg,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
    padding: 16,
    ...SHADOW.sm,
    backgroundColor: COLORS.surface,
  },
  solid: {
    backgroundColor: COLORS.surface,
  },
});