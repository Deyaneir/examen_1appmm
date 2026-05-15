import { useEffect, useState } from 'react';

import { calculateDistance, getLocationData, LocationData } from './use-location';

async function getRealTravelTime(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<{ distanceKm: number; timeMinutes: number } | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=false`
    );
    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) return null;
    const distanceKm = route.distance / 1000;
    const realTimeMinutes = Math.round((route.duration / 60) * 3.5);
    return { distanceKm, timeMinutes: realTimeMinutes };
  } catch (error) {
    console.warn('Error OSRM:', error);
    return null;
  }
}

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

  const getDistanceTo = async (
    targetLat: number,
    targetLon: number
  ): Promise<DistanceInfo | null> => {
    if (!currentLocation) return null;

    const realTime = await getRealTravelTime(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon
    );

    if (realTime) {
      let timeFormatted: string;
      if (realTime.timeMinutes < 60) {
        timeFormatted = `${realTime.timeMinutes} min`;
      } else {
        const hours = Math.floor(realTime.timeMinutes / 60);
        const minutes = realTime.timeMinutes % 60;
        timeFormatted = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
      }
      return {
        distance: Math.round(realTime.distanceKm * 10) / 10,
        timeMinutes: realTime.timeMinutes,
        timeFormatted,
      };
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon
    );
    const timeMinutes = Math.round(distance / 5 * 60);

    let timeFormatted: string;
    if (timeMinutes < 60) {
      timeFormatted = `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      timeFormatted = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }

    return {
      distance: Math.round(distance * 10) / 10,
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