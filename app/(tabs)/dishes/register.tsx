import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { NewDishCard } from '@/components/dishes/new-dish-card';

export default function RegisterDishScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pt-12">
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(500)} className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-[#006491]">
              Registrar
            </Text>
            <Text className="mt-2 text-3xl font-black leading-tight text-[#1A1A1A]">
              Nuevo Plato
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-gray-200 p-3 active:bg-gray-300"
          >
            <Text className="text-xl text-[#1A1A1A]">✕</Text>
          </Pressable>
        </Animated.View>

        {/* Instruction */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="mt-6 rounded-2xl border border-[#006491]/20 bg-[#006491]/5 p-4"
        >
          <Text className="text-sm leading-6 text-[#006491]">
            📸 Captura una foto, y automáticamente se registrarán los datos de tu ubicación
            (ciudad, país, coordenadas GPS).
          </Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)} className="pb-8">
          <NewDishCard
            onSuccess={() => {
              // Navigate back to home after successful registration
              setTimeout(() => {
                router.push('/');
              }, 1500);
            }}
          />
        </Animated.View>
      </View>
    </ScrollView>
  );
}
