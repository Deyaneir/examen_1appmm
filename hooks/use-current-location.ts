import { useEffect, useState } from 'react';

import { calculateDistance, estimateTravelTime, getLocationData, LocationData } from './use-location';

export interface DistanceInfo {
  distance: number;
  timeMinutes: number;
  timeFormatted: string;
}

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getLocationData();
      if (location) {
        setCurrentLocation(location);
      } else {
        setError('No se pudo obtener la ubicación actual');
      }
    } catch (err) {
      setError('Error al obtener la ubicación');
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const getDistanceTo = (
    targetLat: number,
    targetLon: number,
    mode: 'walking' | 'driving' = 'driving'
  ): DistanceInfo | null => {
    if (!currentLocation) return null;

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon
    );

    const timeMinutes = estimateTravelTime(distance, mode);

    let timeFormatted: string;
    if (timeMinutes < 60) {
      timeFormatted = `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      timeFormatted = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }

    return {
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      timeMinutes,
      timeFormatted,
    };
  };

  return {
    currentLocation,
    isLoading,
    error,
    refreshLocation,
    getDistanceTo,
  };
}