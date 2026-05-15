import '../global.css';

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/providers/auth-provider';

export const unstable_settings = {
  anchor: '(auth)',
};

LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Unable to deactivate keep awake',
]);

function AuthGate() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [isLoading, router, segments, session]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AuthGate />
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
