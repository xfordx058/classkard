import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const ICON = require('../../assets/icon.png');

export default function BrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={ICON} style={styles.image} resizeMode="cover" />
      </View>
      <Text style={styles.title}>ClassKard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
