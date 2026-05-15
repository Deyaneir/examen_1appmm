import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
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
  
  // Use default coordinates if invalid
  const finalLatitude = Number.isFinite(latitude) ? latitude : DEFAULT_LATITUDE;
  const finalLongitude = Number.isFinite(longitude) ? longitude : DEFAULT_LONGITUDE;

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
        background: white;
        color: black;
        font-family: sans-serif;
        font-size: 14px;
        line-height: 1.45;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 2px solid #006491;
      }

      #retry-btn {
        display: none;
        margin-top: 8px;
        padding: 8px 16px;
        background: white;
        color: #006491;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        cursor: pointer;
      }
    </style>
  </head>

  <body>
    <div id="route-info">Cargando mapa en Quito...</div>
    <button id="retry-btn" onclick="requestLocation()">Solicitar ubicación</button>
    <div id="map"></div>

    <script>
      const destinationLat = ${finalLatitude};
      const destinationLng = ${finalLongitude};
      const destinationName = ${JSON.stringify(dishName)};
      const routeInfo = document.getElementById('route-info');
      const retryBtn = document.getElementById('retry-btn');

      // Request permission first
      if (navigator.permissions) {
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
          if (result.state === 'granted') {
            requestLocation();
          } else if (result.state === 'prompt') {
            updateRouteInfo('Presiona el botón para permitir ubicación', true);
          }
        });
      }

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

      function updateRouteInfo(message, showButton = false) {
        if (routeInfo) {
          routeInfo.innerHTML = message;
          if (showButton) {
            retryBtn.style.display = 'block';
          } else {
            retryBtn.style.display = 'none';
          }
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
          updateRouteInfo('No se pudo calcular la ruta. Intenta de nuevo.', true);
        }
      }

      function requestLocation() {
        if (!navigator.geolocation) {
          updateRouteInfo('Tu dispositivo no soporta geolocalización', false);
        } else {
          updateRouteInfo('Solicitando permiso de ubicación...', false);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const startLat = position.coords.latitude;
              const startLng = position.coords.longitude;
              drawRouteFromUserLocation(startLat, startLng);
            },
            (error) => {
              console.error('Error obteniendo ubicación:', error.code, error.message);
              let msg = 'No se pudo obtener tu ubicación.';
              if (error.code === 1) msg = 'Permiso de ubicación denegado. Presiona el botón para intentar de nuevo.';
              else if (error.code === 2) msg = 'Ubicación no disponible en este momento.';
              else if (error.code === 3) msg = 'Tiempo de espera agotado. Intenta de nuevo.';
              updateRouteInfo(msg, true);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        }
      }

      // Auto request on load
      setTimeout(requestLocation, 500);
    </script>
  </body>
  </html>
`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        setSupportMultipleWindows={true}
        useWebkit={true}
      />
    </View>
  );
}