import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';

export default function LoginScreen() {
  return (
    <AuthShell
      eyebrow="Supabase Authentication"
      title="Bienvenido de vuelta"
      description="Inicia sesión para entrar al home. La experiencia usa componentes reutilizables, animaciones suaves y estilos utilitarios con Uniwind.">
      <AuthForm mode="login" />

      <View className="mt-5 flex-row items-center justify-center gap-2">
        <Text className="text-sm text-[#006491]">¿Todavía no tienes cuenta?</Text>
        <Link href="/register" asChild>
          <Pressable>
            <Text className="text-sm font-bold text-[#006491]">Crear cuenta</Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}
