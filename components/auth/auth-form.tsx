import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAuth } from '@/providers/auth-provider';

type AuthMode = 'login' | 'register';

type AuthFormProps = {
  mode: AuthMode;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoComplete?: 'email' | 'password' | 'new-password';
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#1A1A1A] focus:border-[#006491]"
      />
    </View>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isRegister = mode === 'register';

  async function handleSubmit() {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Completa el correo y la contraseña.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    scale.value = withSpring(0.98, { mass: 0.2 });

    try {
      if (mode === 'login') {
        await signIn(email.trim().toLowerCase(), password);
        setInfoMessage('Sesion iniciada. Redirigiendo al inicio.');
        router.replace('/');
      } else {
        const session = await signUp(email.trim().toLowerCase(), password);

        if (session) {
          setInfoMessage('Registro completado. Redirigiendo al inicio.');
          router.replace('/');
        } else {
          setInfoMessage('Cuenta creada. Revisa tu correo para confirmar el acceso.');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la operacion.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
      scale.value = withSpring(1, { mass: 0.2 });
    }
  }

  return (
    <View>
      {!isConfigured ? (
        <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm leading-6 text-amber-800">
            Falta configurar Supabase. Agrega EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.
          </Text>
        </View>
      ) : null}

      <Field
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        autoComplete="email"
      />

      <Field
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Ingresa tu contraseña"
        secureTextEntry
        autoComplete={isRegister ? 'new-password' : 'password'}
      />

      {isRegister ? (
        <Field
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repite tu contraseña"
          secureTextEntry
          autoComplete="new-password"
        />
      ) : null}

      {errorMessage ? (
        <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-sm leading-6 text-red-800">{errorMessage}</Text>
        </View>
      ) : null}

      {infoMessage ? (
        <View className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <Text className="text-sm leading-6 text-green-800">{infoMessage}</Text>
        </View>
      ) : null}

      <Animated.View style={animatedButtonStyle}>
        <Pressable
          onPress={handleSubmit}
          onPressIn={() => {
            scale.value = withSpring(0.98, { mass: 0.2 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { mass: 0.2 });
          }}
          disabled={isSubmitting}
          className="mt-2 flex-row items-center justify-center rounded-2xl bg-[#E31837] px-5 py-4 active:bg-[#E31837]/80 disabled:opacity-70">
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-extrabold text-white">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
