import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { NewDishCard } from '@/components/dishes/new-dish-card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RegisterDishScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]">
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
            <IconSymbol name="close" size={24} color="#1A1A1A" />
          </Pressable>
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
