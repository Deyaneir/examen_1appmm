import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';

export default function RegisterScreen() {
  return (
    <AuthShell
      eyebrow="Crear cuenta"
      title="Registro de acceso"
      description="Crea tu usuario con email, contraseña y confirmación. Si la cuenta inicia sesión de inmediato, el sistema te lleva al home automáticamente.">
      <AuthForm mode="register" />

      <View className="mt-5 flex-row items-center justify-center gap-2">
        <Text className="text-sm text-[#006491]">¿Ya tienes cuenta?</Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text className="text-sm font-bold text-[#006491]">Iniciar sesión</Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}
