import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-16 pb-10">
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="rounded-3xl border p-6 shadow-lg mb-8"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          }}
        >
          <Text
            className="text-xs font-semibold uppercase tracking-[0.4em]"
            style={{ color: colors.primary }}
          >
            Explorar
          </Text>
          <Text
            className="mt-3 text-3xl font-black leading-tight"
            style={{ color: '#000000' }}
          >
            Descubre Platos
          </Text>
          <Text
            className="mt-4 text-base leading-7"
            style={{ color: '#006491' }}
          >
            Explora una variedad de platos deliciosos registrados por la comunidad.
            Encuentra inspiración culinaria y descubre nuevos sabores.
          </Text>
        </Animated.View>

        <View className="gap-4">
          <Link href="/dishes/list" asChild>
            <Animated.View entering={FadeInUp.duration(500).delay(100)}>
              <View
                className="rounded-2xl p-6 shadow-md active:opacity-90"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  shadowColor: colors.shadow,
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View className="rounded-full bg-[#006491]/10 p-3">
                    <IconSymbol name="fork.knife" size={28} color="#006491" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold" style={{ color: '#E31837' }}>Ver Todos los Platos</Text>
                    <Text className="text-sm mt-1" style={{ color: '#006491' }}>
                      Explora el catálogo completo de platos disponibles
                    </Text>
                  </View>
                  <IconSymbol name="arrow.right" size={24} color="#E31837" />
                </View>
              </View>
            </Animated.View>
          </Link>

          <Link href="/map" asChild>
            <Animated.View entering={FadeInUp.duration(500).delay(200)}>
              <View
                className="rounded-2xl p-6 shadow-md active:opacity-90"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  shadowColor: colors.shadow,
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View className="rounded-full bg-[#006491]/10 p-3">
                    <IconSymbol name="map.fill" size={28} color="#006491" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold"
                      style={{ color: '#E31837' }}
                    >
                      Explorar platos en el mapa
                    </Text>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: '#006491' }}
                    >
                      Encuentra platos cerca de ti usando el mapa interactivo
                    </Text>
                  </View>
                  <IconSymbol name="arrow.right" size={24} color="#E31837" />
                </View>
              </View>
            </Animated.View>
          </Link>

          <Link href="/dishes/register" asChild>
            <Animated.View entering={FadeInUp.duration(500).delay(300)}>
              <View
                className="rounded-2xl p-6 shadow-md active:opacity-90"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  shadowColor: colors.shadow,
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View className="rounded-full bg-[#006491]/10 p-3">
                    <IconSymbol name="camera.fill" size={28} color="#006491" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold" style={{ color: '#E31837' }}>Registrar Plato</Text>
                    <Text className="text-sm mt-1" style={{ color: '#006491' }}>
                      Comparte tu plato favorito con la comunidad
                    </Text>
                  </View>
                  <IconSymbol name="arrow.right" size={24} color="#E31837" />
                </View>
              </View>
            </Animated.View>
          </Link>
        </View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          className="mt-8 rounded-3xl p-6"
          style={{
            backgroundColor: colors.gray50,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text
            className="text-center text-lg font-bold mb-2"
            style={{ color: '#000000' }}
          >
            ¿Qué puedes hacer?
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <IconSymbol name="location.fill" size={20} color="#006491" />
              <Text style={{ color: '#006491' }}>
                Registra platos con ubicación GPS precisa
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="camera.fill" size={20} color="#006491" />
              <Text style={{ color: '#006491' }}>
                Sube fotos de alta calidad a Supabase Storage
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="map.fill" size={20} color="#006491" />
              <Text style={{ color: '#006491' }}>
                Explora platos en un mapa interactivo
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="checkmark" size={20} color="#006491" />
              <Text style={{ color: '#006491' }}>
                Experiencia rápida y moderna con animaciones
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
