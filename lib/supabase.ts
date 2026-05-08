import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

type StorageBackend = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();
let useMemoryStorage = false;

const safeStorage: StorageBackend = {
  async getItem(key) {
    if (useMemoryStorage) {
      return memoryStorage.get(key) ?? null;
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch {
      useMemoryStorage = true;
      return memoryStorage.get(key) ?? null;
    }
  },
  async setItem(key, value) {
    if (useMemoryStorage) {
      memoryStorage.set(key, value);
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      useMemoryStorage = true;
      memoryStorage.set(key, value);
    }
  },
  async removeItem(key) {
    if (useMemoryStorage) {
      memoryStorage.delete(key);
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
    } catch {
      useMemoryStorage = true;
      memoryStorage.delete(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseAnonKey ?? 'public-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: safeStorage,
    },
  },
);
