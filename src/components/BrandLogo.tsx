import React from 'react';
import { Image, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

const ICON = require('../../assets/icon.png');

interface BrandLogoProps {
  size?: number;
  showName?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function BrandLogo({
  size = 96,
  showName = true,
  backgroundColor,
  style,
}: BrandLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          backgroundColor ? { backgroundColor } : null,
        ]}
      >
        <Image
          source={ICON}
          style={[styles.image, { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 }]}
          resizeMode="cover"
        />
      </View>
      {showName && (
        <View style={styles.textContainer}>
          <Text style={styles.appName}>ClassKard</Text>
          <Text style={styles.tagline}>Five cards. One organized class record.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
