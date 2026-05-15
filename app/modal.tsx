import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#F3F4F6] px-5">
      <Text className="text-3xl font-black text-gray-800">This is a modal</Text>
      <Link href="/" dismissTo asChild>
        <Pressable className="mt-4 rounded-2xl bg-[#006491] px-5 py-3 active:bg-[#005078]">
          <Text className="text-base font-bold text-black">Go to home screen</Text>
        </Pressable>
      </Link>
    </View>
  );
}
