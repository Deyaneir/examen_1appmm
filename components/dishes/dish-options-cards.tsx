import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function DishOptionsCards() {
  return (
    <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mt-8 gap-4">
      {/* Register Dish Card */}
      <Link href="/dishes/register" asChild>
        <Pressable className="active:opacity-80">
          <View className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="rounded-full bg-[#006491]/10 w-14 h-14 items-center justify-center mb-3">
                  <IconSymbol name="camera.fill" size={32} color="#006491" />
                </View>
                <Text className="text-2xl font-bold text-[#E31837]">Registrar Plato</Text>
                <Text className="mt-2 text-sm leading-5 text-[#006491]">
                  Captura una foto, ubícación y detalles del plato
                </Text>
              </View>
              <IconSymbol name="arrow.right" size={28} color="#006491" />
            </View>
            <View className="mt-4 inline-flex rounded-full bg-[#E31837]/20 px-3 py-1">
              <Text className="text-xs font-semibold text-[#E31837]">Nuevo</Text>
            </View>
          </View>
        </Pressable>
      </Link>

      {/* View Dishes Card */}
      <Link href="/dishes/list" asChild>
        <Pressable className="active:opacity-80">
          <View className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="rounded-full bg-[#006491]/10 w-14 h-14 items-center justify-center mb-3">
                  <IconSymbol name="list.bullet" size={32} color="#006491" />
                </View>
                <Text className="text-2xl font-bold text-[#E31837]">Mis Platos</Text>
                <Text className="mt-2 text-sm leading-5 text-[#006491]">
                  Visualiza todos los platos que has registrado
                </Text>
              </View>
              <IconSymbol name="arrow.right" size={28} color="#006491" />
            </View>
            <View className="mt-4 inline-flex rounded-full bg-[#006491]/20 px-3 py-1">
              <Text className="text-xs font-semibold text-[#006491]">Ver</Text>
            </View>
          </View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}
