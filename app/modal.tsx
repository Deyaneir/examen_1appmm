import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-5">
      <Text className="text-3xl font-black text-white">This is a modal</Text>
      <Link href="/" dismissTo asChild>
        <Pressable className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 active:bg-cyan-300">
          <Text className="text-base font-bold text-slate-950">Go to home screen</Text>
        </Pressable>
      </Link>
    </View>
  );
}
