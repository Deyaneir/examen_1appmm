import { IconSymbol } from '@/components/ui/icon-symbol';
import { useDishes } from '@/hooks/use-dishes';
import { uploadDishImageToSupabase } from '@/lib/dish-image-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { LocationMapPicker } from './location-map-picker';

interface NewDishCardProps {
  onSuccess?: () => void;
}

type SelectedLocation = {
  latitude: number;
  longitude: number;
  source: 'current' | 'manual';
};

export function NewDishCard({ onSuccess }: NewDishCardProps) {
  const [dishName, setDishName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);
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
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
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
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
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

  const useCurrentLocation = async () => {
    const locationPermission = await Location.requestForegroundPermissionsAsync();

    if (locationPermission.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se requiere acceso a la ubicación para usar tu posición actual');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        source: 'current',
      });
      setShowManualPicker(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
    }
  };

  const handleManualLocationSelect = (location: { latitude: number; longitude: number }) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      source: 'manual',
    });
  };

  const resolveLocationDetails = async (location: SelectedLocation) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];

        return {
          city: address.city || address.region || null,
          country: address.country || null,
        };
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }

    return {
      city: null,
      country: null,
    };
  };

  const handleSaveDish = async () => {
    if (!dishName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del plato');
      return;
    }

    if (dishName.trim().length > 10) {
      Alert.alert('Error', 'El nombre debe tener máximo 10 caracteres');
      return;
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(dishName.trim())) {
      Alert.alert('Error', 'El nombre del plato solo debe contener letras');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Por favor captura una foto del plato');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Selecciona tu ubicación actual o marca un punto en el mapa');
      return;
    }

    setLoading(true);
    try {
      const photoUri = await uploadDishImageToSupabase(imageUri, imageBase64);

      const locationData = await resolveLocationDetails(selectedLocation);

      // Create dish object with new field names
      const newDish = {
        name: dishName.trim(),
        photo_uri: photoUri,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        city: locationData.city,
        country: locationData.country,
      };

      // Add dish to list
      await addDish(newDish);

      // Clear form
      setDishName('');
      setImageUri(null);
      setImageBase64(null);
      setSelectedLocation(null);
      setShowManualPicker(false);
      Alert.alert('Éxito', 'Registro exitoso');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving dish:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar el plato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="mx-4 mb-6 rounded-3xl border border-gray-200 p-6 bg-white shadow-lg shadow-gray-200/50">
      {/* Header */}
      <View className="mb-4 flex-row items-center gap-2">
        <IconSymbol name="fork.knife" size={24} color="#006491" />
        <ThemedText type="subtitle" className="font-semibold text-gray-800">
          Nuevo Plato
        </ThemedText>
      </View>

      {/* Dish Name Input */}
      <TextInput
        placeholder="Nombre del plato (máx 10 caracteres)..."
        value={dishName}
        onChangeText={setDishName}
        editable={!loading}
        maxLength={10}
        className="mb-4 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-800"
        placeholderTextColor="#999"
      />

      {/* Image Preview or Buttons */}
      {imageUri ? (
        <View className="mb-4 rounded-2xl overflow-hidden">
          <View className="relative">
            <Animated.View entering={ZoomIn.duration(300)}>
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 256, backgroundColor: '#E5E7EB' }}
                resizeMode="cover"
                onError={(error) => console.warn('[Image Preview] error cargando preview local', error.nativeEvent)}
              />
            </Animated.View>
            <View className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent py-3 px-3">
              <ThemedText className="text-lg font-semibold text-black">
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
            <View className="flex-row items-center justify-center gap-2">
              <IconSymbol name="camera.fill" size={18} color="black" />
              <ThemedText className="text-center font-semibold text-black">
                Cámara
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            onPress={() => pickImage('gallery')}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#006491] px-4 py-3 active:bg-[#006491]/80 disabled:opacity-50"
          >
            <View className="flex-row items-center justify-center gap-2">
              <IconSymbol name="photo.fill" size={18} color="black" />
              <ThemedText className="text-center font-semibold text-black">
                Galería
              </ThemedText>
            </View>
          </Pressable>
        </View>
      )}

      <View className="mb-4 rounded-2xl border border-gray-200 bg-gray-100 p-4">
        <Text className="mb-2 text-sm font-semibold text-gray-700">Ubicación del plato</Text>
        <Text className="mb-4 text-sm leading-6 text-[#006491]">
          Puedes usar tu ubicación actual o seleccionar manualmente un punto sobre el mapa.
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={useCurrentLocation}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#006491] px-4 py-3 active:bg-[#005078] disabled:opacity-50"
          >
            <Text className="text-center font-bold text-black">Usar ubicación actual</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowManualPicker((current) => !current)}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#006491] px-4 py-3 active:bg-[#005078] disabled:opacity-50"
          >
            <Text className="text-center font-bold text-black">
              {showManualPicker ? 'Ocultar mapa' : 'Elegir en mapa'}
            </Text>
          </Pressable>
        </View>

        {selectedLocation ? (
          <View className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
            <Text className="text-sm font-semibold text-green-700">
              {selectedLocation.source === 'current' ? 'Ubicación actual' : 'Ubicación manual'}
            </Text>
            <Text className="mt-1 text-sm text-green-600">
              {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <Text className="mt-4 text-sm text-[#006491]">Todavía no has seleccionado una ubicación.</Text>
        )}

        {showManualPicker ? (
          <View className="mt-4">
            <LocationMapPicker
              latitude={selectedLocation?.latitude ?? null}
              longitude={selectedLocation?.longitude ?? null}
              onSelectLocation={handleManualLocationSelect}
            />
            <Text className="mt-3 text-xs leading-5 text-[#006491]">
              Toca el punto que quieres guardar. El marcador se moverá al lugar exacto.
            </Text>
          </View>
        ) : null}
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSaveDish}
        disabled={loading || !dishName.trim() || !imageUri || !selectedLocation}
        className={`rounded-2xl px-4 py-3 ${
          loading || !dishName.trim() || !imageUri || !selectedLocation
            ? 'bg-gray-300'
            : 'bg-[#E31837] active:bg-[#c41530]'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <ThemedText className="text-center font-semibold text-black">
            ✓ Guardar Plato
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}
