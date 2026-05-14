import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useDishes } from '@/hooks/use-dishes';

export default function DishDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { dishes } = useDishes();

  const dishId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dish = dishes.find((item) => item.id === dishId);

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-xl font-black text-[#1A1A1A]">No se encontró el plato</Text>
        <Text className="mt-2 text-center text-gray-500">
          El registro puede haber sido eliminado o la ruta no es válida.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-2xl bg-[#006491] px-5 py-3"
        >
          <Text className="font-bold text-white">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const hasLocation = dish.latitude !== null && dish.longitude !== null;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pt-12 pb-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-[#006491]">
              Detalle
            </Text>
            <Text className="mt-2 text-3xl font-black leading-tight text-[#1A1A1A]">
              {dish.name}
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-gray-200 p-3 active:bg-gray-300"
          >
            <Text className="text-xl text-[#1A1A1A]">✕</Text>
          </Pressable>
        </View>

        <View className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <View className="h-72 bg-gray-100">
            {dish.photo_uri ? (
              <Image source={{ uri: dish.photo_uri }} className="h-full w-full" contentFit="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-100">
                <Text className="text-5xl">🍽️</Text>
              </View>
            )}
          </View>

          <View className="p-5">
            <Text className="text-lg font-black text-[#1A1A1A]">Información del plato</Text>

            <View className="mt-4 gap-3">
              <View className="rounded-2xl bg-gray-50 px-4 py-3">
                <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Ubicación
                </Text>
                <Text className="mt-1 text-base font-semibold text-gray-800">
                  {hasLocation
                    ? dish.city
                      ? `${dish.city}${dish.country ? ', ' + dish.country : ''}`
                      : 'Ubicación registrada'
                    : 'Sin ubicación registrada'}
                </Text>
              </View>

              {dish.description ? (
                <View className="rounded-2xl bg-gray-50 px-4 py-3">
                  <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                    Descripción
                  </Text>
                  <Text className="mt-1 text-base text-gray-800">{dish.description}</Text>
                </View>
              ) : null}

              {dish.category || dish.price !== undefined ? (
                <View className="flex-row gap-3">
                  {dish.category ? (
                    <View className="flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                      <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                        Categoría
                      </Text>
                      <Text className="mt-1 text-base font-semibold text-gray-800">{dish.category}</Text>
                    </View>
                  ) : null}

                  {dish.price !== undefined ? (
                    <View className="flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                      <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                        Precio
                      </Text>
                      <Text className="mt-1 text-base font-semibold text-gray-800">
                        ${dish.price.toFixed(2)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {hasLocation ? (
                <View className="rounded-2xl bg-gray-50 px-4 py-3">
                  <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                    Coordenadas
                  </Text>
                  <Text className="mt-1 text-base font-semibold text-gray-800">
                    {dish.latitude?.toFixed(6)}, {dish.longitude?.toFixed(6)}
                  </Text>
                </View>
              ) : null}
            </View>

            {hasLocation ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/map',
                    params: {
                      latitude: dish.latitude?.toString(),
                      longitude: dish.longitude?.toString(),
                      name: dish.name,
                    },
                  })
                }
                className="mt-6 rounded-2xl bg-[#E31837] px-5 py-4 active:bg-[#E31837]/80"
              >
                <Text className="text-center text-base font-extrabold text-white">Ver ubicación</Text>
              </Pressable>
            ) : (
              <View className="mt-6 rounded-2xl border border-dashed border-gray-300 px-5 py-4">
                <Text className="text-center text-sm text-gray-500">
                  Este plato no tiene coordenadas guardadas.
                </Text>
              </View>
            )}

            <Text className="mt-6 text-xs text-gray-400">
              Registrado el{' '}
              {new Date(dish.created_at).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}{' '}
              a las{' '}
              {new Date(dish.created_at).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}