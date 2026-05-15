import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { File as ExpoFile } from 'expo-file-system';

const DISH_IMAGE_BUCKET = 'dish-images';

function getImageExtension(imageUri: string, mimeType: string | null) {
  if (mimeType?.includes('/')) {
    return mimeType.split('/')[1].split(';')[0] || 'jpg';
  }

  const cleanUri = imageUri.split('?')[0].split('#')[0];
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);

  return match?.[1] || 'jpg';
}

function getMimeType(imageUri: string) {
  const extension = getImageExtension(imageUri, null).toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
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
  const cleanedBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
  const binaryString = typeof atob === 'function'
    ? atob(cleanedBase64)
    : typeof Buffer !== 'undefined'
      ? Buffer.from(cleanedBase64, 'base64').toString('binary')
      : '';

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export async function uploadDishImageToSupabase(imageUri: string, imageBase64?: string | null): Promise<string> {
  const hasSupabaseUrl = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  const cleanUri = imageUri.split('?')[0].split('#')[0];
  const uriParts = cleanUri.split('/');
  const fileNameFromUri = uriParts[uriParts.length - 1] || `${Date.now()}.jpg`;
  const extension = getImageExtension(imageUri, null);
  const storageFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  logUploadContext(imageUri, fileNameFromUri, hasSupabaseUrl, hasSupabaseAnonKey);

  if (!isSupabaseConfigured || !hasSupabaseUrl || !hasSupabaseAnonKey) {
    throw new Error('Supabase no está configurado. Verifica EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  try {
    let bytes: Uint8Array;

    if (imageBase64) {
      console.log('[Supabase Upload] usando base64 del ImagePicker');
      bytes = await base64ToUint8Array(imageBase64);
    } else if (/^https?:\/\//i.test(imageUri)) {
      console.log('[Supabase Upload] usando fetch para leer la imagen remota');
      const response = await fetch(imageUri);

      if (!response.ok) {
        throw new Error(`No se pudo leer la imagen remota: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
    } else {
      console.log('[Supabase Upload] usando ExpoFile para leer el archivo local');
      const file = new ExpoFile(imageUri);
      const arrayBuffer = await file.arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
    }

    const contentType = getMimeType(imageUri);

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

    const publicUrlResponse = supabase.storage.from(DISH_IMAGE_BUCKET).getPublicUrl(storageFileName);
    const publicUrl = publicUrlResponse.data.publicUrl;

    console.log('[Supabase Upload] publicUrl:', publicUrl);

    if (!publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen.');
    }

    return publicUrl;
  } catch (error) {
    console.error('[Supabase Upload] fallo general al subir imagen:', error);
    throw new Error(buildUploadErrorMessage(error));
  }
}