import { File } from 'expo-file-system';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const DISH_IMAGE_BUCKET = 'dish-images';

function getImageExtension(imageUri: string, mimeType: string | null) {
  if (mimeType?.includes('/')) {
    return mimeType.split('/')[1].split(';')[0] || 'jpg';
  }

  const cleanUri = imageUri.split('?')[0].split('#')[0];
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);

  return match?.[1] || 'jpg';
}

function logUploadContext(imageUri: string, fileName: string, hasSupabaseUrl: boolean, hasSupabaseAnonKey: boolean) {
  console.log('[Supabase Upload] uri recibida:', imageUri);
  console.log('[Supabase Upload] nombre del archivo:', fileName);
  console.log('[Supabase Upload] EXPO_PUBLIC_SUPABASE_URL presente:', hasSupabaseUrl);
  console.log('[Supabase Upload] EXPO_PUBLIC_SUPABASE_ANON_KEY presente:', hasSupabaseAnonKey);
  console.log('[Supabase Upload] bucket destino:', DISH_IMAGE_BUCKET);
}

function buildUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Error desconocido al subir la imagen.';
  }
}

function base64ToUint8Array(base64: string) {
  const binaryString = globalThis.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

export async function uploadDishImageToSupabase(imageUri: string, imageBase64?: string | null): Promise<string> {
  const hasSupabaseUrl = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  const file = new File(imageUri);
  const fileName = file.name || `${Date.now()}.jpg`;

  logUploadContext(imageUri, fileName, hasSupabaseUrl, hasSupabaseAnonKey);

  if (!isSupabaseConfigured || !hasSupabaseUrl || !hasSupabaseAnonKey) {
    throw new Error('Supabase no está configurado. Verifica EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  try {
    let bytes: Uint8Array<ArrayBuffer>;

    if (imageBase64) {
      console.log('[Supabase Upload] usando base64 del ImagePicker');
      bytes = base64ToUint8Array(imageBase64);
    } else {
      console.log('[Supabase Upload] usando arrayBuffer desde FileSystem');
      const arrayBuffer = await file.arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
    }

    const contentType = file.type || 'image/jpeg';
    const extension = getImageExtension(imageUri, contentType);
    const storageFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    console.log('[Supabase Upload] nombre final en Storage:', storageFileName);
    console.log('[Supabase Upload] content-type:', contentType);
    console.log('[Supabase Upload] base64 presente:', Boolean(imageBase64));
    console.log('[Supabase Upload] bytes a subir:', bytes.byteLength);

    const { data, error } = await supabase.storage.from(DISH_IMAGE_BUCKET).upload(storageFileName, bytes, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.error('[Supabase Upload] error exacto de Storage:', error);
      throw new Error(buildUploadErrorMessage(error));
    }

    console.log('[Supabase Upload] respuesta upload:', data);

    const { data: publicUrlData } = supabase.storage.from(DISH_IMAGE_BUCKET).getPublicUrl(storageFileName);
    const publicUrl = publicUrlData.publicUrl;

    console.log('[Supabase Upload] publicUrl:', publicUrl);

    if (!publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen.');
    }

    if (publicUrl.startsWith('file://')) {
      throw new Error('La URL pública no puede ser una ruta local file://.');
    }

    return publicUrl;
  } catch (error) {
    console.error('[Supabase Upload] fallo general al subir imagen:', error);
    throw new Error(buildUploadErrorMessage(error));
  }
}