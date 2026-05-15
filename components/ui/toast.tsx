import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onHide?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide]);

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: colors.success, text: '#FFFFFF' };
      case 'error':
        return { bg: colors.error, text: '#FFFFFF' };
      case 'warning':
        return { bg: colors.warning, text: '#000000' };
      default:
        return { bg: colors.info, text: '#FFFFFF' };
    }
  };

  const toastColors = getToastColors();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      className="absolute top-12 left-4 right-4 z-50 rounded-2xl p-4 shadow-lg"
      style={{
        backgroundColor: toastColors.bg,
        shadowColor: colors.shadow,
      }}
    >
      <Text
        className="text-center font-semibold"
        style={{ color: toastColors.text }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <View className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          className="px-4"
          style={{ marginTop: index * 80 }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onHide={() => onRemove(toast.id)}
          />
        </View>
      ))}
    </View>
  );
}

// Toast Manager
let toastId = 0;
const toastListeners = new Set<(toasts: any[]) => void>();
let toasts: any[] = [];

export const toast = {
  show: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${++toastId}`;
    const newToast = { id, message, type };
    toasts = [...toasts, newToast];

    toastListeners.forEach(listener => listener(toasts));

    // Auto remove after 3 seconds
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(toasts));
    }, 3000);
  },

  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  warning: (message: string) => toast.show(message, 'warning'),
  info: (message: string) => toast.show(message, 'info'),

  subscribe: (listener: (toasts: any[]) => void) => {
    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  },
};