import { DishList } from '@/components/dishes/dish-list';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DishCardSkeleton } from '@/components/ui/skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDishes } from '@/hooks/use-dishes';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ListDishesScreen() {
  const router = useRouter();
  const { dishes, isLoading, removeDish } = useDishes();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDeleteDish = (dishId: string) => {
    Alert.alert('Eliminar plato', 'Este plato se borrará de tu lista local.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeDish(dishId);
          Alert.alert('Éxito', 'Plato eliminado exitosamente');
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-12 pb-8">
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="flex-row items-center justify-between mb-6"
        >
          <View className="flex-1">
            <Text
              className="text-xs font-semibold uppercase tracking-[0.4em]"
              style={{ color: colors.primary }}
            >
              Platos
            </Text>
            <Text
              className="mt-2 text-3xl font-black leading-tight"
              style={{ color: '#1A1A1A' }}
            >
              Mis Platos
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full p-3 active:opacity-80"
            style={{ backgroundColor: colors.gray200 }}
          >
            <IconSymbol name="close" size={20} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="rounded-3xl p-6 shadow-lg mb-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            shadowColor: colors.shadow,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: '#006491' }}
              >
                Total registrado
              </Text>
              <Text
                className="mt-1 text-3xl font-black"
                style={{ color: colors.text }}
              >
                {isLoading ? '...' : dishes.length}
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: '#006491' }}
              >
                {dishes.filter(d => d.latitude && d.longitude).length} con ubicación
              </Text>
            </View>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <IconSymbol name="fork.knife" size={32} color="#006491" />
            </View>
          </View>
        </Animated.View>

        

        {/* List */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          {isLoading ? (
            <View className="gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(index * 100).duration(500)}
                >
                  <DishCardSkeleton />
                </Animated.View>
              ))}
            </View>
          ) : (
            <DishList dishes={dishes} onDeleteDish={handleDeleteDish} />
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
}
