import { CreateDishInput } from '@/types/dish';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type DishFormProps = {
  onSubmit: (dish: CreateDishInput) => Promise<void>;
  isSubmitting?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}) {
  return (
    <View className="mb-3">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCorrect={false}
        className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-800 focus:border-[#006491]"
      />
    </View>
  );
}

export function DishForm({ onSubmit, isSubmitting = false }: DishFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  async function handleSubmit() {
    setErrorMessage(null);

    if (!name.trim() || !description.trim() || !category.trim() || !price.trim()) {
      setErrorMessage('Completa nombre, descripción, categoría y precio.');
      return;
    }

    const parsedPrice = Number(price.replace(',', '.'));

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Ingresa un precio válido.');
      return;
    }

    const trimmedImageUrl = imageUrl.trim();

    if (trimmedImageUrl && !/^https:\/\//i.test(trimmedImageUrl)) {
      setErrorMessage('La imagen debe ser una URL HTTPS válida.');
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parsedPrice,
        photo_uri: trimmedImageUrl || null,
        city: null,
        country: null,
        latitude,
        longitude,
      });

      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setImageUrl('');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="rounded-3xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/50">
      <Text className="text-lg font-black text-gray-800">Nuevo plato</Text>
      <Text className="mt-2 text-sm leading-6 text-[#006491]">
        Los platos se guardan localmente con AsyncStorage y el último que agregues aparece primero.
      </Text>

      <View className="mt-4">
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre del plato" />
        <Field
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el plato"
        />
        <Field
          label="Categoría"
          value={category}
          onChangeText={setCategory}
          placeholder="Ej. Entradas, Postres"
        />
        <Field
          label="Precio"
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="numeric"
        />
        <Field
          label="URL de imagen"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
        />
        <Pressable onPress={getCurrentLocation} className="mt-3 rounded-2xl bg-[#006491] px-4 py-4">
          <Text className="text-center font-bold text-black">Obtener ubicación actual</Text>
        </Pressable>

        {latitude !== null && longitude !== null ? (
          <Text className="mt-2 text-sm text-green-600">
            Ubicación guardada: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        ) : null}
      </View>

      {errorMessage ? (
        <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-sm leading-6 text-red-800">{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className="items-center rounded-2xl bg-[#E31837] px-5 py-4 active:bg-[#c41530] disabled:opacity-70">
        <Text className="text-base font-extrabold text-black">
          {isSubmitting || isSaving ? 'Guardando...' : 'Agregar plato'}
        </Text>
      </Pressable>
    </View>
  );
}
