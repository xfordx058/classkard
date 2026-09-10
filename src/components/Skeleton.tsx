import React, { useEffect, useRef } from 'react';
import { Animated, AccessibilityInfo, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const reduceMotion = useRef(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!mounted) return;
      reduceMotion.current = enabled;
      if (!enabled) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      }
    });
    return () => {
      mounted = false;
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessible={false}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: COLORS.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

// List row skeleton used for card lists across screens.
export function SkeletonList({ rows = 4, height = 84, radius = 20 }: { rows?: number; height?: number; radius?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius={radius} style={{ marginBottom: 12 }} />
      ))}
    </>
  );
}

// Tiles for dashboard statistics.
export function SkeletonStats({ tiles = 3, height = 96 }: { tiles?: number; height?: number }) {
  return (
    <SkeletonList rows={tiles} height={height} radius={20} />
  );
}