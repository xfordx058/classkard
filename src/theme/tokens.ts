import { COLORS } from './colors';

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const FONT_SIZE = {
  display: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  small: 13,
  caption: 12,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const SHADOW = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  borderColor: 'rgba(255, 255, 255, 0.6)',
  borderWidth: 1,
};

export { COLORS };