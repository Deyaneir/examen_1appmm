import { PropsWithChildren, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemedView className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <Pressable className="flex-row items-center gap-2" onPress={() => setIsOpen((value) => !value)}>
        <Text className="text-lg font-bold text-slate-500">{isOpen ? '⌄' : '›'}</Text>

        <ThemedText type="defaultSemiBold" className="text-slate-900 dark:text-white">
          {title}
        </ThemedText>
      </Pressable>
      {isOpen ? <View className="mt-3 ml-6">{children}</View> : null}
    </ThemedView>
  );
}
