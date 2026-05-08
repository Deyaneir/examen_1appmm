import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabTwoScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-5 pb-10 pt-16">
        <View className="mb-6 rounded-4xl border border-white/10 bg-white/6 p-6">
          <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-300">
            Explore
          </Text>
          <Text className="mt-3 text-4xl font-black text-white">
            Uniwind en el proyecto
          </Text>
          <Text className="mt-4 text-base leading-7 text-slate-300">
            Esta pantalla conserva el contenido de ejemplo pero ya está maquetada con utilidades de
            Uniwind.
          </Text>
        </View>

        <View className="mb-6 items-center rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <IconSymbol size={120} color="#22d3ee" name="chevron.left.forwardslash.chevron.right" />
        </View>

      <Collapsible title="File-based routing">
        <Text className="text-slate-300">
          This app has two screens: <Text className="font-semibold text-white">app/(tabs)/index.tsx</Text>{' '}
          and <Text className="font-semibold text-white">app/(tabs)/explore.tsx</Text>.
        </Text>
        <Text className="mt-3 text-slate-300">
          The layout file in <Text className="font-semibold text-white">app/(tabs)/_layout.tsx</Text>{' '}
          sets up the tab navigator.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text className="mt-3 text-base font-semibold text-cyan-300">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <Text className="text-slate-300">
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text className="font-semibold text-white">w</Text> in the terminal running this project.
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <Text className="text-slate-300">
          For static images, you can use the <Text className="font-semibold text-white">@2x</Text> and{' '}
          <Text className="font-semibold text-white">@3x</Text> suffixes to provide files for
          different screen densities.
        </Text>
        <Image
          source={require('@/assets/images/react-logo.png')}
          className="mx-auto mt-4 h-24 w-24"
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <Text className="mt-3 text-base font-semibold text-cyan-300">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <Text className="text-slate-300">
          This template has light and dark mode support. The{' '}
          <Text className="font-semibold text-white">useColorScheme()</Text> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </Text>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <Text className="mt-3 text-base font-semibold text-cyan-300">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <Text className="text-slate-300">
          This template includes an example of an animated component. The{' '}
          <Text className="font-semibold text-white">components/HelloWave.tsx</Text> component uses
          react-native-reanimated to create a waving hand animation.
        </Text>
        <Text className="mt-3 text-slate-300">
          The <Text className="font-semibold text-white">components/ParallaxScrollView.tsx</Text>{' '}
          component provides a parallax effect for the header image.
        </Text>
      </Collapsible>
      </View>
    </ScrollView>
  );
}
