import { File } from 'expo-file-system';

export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // If it's already a base64 string (starts with data:), return as is
    if (imageUri.startsWith('data:')) {
      return imageUri;
    }

    // If it's a network URL, return as is (will be loaded from network)
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      return imageUri;
    }

    // If it's a local file, convert to base64 with the new filesystem API
    const file = new File(imageUri);
    const base64 = await file.base64();

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // Return original URI if conversion fails
    return imageUri;
  }
}
