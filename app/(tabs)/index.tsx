import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDishes } from '@/hooks/use-dishes';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { userEmail, signOut, isConfigured } = useAuth();
  const { dishes, isLoading } = useDishes();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-16 pb-12">
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="rounded-3xl border bg-white p-6 shadow-lg"
          style={{
            borderColor: colors.border,
            shadowColor: colors.shadow,
          }}
        >
          <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Inicio
          </Text>
          <Text
            className="mt-3 text-4xl font-black leading-tight"
            style={{ color: '#1A1A1A' }}
          >
            ¡Bienvenido!
          </Text>
          <Text
            className="mt-4 text-base leading-7"
            style={{ color: '#006491' }}
          >
            {userEmail
              ? `Sesión activa como ${userEmail}.`
              : 'Tu sesión está activa y el acceso se mantiene con Supabase.'}
          </Text>

          {!isConfigured ? (
            <View
              className="mt-5 rounded-2xl p-4 flex-row items-start gap-3"
              style={{ backgroundColor: colors.warning + '20' }}
            >
              <IconSymbol name="alert" size={20} color={colors.warning} />
              <Text
                className="text-sm leading-6 flex-1"
                style={{ color: colors.warning }}
              >
                Falta configurar Supabase en las variables de entorno.
              </Text>
            </View>
          ) : null}

          <Animated.View
            entering={FadeInDown.duration(450).delay(120)}
            className="mt-6 flex-row gap-3"
          >
            <Pressable
              onPress={async () => {
                await signOut();
              }}
              className="flex-1 items-center rounded-2xl px-4 py-4 active:opacity-80 shadow-md"
              style={{
                backgroundColor: colors.error,
                shadowColor: colors.shadow,
              }}
            >
              <Text className="text-base font-extrabold text-black">Cerrar sesión</Text>
            </Pressable>

            <Link href="/dishes/list" asChild>
              <Pressable
                className="flex-1 items-center rounded-2xl border px-4 py-4 active:opacity-90 shadow-md"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                  shadowColor: colors.shadow,
                }}
              >
                <Text className="text-base font-bold text-black">Mis Platos</Text>
              </Pressable>
            </Link>
          </Animated.View>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          className="mt-8 rounded-3xl p-6 shadow-lg"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: colors.shadow,
          }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <IconSymbol name="bar chart" size={20} color="#1A1A1A" />
            <Text
              className="text-lg font-bold"
              style={{ color: '#1A1A1A' }}
            >
              Estadísticas
            </Text>
          </View>
          <View className="mt-4 flex-row gap-4">
            <View className="flex-1 items-center rounded-2xl py-4" style={{ backgroundColor: colors.gray50 }}>
              <Text className="text-2xl font-black" style={{ color: '#000000' }}>
                {isLoading ? '...' : dishes.length}
              </Text>
              <Text className="text-sm" style={{ color: '#006491' }}>
                Platos registrados
              </Text>
            </View>
            <View className="flex-1 items-center rounded-2xl py-4" style={{ backgroundColor: colors.gray50 }}>
              <Text className="text-2xl font-black" style={{ color: '#000000' }}>
                {isLoading ? '...' : dishes.filter(d => d.latitude && d.longitude).length}
              </Text>
              <Text className="text-sm" style={{ color: '#006491' }}>
                Con ubicación
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          className="mt-8"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <IconSymbol name="zap.fill" size={20} color="#1A1A1A" />
            <Text
              className="text-lg font-bold"
              style={{ color: '#1A1A1A' }}
            >
              Acciones rápidas
            </Text>
          </View>
          <View className="gap-3">
            <Link href="/dishes/register" asChild>
              <Pressable
                className="rounded-2xl p-4 shadow-md active:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.shadow,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="plus.circle.fill" size={24} color="black" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-black">Registrar nuevo plato</Text>
                    <Text className="text-sm text-black/80">Agrega un plato con foto y ubicación</Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
