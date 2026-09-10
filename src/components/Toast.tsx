import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

const COLORS_MAP: Record<ToastType, string> = {
  success: COLORS.success,
  error: COLORS.error,
  warning: COLORS.warning,
  info: COLORS.info,
};

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const nextId = useRef(0);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setItems([]);
    });
  }, [opacity, translateY]);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setItems([{ id, type, message }]);
      translateY.setValue(-120);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setTimeout(hide, 2600);
    },
    [hide, opacity, translateY]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  const current = items[0];

  return (
    <ToastContext.Provider value={value}>
      {children}
      {current ? (
        <Animated.View
          style={[
            styles.toast,
            { opacity, transform: [{ translateY }] },
          ]}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name={ICONS[current.type]} size={20} color={COLORS_MAP[current.type]} />
          <Text style={styles.message} numberOfLines={2}>
            {current.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
});