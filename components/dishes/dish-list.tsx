import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Dish } from '@/types/dish';

type DishListProps = {
  dishes: Dish[];
  onDeleteDish?: (dishId: string) => void | Promise<void>;
};

export function DishList({ dishes, onDeleteDish }: DishListProps) {
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

  const handleImageError = (dishId: string) => {
    setFailedImages((prev) => new Set([...prev, dishId]));
  };

  return (
    <View className="mt-5 gap-4">
      {dishes.map((dish, index) => {
        const hasLocation = dish.latitude !== null && dish.longitude !== null;
        const hasFailed = failedImages.has(dish.id);

        return (
          <Animated.View
            key={dish.id}
            entering={FadeInUp.delay(index * 100).duration(500)}
            className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
          >
            <View className="flex-row items-center gap-4 p-4">
              <View className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200 shadow-md">
                {dish.photo_uri && !hasFailed ? (
                  <Image
                    source={{ uri: dish.photo_uri }}
                    className="h-full w-full"
                    contentFit="cover"
                    transition={150}
                    onError={() => handleImageError(dish.id)}
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-gray-200">
                    <Text className="text-3xl">🍽️</Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="text-xl font-black text-[#1A1A1A]" numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-gray-600" numberOfLines={3}>
                      {hasLocation
                        ? dish.city
                          ? `${dish.city}${dish.country ? ', ' + dish.country : ''}`
                          : 'Ubicación registrada'
                        : 'Sin ubicación registrada'}
                    </Text>
                  </View>

                  {onDeleteDish ? (
                    <Pressable
                      onPress={() => onDeleteDish(dish.id)}
                      className="rounded-full bg-[#E31837]/15 px-3 py-2 active:bg-[#E31837]/25"
                    >
                      <Text className="text-sm font-bold text-[#E31837]">Eliminar</Text>
                    </Pressable>
                  ) : null}
                </View>

                {hasLocation && (
  <>
    <Text className="mt-3 text-xs text-gray-500" numberOfLines={1}>
      📍 {dish.latitude?.toFixed(4)}, {dish.longitude?.toFixed(4)}
    </Text>
  </>
)}

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/dishes/[id]',
                      params: { id: dish.id },
                    })
                  }
                  className="mt-3 rounded-xl bg-cyan-500 px-4 py-3"
                >
                  <Text className="text-center font-bold text-white">Ver detalle</Text>
                </Pressable>

                <View className="mt-3 flex-row items-center justify-between border-t border-gray-200 pt-3">
                  <Text className="text-xs text-gray-500">
                    📅{' '}
                    {new Date(dish.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(dish.created_at).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
