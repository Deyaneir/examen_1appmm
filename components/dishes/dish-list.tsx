import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dish } from '@/types/dish';

type DishListProps = {
  dishes: Dish[];
  onDeleteDish?: (dishId: string) => void | Promise<void>;
};

export function DishList({
  dishes,
  onDeleteDish,
}: DishListProps) {
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set()
  );

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleImageError = (
    dishId: string,
    error?: any
  ) => {
    console.log('❌ Error cargando imagen:', dishId);
    console.log(error);

    setFailedImages((prev) => {
      const updated = new Set(prev);
      updated.add(dishId);
      return updated;
    });
  };

  if (dishes.length === 0) {
    return (
      <Animated.View
        entering={FadeInUp.duration(500)}
        className="items-center justify-center py-16"
      >
        <View className="rounded-full bg-[#006491]/10 p-6 mb-4">
          <IconSymbol name="fork.knife" size={48} color="#006491" />
        </View>

        <Text
          className="mb-2 text-center text-lg font-bold"
          style={{ color: '#1A1A1A' }}
        >
          No hay platos registrados
        </Text>

        <Text
          className="text-center text-sm"
          style={{ color: '#006491' }}
        >
          ¡Registra tu primer plato para comenzar!
        </Text>
      </Animated.View>
    );
  }

  return (
    <View className="gap-4">
      {dishes.map((dish, index) => {
        const hasLocation =
          dish.latitude !== null &&
          dish.longitude !== null;

        const hasFailed = failedImages.has(dish.id);

        // DEBUG
        console.log('🍽️ Dish:', dish.name);
        console.log('📸 URI:', dish.photo_uri);

        return (
          <Animated.View
            key={dish.id}
            entering={FadeInUp.delay(index * 100).duration(500)}
            className="overflow-hidden rounded-3xl shadow-lg"
            style={{
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <Pressable
              className="active:opacity-95"
              onPress={() =>
                router.push({
                  pathname: '/dishes/[id]',
                  params: { id: dish.id },
                })
              }
            >
              <View className="flex-row items-center gap-4 p-4">

                {/* IMAGEN */}
                <View
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
                  style={{
                    backgroundColor: colors.gray100,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                >
                  {dish.photo_uri && !hasFailed ? (
                    <Image
                      source={{ uri: dish.photo_uri }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                      onLoad={() => {
                        console.log(
                          '✅ Imagen cargada:',
                          dish.photo_uri
                        );
                      }}
                      onError={(error) => {
                        console.log(
                          '❌ ERROR RN IMAGE:',
                          error.nativeEvent
                        );

                        handleImageError(
                          dish.id,
                          error.nativeEvent
                        );
                      }}
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-gray-100">
                      <IconSymbol name="fork.knife" size={24} color="#006491" />
                    </View>
                  )}
                </View>

                {/* CONTENIDO */}
                <View className="flex-1">
                  <View className="flex-row items-start gap-3">
                    <View className="flex-1">

                      {/* NOMBRE */}
                      <Text
                        className="text-lg font-bold leading-tight"
                        style={{ color: '#000000' }}
                        numberOfLines={1}
                      >
                        {dish.name}
                      </Text>

                      {/* UBICACIÓN */}
                      <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol name="location.fill" size={14} color="#006491" />
                        <Text
                          className="text-sm leading-5"
                          style={{ color: '#006491' }}
                          numberOfLines={2}
                        >
                          {hasLocation
                            ? dish.city
                              ? `${dish.city}${
                                  dish.country
                                    ? ', ' + dish.country
                                    : ''
                                }`
                              : 'Ubicación registrada'
                            : 'Sin ubicación registrada'}
                        </Text>
                      </View>

                      {/* DESCRIPCIÓN */}
                      {dish.description && (
                        <Text
                          className="mt-2 text-xs"
                          style={{ color: '#006491' }}
                          numberOfLines={1}
                        >
                          {dish.description}
                        </Text>
                      )}
                    </View>

                    {/* ELIMINAR */}
                    {onDeleteDish ? (
                      <Pressable
                        onPress={() =>
                          onDeleteDish(dish.id)
                        }
                        className="rounded-full p-2 active:opacity-70"
                        style={{
                          backgroundColor:
                            colors.error + '20',
                        }}
                      >
                        <IconSymbol
                          name="trash.fill"
                          size={18}
                          color={colors.error}
                        />
                      </Pressable>
                    ) : null}
                  </View>

                  {/* FOOTER */}
                  <View className="mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="checkmark" size={12} color="#006491" />
                      <Text
                        className="text-xs"
                        style={{
                          color: '#006491',
                        }}
                      >
                        {new Date(
                          dish.created_at
                        ).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: colors.primary,
                        }}
                      >
                        Ver detalle
                      </Text>

                      <IconSymbol
                        name="arrow.right"
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </View>

              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}