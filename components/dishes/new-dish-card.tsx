import { useDishes } from '@/hooks/use-dishes';
import { getLocationData } from '@/hooks/use-location';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface NewDishCardProps {
  onSuccess?: () => void;
}

export function NewDishCard({ onSuccess }: NewDishCardProps) {
  const [dishName, setDishName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addDish } = useDishes();

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        // Request camera permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });
      } else {
        // Request gallery permissions
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaPermission.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se requiere acceso a la galería');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setImageUri(selectedAsset.uri);
        setImageBase64(selectedAsset.base64 ?? null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSaveDish = async () => {
    if (!dishName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del plato');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Por favor captura una foto del plato');
      return;
    }

    setLoading(true);
    try {
      // Save the image to the file system using base64
      const fileName = `dish_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + fileName;
      if (imageBase64) {
        await FileSystem.writeAsStringAsync(fileUri, imageBase64, { encoding: 'base64' });
      } else {
        throw new Error('Base64 data not available');
      }

      // Get location data
      const locationData = await getLocationData();

      // Create dish object with new field names
      const newDish = {
        name: dishName.trim(),
        photo_uri: fileUri,
        latitude: locationData?.latitude ?? null,
        longitude: locationData?.longitude ?? null,
        city: locationData?.city ?? null,
        country: locationData?.country ?? null,
      };

      // Add dish to list
      await addDish(newDish);

      // Clear form
      setDishName('');
      setImageUri(null);
      setImageBase64(null);
      Alert.alert('Éxito', 'Plato guardado correctamente');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving dish:', error);
      Alert.alert('Error', 'No se pudo guardar el plato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="mx-4 mb-6 rounded-3xl border border-gray-200 p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <ThemedText type="subtitle" className="mb-4 font-semibold text-gray-800 dark:text-white">
        🍽️ Nuevo Plato
      </ThemedText>

      {/* Dish Name Input */}
      <TextInput
        placeholder="Nombre del plato..."
        value={dishName}
        onChangeText={setDishName}
        editable={!loading}
        className="mb-4 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholderTextColor="#999"
      />

      {/* Image Preview or Buttons */}
      {imageUri ? (
        <View className="mb-4 rounded-2xl overflow-hidden">
          <View className="relative">
            <Animated.View entering={ZoomIn.duration(300)}>
              <Image
                source={{ uri: imageUri }}
                contentFit="cover"
                className="h-64 w-full bg-gray-200"
              />
            </Animated.View>
            <View className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent py-3 px-3">
              <ThemedText className="text-lg font-semibold text-white">
                {dishName || 'Nuevo plato'}
              </ThemedText>
            </View>
          </View>
          <View className="bg-[#E31837]/20 px-3 py-2 flex-row items-center gap-2">
            <ThemedText className="text-sm text-[#E31837]">✓ Foto capturada</ThemedText>
          </View>
        </View>
      ) : (
        <View className="mb-4 flex flex-row gap-3">
          <Pressable
            onPress={() => pickImage('camera')}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#006491] px-4 py-3 active:bg-[#006491]/80 disabled:opacity-50"
          >
            <ThemedText className="text-center font-semibold text-white">
              📷 Cámara
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => pickImage('gallery')}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#006491] px-4 py-3 active:bg-[#006491]/80 disabled:opacity-50"
          >
            <ThemedText className="text-center font-semibold text-white">
              🖼️ Galería
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Save Button */}
      <Pressable
        onPress={handleSaveDish}
        disabled={loading || !dishName.trim() || !imageUri}
        className={`rounded-2xl px-4 py-3 ${
          loading || !dishName.trim() || !imageUri
            ? 'bg-gray-300 dark:bg-gray-600'
            : 'bg-[#E31837] active:bg-[#E31837]/80'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText className="text-center font-semibold text-white">
            ✓ Guardar Plato
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}
