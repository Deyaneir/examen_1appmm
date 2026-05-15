interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][];
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: 'driving' | 'foot' | 'cycling' = 'foot'
): Promise<RouteResult> {

  const url = `https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error OSRM: ${response.status}`);
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error('No se encontró ruta');
  }

  // 🧠 tiempo base real de OSRM
  const baseMinutes = route.duration / 60;

  // 📍 ajuste más realista para ciudad (Quito)
  let factor = 1;

  if (mode === 'foot') factor = 2.8;
  if (mode === 'driving') factor = 1.4;
  if (mode === 'cycling') factor = 1.6;

  const realTime = baseMinutes * factor;

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: Math.round(realTime),
    coordinates: route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    ),
  };
}

// 🚀 TEST
async function main() {
  const guamani = { lat: -0.2179, lng: -78.4953 };
  const carolina = { lat: -0.1830, lng: -78.4850 };

  const result = await calculateRoute(
    guamani.lat,
    guamani.lng,
    carolina.lat,
    carolina.lng,
    'foot'
  );

  console.log(`Distancia: ${result.distanceKm.toFixed(2)} km`);
  console.log(`Tiempo: ${result.durationMinutes} minutos`);
  console.log(`Coordenadas ruta: ${result.coordinates.length} puntos`);
}

main();