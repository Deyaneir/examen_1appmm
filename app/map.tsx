import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const params = useLocalSearchParams();

  const latitudeParam = Array.isArray(params.latitude) ? params.latitude[0] : params.latitude;
  const longitudeParam = Array.isArray(params.longitude) ? params.longitude[0] : params.longitude;
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;

  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  const dishName = String(nameParam || 'Ubicación');
  const isValidPosition = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!isValidPosition) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>No se pudo cargar el mapa</Text>
        <Text style={{ textAlign: 'center', color: '#475569' }}>
          Faltan coordenadas válidas para mostrar la ubicación.
        </Text>
      </View>
    );
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <style>
      html, body {
        height: 100%;
        margin: 0;
      }

      body {
        position: relative;
      }

      #map {
        height: 100%;
      }

      #route-info {
        position: absolute;
        z-index: 999;
        left: 12px;
        right: 12px;
        top: 12px;
        padding: 12px 14px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.88);
        color: #fff;
        font-family: sans-serif;
        font-size: 14px;
        line-height: 1.45;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.24);
      }
    </style>
  </head>

  <body>
    <div id="route-info">Calculando tiempo desde tu ubicación actual...</div>
    <div id="map"></div>

    <script>
      const destinationLat = ${latitude};
      const destinationLng = ${longitude};
      const destinationName = ${JSON.stringify(dishName)};
      const routeInfo = document.getElementById('route-info');

      const map = L.map('map').setView([destinationLat, destinationLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const destinationMarker = L.marker([destinationLat, destinationLng])
        .addTo(map)
        .bindPopup(destinationName)
        .openPopup();

      let routeLayer = null;
      let originMarker = null;

      function updateRouteInfo(message) {
        if (routeInfo) {
          routeInfo.textContent = message;
        }
      }

      function formatMinutes(seconds) {
        const minutes = Math.max(1, Math.round(seconds / 60));
        return minutes;
      }

      function formatKilometers(meters) {
        return (meters / 1000).toFixed(2);
      }

      async function drawRouteFromUserLocation(startLat, startLng) {
        try {
          updateRouteInfo('Calculando ruta y tiempo estimado...');

          const url = 'https://router.project-osrm.org/route/v1/driving/' +
            startLng + ',' + startLat + ';' + destinationLng + ',' + destinationLat +
            '?overview=full&geometries=geojson&steps=false';

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('OSRM respondió con estado ' + response.status);
          }

          const data = await response.json();
          const route = data && data.routes && data.routes[0];

          if (!route) {
            throw new Error('No se encontró una ruta válida.');
          }

          if (routeLayer) {
            map.removeLayer(routeLayer);
          }

          const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          routeLayer = L.polyline(coordinates, {
            color: '#0ea5e9',
            weight: 5,
            opacity: 0.9,
          }).addTo(map);

          if (originMarker) {
            map.removeLayer(originMarker);
          }

          originMarker = L.marker([startLat, startLng])
            .addTo(map)
            .bindPopup('Tu ubicación actual');

          const bounds = L.latLngBounds([
            [startLat, startLng],
            [destinationLat, destinationLng],
          ]);

          map.fitBounds(bounds, { padding: [40, 40] });

          const durationMinutes = formatMinutes(route.duration);
          const distanceKm = formatKilometers(route.distance);

          routeLayer.bindPopup(
            'Tiempo estimado: ' + durationMinutes + ' min' + '<br />' +
            'Distancia: ' + distanceKm + ' km'
          );

          updateRouteInfo(
            'Tiempo estimado desde tu ubicación: ' + durationMinutes + ' min · Distancia: ' + distanceKm + ' km'
          );
        } catch (error) {
          console.error('Error calculando ruta:', error);
          updateRouteInfo('No se pudo calcular la ruta desde tu ubicación actual.');
        }
      }

      if (!navigator.geolocation) {
        updateRouteInfo('Tu navegador no permite obtener ubicación. Solo se muestra el destino.');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const startLat = position.coords.latitude;
            const startLng = position.coords.longitude;
            drawRouteFromUserLocation(startLat, startLng);
          },
          (error) => {
            console.error('Error obteniendo ubicación actual:', error);
            updateRouteInfo('No se pudo obtener tu ubicación actual. Activa el permiso de ubicación para calcular el tiempo.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
          }
        );
      }
    </script>
  </body>
  </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
      />
    </View>
  );
}