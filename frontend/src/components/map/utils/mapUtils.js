import L from "leaflet";

export const reorderMarkersByRoute = (markers, routeCoords) => {
  if (markers.length <= 1) return markers.map((m) => m._id);

  const firstStop = routeCoords[1];
  let remaining = [...markers];
  const ordered = [];

  let current = firstStop;
  while (remaining.length > 0) {
    let closest = remaining[0];
    let minDist = Infinity;

    for (const marker of remaining) {
      const dist = L.latLng(current).distanceTo(marker.position);
      if (dist < minDist) {
        minDist = dist;
        closest = marker;
      }
    }

    ordered.push(closest._id);
    remaining = remaining.filter((m) => m._id !== closest._id);
    current = closest.position;
  }

  return ordered;
};

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`
    );
    const data = await response.json();
    return data.length > 0
      ? [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      : null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
