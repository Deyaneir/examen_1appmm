import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
}

export async function getLocationData(): Promise<LocationData | null> {
  try {
    // Request foreground location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocoding to get city and country
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let city: string | null = null;
      let country: string | null = null;

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        city = address.city || address.region || null;
        country = address.country || null;
      }

      return {
        latitude,
        longitude,
        city,
        country,
      };
    } catch (geocodeError) {
      console.warn('Reverse geocoding failed:', geocodeError);
      return {
        latitude,
        longitude,
        city: null,
        country: null,
      };
    }
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}
