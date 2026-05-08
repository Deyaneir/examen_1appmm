import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { CreateDishInput } from '@/types/dish';

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
      <Text className="mb-2 text-sm font-semibold text-slate-200">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        keyboardType={keyboardType}
        autoCorrect={false}
        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-base text-white focus:border-cyan-400"
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parsedPrice,
        imageUrl:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
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
    <View className="rounded-3xl border border-white/10 bg-white/6 p-5">
      <Text className="text-lg font-black text-white">Nuevo plato</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-300">
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
      </View>

      {errorMessage ? (
        <View className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
          <Text className="text-sm leading-6 text-rose-100">{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className="items-center rounded-2xl bg-cyan-400 px-5 py-4 active:bg-cyan-300 disabled:opacity-70">
        <Text className="text-base font-extrabold text-slate-950">
          {isSubmitting || isSaving ? 'Guardando...' : 'Agregar plato'}
        </Text>
      </Pressable>
    </View>
  );
}
