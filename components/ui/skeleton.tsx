import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const widthValue = typeof width === 'string' ? width : width;
  const heightValue = typeof height === 'string' ? height : height;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className={`bg-gray-200 ${className}`}
      style={{
        width: widthValue,
        height: heightValue,
        borderRadius,
        backgroundColor: colors.gray200,
      } as any}
    />
  );
}

export function DishCardSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      className="overflow-hidden rounded-3xl shadow-lg"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: colors.shadow,
      }}
    >
      <View className="flex-row items-center gap-4 p-4">
        <Skeleton width={80} height={80} borderRadius={16} />
        <View className="flex-1 gap-2">
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} />
          <View className="flex-row items-center justify-between mt-3">
            <Skeleton width={60} height={12} />
            <Skeleton width={80} height={16} borderRadius={20} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function DishDetailSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View className="px-6 pt-12 pb-10 gap-6">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-2">
          <Skeleton width={60} height={12} />
          <Skeleton width="70%" height={32} />
        </View>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      {/* Image */}
      <Skeleton width="100%" height={320} borderRadius={24} />

      {/* Info Cards */}
      <View className="gap-4">
        {/* Location Card */}
        <View
          className="rounded-3xl p-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <Skeleton width={24} height={24} />
            <Skeleton width={100} height={20} />
          </View>
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </View>

        {/* Description Card */}
        <View
          className="rounded-3xl p-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <Skeleton width={24} height={24} />
            <Skeleton width={120} height={20} />
          </View>
          <Skeleton width="100%" height={16} className="mb-1" />
          <Skeleton width="80%" height={16} />
        </View>

        {/* Category & Price */}
        <View className="flex-row gap-4">
          <View
            className="flex-1 rounded-3xl p-6"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <Skeleton width={24} height={24} />
              <Skeleton width={80} height={20} />
            </View>
            <Skeleton width="50%" height={16} />
          </View>
          <View
            className="flex-1 rounded-3xl p-6"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <Skeleton width={24} height={24} />
              <Skeleton width={60} height={20} />
            </View>
            <Skeleton width="40%" height={20} />
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Skeleton width="100%" height={56} borderRadius={16} />
          <Skeleton width="100%" height={56} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}