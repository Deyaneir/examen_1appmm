import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const DEFAULT_LATITUDE = -0.1807;
const DEFAULT_LONGITUDE = -78.4678;

export default function MapScreen() {
  const params = useLocalSearchParams();

  const latitudeParam = Array.isArray(params.latitude) ? params.latitude[0] : params.latitude;
  const longitudeParam = Array.isArray(params.longitude) ? params.longitude[0] : params.longitude;
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;

  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  const dishName = String(nameParam || 'Ubicación');

  const finalLatitude = Number.isFinite(latitude) ? latitude : DEFAULT_LATITUDE;
  const finalLongitude = Number.isFinite(longitude) ? longitude : DEFAULT_LONGITUDE;

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const requestLocationAccess = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setCurrentLocation(null);
        setLocationError('Permiso de ubicación denegado. Activa la ubicación en ajustes y vuelve a intentar.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      if (!location?.coords) {
        throw new Error('No se pudo recuperar coordenadas de ubicación');
      }

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setCurrentLocation(null);
      setLocationError('No se pudo obtener tu ubicación. Comprueba permisos y vuelve a intentar.');
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    requestLocationAccess();
  }, []);

  const html = useMemo(() => {
    const destinationLat = finalLatitude;
    const destinationLng = finalLongitude;
    const originLat = currentLocation?.latitude;
    const originLng = currentLocation?.longitude;
    const hasOrigin = originLat !== undefined && originLng !== undefined;
    const centerLat = hasOrigin ? (originLat + destinationLat) / 2 : destinationLat;
    const centerLng = hasOrigin ? (originLng + destinationLng) / 2 : destinationLng;
    const initialZoom = hasOrigin ? 11 : 14;
    const infoMessage = locationError
      ? locationError
      : hasOrigin
      ? 'Calculando ruta a pie...'
      : 'Activa permisos para ver la ruta a pie.';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
          }

          body {
            position: relative;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
          }

          #route-info {
            position: absolute;
            z-index: 999;
            left: 12px;
            right: 12px;
            top: 12px;
            padding: 14px 16px;
            border-radius: 18px;
            background: rgba(255,255,255,0.95);
            color: #0f172a;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 18px 40px rgba(15,23,42,0.14);
            border: 1px solid rgba(2,132,199,0.18);
          }
        </style>
      </head>
      <body>
        <div id="route-info">${infoMessage}</div>
        <div id="map"></div>
        <script>
          const destinationLat = ${destinationLat};
          const destinationLng = ${destinationLng};
          const destinationName = ${JSON.stringify(dishName)};
          const originLat = ${hasOrigin ? originLat : 'null'};
          const originLng = ${hasOrigin ? originLng : 'null'};

          const map = L.map('map').setView([${centerLat}, ${centerLng}], ${initialZoom});

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          L.marker([destinationLat, destinationLng])
            .addTo(map)
            .bindPopup(destinationName)
            .openPopup();

          function formatMinutes(seconds) {
            return Math.max(1, Math.round(seconds / 60));
          }

          function formatKilometers(meters) {
            return (meters / 1000).toFixed(2);
          }

          function formatTime(date) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          function getTrafficMultiplier() {
            const now = new Date();
            const hour = now.getHours();
            const weekday = now.getDay();
            const isWeekend = weekday === 0 || weekday === 6;

            if (isWeekend) {
              return 1.1;
            }

            if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) {
              return 1.7;
            }

            if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 17)) {
              return 1.25;
            }

            if (hour >= 20 || hour < 6) {
              return 1.0;
            }

            return 1.15;
          }

          async function drawRouteFromUserLocation(startLat, startLng) {
            try {
              const response = await fetch(
                'https://router.project-osrm.org/route/v1/foot/' +
                startLng + ',' + startLat + ';' + destinationLng + ',' + destinationLat +
                '?overview=full&geometries=geojson&steps=false'
              );

              if (!response.ok) {
                throw new Error('OSRM respondió con estado ' + response.status);
              }

              const data = await response.json();
              const route = data && data.routes && data.routes[0];

              if (!route) {
                throw new Error('No se encontró una ruta válida.');
              }

              const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

              L.polyline(coordinates, {
                color: '#0ea5e9',
                weight: 5,
                opacity: 0.96,
              }).addTo(map);

              L.marker([startLat, startLng])
                .addTo(map)
                .bindPopup('Tu ubicación actual');

              const bounds = L.latLngBounds([
                [startLat, startLng],
                [destinationLat, destinationLng],
              ]);

              map.fitBounds(bounds, { padding: [42, 42] });

              const distanceKm = formatKilometers(route.distance);
              const rawDurationSeconds = route.duration;
              const realTimeSeconds = rawDurationSeconds * 3.5;
              const durationMinutes = formatMinutes(realTimeSeconds);
              const departureTime = new Date();
              const arrivalTime = new Date(departureTime.getTime() + realTimeSeconds * 1000);

              document.getElementById('route-info').innerHTML =
                'Ruta · ' + distanceKm + ' km · ~' + durationMinutes + ' min' +
                '<br>Salida: ' + formatTime(departureTime) +
                ' · Llega: ' + formatTime(arrivalTime);
            } catch (error) {
              console.error('Error calculando ruta:', error);
              document.getElementById('route-info').innerHTML = 'No se pudo calcular la ruta. Intenta de nuevo.';
            }
          }

          if (originLat !== null && originLng !== null) {
            drawRouteFromUserLocation(originLat, originLng);
          }
        </script>
      </body>
      </html>
    `;
  }, [currentLocation, finalLatitude, finalLongitude, dishName, locationError]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {loadingLocation && (
        <View style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.95)', padding: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, elevation: 6 }}>
          <Text style={{ color: '#0F172A', fontSize: 14, marginBottom: 8 }}>Obteniendo tu ubicación con alta precisión...</Text>
          <ActivityIndicator size="small" color="#006491" />
        </View>
      )}

      {locationError && !loadingLocation && (
        <View style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, borderRadius: 18, backgroundColor: '#FEF3F2', borderColor: '#FBC8C3', borderWidth: 1, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 6 }}>
          <Text style={{ color: '#991B1B', fontSize: 14, marginBottom: 10 }}>{locationError}</Text>
          <Pressable
            onPress={requestLocationAccess}
            style={{ alignSelf: 'flex-start', backgroundColor: '#006491', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Reintentar ubicación</Text>
          </Pressable>
        </View>
      )}

      <WebView
        style={{ flex: 1 }}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        setSupportMultipleWindows={true}
        useWebkit={true}
      />
    </View>
  );
}
