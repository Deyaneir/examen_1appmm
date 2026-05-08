import { ReactNode, useEffect } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

function FloatingBlob({
  size,
  startX,
  startY,
  color,
}: {
  size: number;
  startX: number;
  startY: number;
  color: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 9000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, 22], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0, 1], [0, -18], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0, 1], [1, 1.08], Extrapolation.CLAMP);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: 0.7,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  const { width, height } = Dimensions.get('window');

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 bg-white" />
      <FloatingBlob size={220} startX={-60} startY={height * 0.08} color="rgba(0,100,145,0.28)" />
      <FloatingBlob size={280} startX={width * 0.55} startY={height * 0.18} color="rgba(227,24,55,0.18)" />
      <FloatingBlob size={180} startX={width * 0.15} startY={height * 0.68} color="rgba(26,26,26,0.12)" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-5 pb-10 pt-16"
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInUp.duration(500)} className="mb-8 rounded-4xl border border-gray-200 bg-gray-50 px-5 py-6 shadow-2xl shadow-gray-300">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#006491]">
              {eyebrow}
            </Text>
            <Text className="max-w-[18rem] text-4xl font-black leading-tight text-[#1A1A1A]">
              {title}
            </Text>
            <Text className="mt-4 max-w-[22rem] text-base leading-7 text-gray-600">
              {description}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(450).delay(120)} className="rounded-4xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-black/40">
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
