import type { PropsWithChildren, ReactElement } from 'react';
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundClassName: string;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundClassName,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      className="flex-1 bg-slate-950 dark:bg-slate-900"
      scrollEventThrottle={16}>
      <Animated.View className={`h-62.5 overflow-hidden ${headerBackgroundClassName}`} style={headerAnimatedStyle}>
        {headerImage}
      </Animated.View>
      <ThemedView className="flex-1 gap-4 overflow-hidden px-8 py-8">{children}</ThemedView>
    </Animated.ScrollView>
  );
}
