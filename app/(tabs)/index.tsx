import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { DishOptionsCards } from '@/components/dishes/dish-options-cards';
import { useDishes } from '@/hooks/use-dishes';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { userEmail, signOut, isConfigured } = useAuth();
  const { dishes, isLoading } = useDishes();

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-16 pb-12">
      <Animated.View entering={FadeInUp.duration(500)} className="rounded-4xl border border-gray-200 bg-gray-50 p-6">
        <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-[#006491]">
          Home
        </Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-[#1A1A1A]">
          Sesión iniciada con éxito.
        </Text>
        <Text className="mt-4 text-base leading-7 text-gray-600">
          {userEmail ? `Conectado como ${userEmail}.` : 'Tu sesión está activa y el acceso se mantiene con Supabase.'}
        </Text>

        {!isConfigured ? (
          <View className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <Text className="text-sm leading-6 text-amber-700">
              Falta configurar Supabase en las variables de entorno.
            </Text>
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(450).delay(120)} className="mt-6 flex-row gap-3">
          <Pressable
            onPress={async () => {
              await signOut();
            }}
            className="flex-1 items-center rounded-2xl bg-[#E31837] px-4 py-4 active:bg-[#E31837]/80">
            <Text className="text-base font-extrabold text-white">Cerrar sesión</Text>
          </Pressable>

          <Link href="/explore" asChild>
            <Pressable className="flex-1 items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-100">
              <Text className="text-base font-bold text-[#1A1A1A]">Explorar</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(150)} className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-400">Platos guardados</Text>
            <Text className="mt-1 text-base font-bold text-white">
              {isLoading ? 'Cargando...' : `${dishes.length} platos disponibles`}
            </Text>
          </View>
          {isLoading && <ActivityIndicator color="#22d3ee" />}
        </View>
      </Animated.View>

      {/* Dish Options Cards */}
      <DishOptionsCards />
      </View>
    </ScrollView>
  );
}
