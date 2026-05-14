import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';

import { uploadDishImageToSupabase } from '@/lib/dish-image-storage';
import { CreateDishInput, Dish } from '@/types/dish';

const STORAGE_KEY = 'examen_1_dishes';
const DEFAULT_USER_ID = 'local-user'; // Default user_id for local AsyncStorage

let dishesCache: Dish[] | null = null;
let hydrationPromise: Promise<Dish[]> | null = null;
const listeners = new Set<(dishes: Dish[]) => void>();

const seedDishes: Dish[] = [
  {
    id: 'seed-1',
    user_id: DEFAULT_USER_ID,
    name: 'Hamburguesa clásica',
    photo_uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    city: 'Bogotá',
    country: 'Colombia',
    latitude: 4.7110,
    longitude: -74.0055,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-2',
    user_id: DEFAULT_USER_ID,
    name: 'Ensalada tropical',
    photo_uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    city: 'Medellín',
    country: 'Colombia',
    latitude: 6.2442,
    longitude: -75.5812,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

async function readStoredDishes() {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedDishes));
    return seedDishes;
  }

  try {
    const parsed = JSON.parse(storedValue) as Dish[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedDishes));
    return seedDishes;
  }
}

async function getStoredDishes() {
  if (dishesCache) {
    return dishesCache;
  }

  if (!hydrationPromise) {
    hydrationPromise = readStoredDishes()
      .then((storedDishes) => {
        dishesCache = storedDishes;
        return storedDishes;
      })
      .finally(() => {
        hydrationPromise = null;
      });
  }

  return hydrationPromise;
}

function isRemoteImageUri(photoUri: string | null) {
  return Boolean(photoUri && /^https?:\/\//i.test(photoUri));
}

async function migrateLegacyDishImages(dishes: Dish[]) {
  let shouldPersist = false;

  const migratedDishes = await Promise.all(
    dishes.map(async (dish) => {
      if (isRemoteImageUri(dish.photo_uri) || !dish.photo_uri) {
        return dish;
      }

      const localFile = new File(dish.photo_uri);

      if (!localFile.exists) {
        console.warn('[useDishes] Legacy image file no longer exists:', dish.photo_uri);
        shouldPersist = true;

        return {
          ...dish,
          photo_uri: null,
        };
      }

      try {
        console.log('[useDishes] Migrating legacy image for dish:', dish.id, dish.photo_uri);
        const publicUrl = await uploadDishImageToSupabase(dish.photo_uri);
        shouldPersist = true;

        return {
          ...dish,
          photo_uri: publicUrl,
        };
      } catch (error) {
        console.error('[useDishes] Failed to migrate legacy image:', dish.id, error);
        shouldPersist = true;

        return {
          ...dish,
          photo_uri: null,
        };
      }
    }),
  );

  if (shouldPersist) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migratedDishes));
  }

  return migratedDishes;
}

function publishDishes(nextDishes: Dish[]) {
  dishesCache = nextDishes;
  listeners.forEach((listener) => listener(nextDishes));
}

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>(dishesCache ?? []);
  const [isLoading, setIsLoading] = useState(dishesCache === null);

  const loadDishes = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedDishes = await getStoredDishes();
      const normalizedDishes = await migrateLegacyDishImages(storedDishes);
      setDishes(normalizedDishes);
      publishDishes(normalizedDishes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDishes();
  }, [loadDishes]);

  useEffect(() => {
    listeners.add(setDishes);

    return () => {
      listeners.delete(setDishes);
    };
  }, []);

  const saveDishes = useCallback(async (nextDishes: Dish[]) => {
    publishDishes(nextDishes);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextDishes));
  }, []);

  const removeDish = useCallback(
    async (dishId: string) => {
      const currentDishes = await getStoredDishes();
      const nextDishes = currentDishes.filter((dish) => dish.id !== dishId);
      await saveDishes(nextDishes);
    },
    [saveDishes],
  );

  const addDish = useCallback(
    async (input: CreateDishInput) => {
      const nextDish: Dish = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: DEFAULT_USER_ID,
        ...input,
        created_at: new Date().toISOString(),
      };

      const currentDishes = await getStoredDishes();
      const nextDishes = [nextDish, ...currentDishes];

      await saveDishes(nextDishes);
    },
    [saveDishes],
  );

  return {
    dishes,
    isLoading,
    loadDishes,
    addDish,
    removeDish,
  };
}
