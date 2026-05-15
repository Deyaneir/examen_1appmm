import { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

type LocationMapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onSelectLocation: (location: { latitude: number; longitude: number }) => void;
};

const DEFAULT_LATITUDE = -0.1807;
const DEFAULT_LONGITUDE = -78.4678;

export function LocationMapPicker({ latitude, longitude, onSelectLocation }: LocationMapPickerProps) {
  const initialLatitude = Number.isFinite(latitude ?? NaN) ? latitude! : DEFAULT_LATITUDE;
  const initialLongitude = Number.isFinite(longitude ?? NaN) ? longitude! : DEFAULT_LONGITUDE;

  const html = useMemo(
    () => `
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
            background: #F3F4F6;
          }

          .hint {
            position: absolute;
            z-index: 999;
            left: 12px;
            right: 12px;
            top: 12px;
            padding: 12px 14px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.95);
            color: black;
            font-family: sans-serif;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.24);
          }
        </style>
      </head>
      <body>
        <div class="hint">Toca el punto exacto en el mapa para usarlo como ubicación del plato.</div>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${initialLatitude}, ${initialLongitude}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          let marker = null;

          function setSelectedLocation(lat, lng) {
            if (marker) {
              map.removeLayer(marker);
            }

            marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup('Ubicación seleccionada').openPopup();
            map.setView([lat, lng], Math.max(map.getZoom(), 16));

            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: lat,
              longitude: lng,
            }));
          }

          map.on('click', (event) => {
            setSelectedLocation(event.latlng.lat, event.latlng.lng);
          });

          setSelectedLocation(${latitude ?? initialLatitude}, ${longitude ?? initialLongitude});
        </script>
      </body>
      </html>
    `,
    [initialLatitude, initialLongitude, latitude, longitude],
  );

  return (
    <View style={{ height: 320, overflow: 'hidden', borderRadius: 24 }}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data) as { latitude?: number; longitude?: number };

            if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
              onSelectLocation({ latitude: data.latitude!, longitude: data.longitude! });
            }
          } catch {
            // Ignore malformed messages from the embedded map.
          }
        }}
      />
    </View>
  );
}