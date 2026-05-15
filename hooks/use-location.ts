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
      accuracy: Location.Accuracy.BestForNavigation,
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
    console.warn('Location error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Estimate travel time based on distance (rough estimation for walking/driving)
 * @param distanceKm Distance in kilometers
 * @param mode 'walking' or 'driving'
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number, mode: 'walking' | 'driving' = 'driving'): number {
  // Average speeds: walking ~5 km/h, driving ~50 km/h
  const speedKmh = mode === 'walking' ? 5 : 50;
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = timeHours * 60;

  return Math.round(timeMinutes);
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
