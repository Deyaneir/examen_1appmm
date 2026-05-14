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
      html, body, #map {
        height: 100%;
        margin: 0;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script>
      const map = L.map('map').setView([${latitude}, ${longitude}], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([${latitude}, ${longitude}])
        .addTo(map)
        .bindPopup(${JSON.stringify(dishName)})
        .openPopup();
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
      />
    </View>
  );
}