import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useDishes } from '@/hooks/use-dishes';

export default function DishDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { dishes } = useDishes();
  const { currentLocation, getDistanceTo } = useCurrentLocation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const dishId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dish = dishes.find((item) => item.id === dishId);

  if (!dish) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="items-center"
        >
          <IconSymbol name="info.circle" size={80} color="#006491" />
          <Text
            className="text-xl font-bold text-center mb-2 mt-4"
            style={{ color: '#000000' }}
          >
            Plato no encontrado
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-2xl px-6 py-3 shadow-md active:opacity-90"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.shadow,
            }}
          >
            <Text className="font-bold text-black">Volver</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  const hasLocation = dish.latitude !== null && dish.longitude !== null;
  const distanceInfo = hasLocation && currentLocation
    ? getDistanceTo(dish.latitude!, dish.longitude!)
    : null;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View className="pb-10">
        {/* Hero Image - Domino's Style */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="relative h-96 overflow-hidden"
        >
          {dish.photo_uri ? (
            <Image
              source={{ uri: dish.photo_uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={(error) => {
                console.warn('[Dish Detail] error cargando imagen:', error.nativeEvent);
              }}
            />
          ) : (
            <View
              className="h-full w-full items-center justify-center"
              style={{ backgroundColor: colors.gray200 }}
            >
              <IconSymbol name="fork.knife" size={80} color="#006491" />
            </View>
          )}

          {/* Back Button - Overlay */}
          <Pressable
            onPress={() => router.push('/dishes/list')}
            className="absolute top-6 left-6 rounded-full p-3 z-50"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <IconSymbol name="close" size={24} color="#1A1A1A" />
          </Pressable>
        </Animated.View>

        {/* Content */}
        <View className="px-6 pt-8">
          {/* Title & Category */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="mb-6"
          >
            <Text
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: colors.primary }}
            >
              Plato Especial
            </Text>
            <Text
              className="text-4xl font-black leading-tight"
              style={{ color: '#1A1A1A' }}
            >
              {dish.name}
            </Text>
            {dish.category && (
              <Text
                className="text-sm mt-2 font-semibold"
                style={{ color: '#006491' }}
              >
                {dish.category}
              </Text>
            )}
          </Animated.View>

          {/* Info Grid - Domino's Style */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(150)}
            className="flex-row gap-3 mb-6"
          >
            {distanceInfo && (
              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                  borderWidth: 2,
                }}
              >
                <Text
                  className="text-xs font-bold uppercase"
                  style={{ color: colors.primary }}
                >
                  Distancia
                </Text>
                <Text
                  className="text-2xl font-black mt-1"
                  style={{ color: '#1A1A1A' }}
                >
                  {distanceInfo.distance} km
                </Text>
                <View className="flex-row items-center gap-1 mt-2">
                  <IconSymbol name="info.circle" size={14} color="#006491" />
                  <Text className="text-xs" style={{ color: '#006491' }}>
                    {distanceInfo.timeFormatted}
                  </Text>
                </View>
              </View>
            )}

            {dish.price !== undefined && (
              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.success,
                  borderWidth: 2,
                }}
              >
                <Text
                  className="text-xs font-bold uppercase"
                  style={{ color: colors.success }}
                >
                  Precio
                </Text>
                <Text
                  className="text-2xl font-black mt-1"
                  style={{ color: colors.success }}
                >
                  ${dish.price.toFixed(2)}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Description */}
          {dish.description && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="mb-6 rounded-2xl p-4"
              style={{ backgroundColor: colors.gray50 }}
            >
              <Text className="text-sm" style={{ color: '#000000' }}>
                {dish.description}
              </Text>
            </Animated.View>
          )}

          {/* Location Card */}
          {hasLocation && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(250)}
              className="mb-6 rounded-2xl p-4 border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            >
<View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="location.fill" size={20} color="#E31837" />
                <Text
                  className="text-sm font-bold uppercase"
                  style={{ color: '#000000' }}
                >
                  Ubicación
                </Text>
              </View>
              <Text className="text-sm ml-6" style={{ color: '#1A1A1A' }}>
                {dish.city}
                {dish.country ? `, ${dish.country}` : ''}
              </Text>
              <View className="flex-row items-center gap-1 mt-2 ml-6">
                <IconSymbol name="checkmark" size={12} color="#1A1A1A" />
                <Text
                  className="text-xs"
                  style={{ color: '#1A1A1A' }}
                >
                  {dish.latitude?.toFixed(4)}, {dish.longitude?.toFixed(4)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            className="gap-3 mb-8"
          >
            {hasLocation && (
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
                className="rounded-2xl p-4 shadow-lg active:opacity-90"
                style={{
                  backgroundColor: colors.secondary,
                  shadowColor: colors.shadow,
                }}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <IconSymbol name="map.fill" size={20} color="black" />
                  <Text className="text-base font-bold text-black">
                    Ver en Mapa
                  </Text>
                </View>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.back()}
              className="rounded-2xl p-4 shadow-md active:opacity-90"
              style={{
                backgroundColor: '#006491',
                shadowColor: colors.shadow,
              }}
            >
              <Text
                className="text-base font-bold text-center"
                style={{ color: '#000000' }}
              >
                ← Volver a la lista
              </Text>
            </Pressable>
          </Animated.View>

          {/* Timestamp */}
          <View className="items-center pb-6">
            <Text
              className="text-xs"
              style={{ color: '#006491' }}
            >
              Registrado{' '}
              {new Date(dish.created_at).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}