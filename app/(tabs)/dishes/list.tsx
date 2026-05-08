import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { DishList } from '@/components/dishes/dish-list';
import { useDishes } from '@/hooks/use-dishes';

export default function ListDishesScreen() {
  const router = useRouter();
  const { dishes, isLoading, removeDish } = useDishes();

  const handleDeleteDish = (dishId: string) => {
    Alert.alert('Eliminar plato', 'Este plato se borrará de tu lista local.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void removeDish(dishId);
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pt-12">
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(500)} className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-[#006491]">
              Platos
            </Text>
            <Text className="mt-2 text-3xl font-black leading-tight text-[#1A1A1A]">
              Mis Platos
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-gray-200 p-3 active:bg-gray-300"
          >
            <Text className="text-xl text-[#1A1A1A]">✕</Text>
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.duration(500).delay(100)} className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-gray-600">Total registrado</Text>
              <Text className="mt-1 text-3xl font-black text-[#1A1A1A]">
                {isLoading ? <ActivityIndicator color="#006491" /> : dishes.length}
              </Text>
            </View>
            <View className="rounded-full bg-[#006491]/10 p-4">
              <Text className="text-3xl">📋</Text>
            </View>
          </View>
        </Animated.View>

        {/* List */}
        <Animated.View entering={FadeInUp.duration(500).delay(150)} className="pb-8">
          {isLoading ? (
            <View className="mt-8 items-center justify-center py-12">
              <ActivityIndicator color="#006491" size="large" />
              <Text className="mt-3 text-gray-600">Cargando platos...</Text>
            </View>
          ) : dishes.length > 0 ? (
            <DishList dishes={dishes} onDeleteDish={handleDeleteDish} />
          ) : (
            <View className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12">
              <Text className="text-center text-lg font-semibold text-gray-600">
                📭 Todavía no hay platos registrados
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-500">
                Ve a &quot;Registrar Plato&quot; para agregar tu primer plato
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
}
