import L from "leaflet";

// Helper function: Calculate total route distance
const calculateTotalDistance = (userLocation, markers, route) => {
  let totalDistance = 0;

  // Add distance from user to first stop
  totalDistance += L.latLng(userLocation).distanceTo(
    markers[route[0]].position
  );

  // Add distances between stops
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += L.latLng(markers[route[i]].position).distanceTo(
      markers[route[i + 1]].position
    );
  }

  return totalDistance;
};

// Helper function: Perform the 2-opt swap
const twoOptSwap = (route, i, j) => {
  const newRoute = [...route];

  // Reverse the segment between i and j
  let start = i;
  let end = j;

  while (start < end) {
    [newRoute[start], newRoute[end]] = [newRoute[end], newRoute[start]];
    start++;
    end--;
  }

  return newRoute;
};

// Initial route using Nearest Neighbor
const optimizeRouteNearestNeighbor = (userLocation, markers) => {
  const visited = new Set();
  const route = [];
  let currentPosition = userLocation;

  while (route.length < markers.length) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Find nearest unvisited marker
    for (let i = 0; i < markers.length; i++) {
      if (!visited.has(i)) {
        const distance = L.latLng(currentPosition).distanceTo(
          markers[i].position
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
    }

    // Safety check - in case no nearest found
    if (nearestIndex === -1) break;

    route.push(nearestIndex);
    visited.add(nearestIndex);
    currentPosition = markers[nearestIndex].position;
  }

  return route;
};

// Main 2-opt optimization function
export const optimizeRoute2Opt = (userLocation, markers) => {
  // Handle edge cases
  if (markers.length === 0) return [];
  if (markers.length === 1) return [markers[0]._id]; // Return the actual ID

  // FILTER: Only use available markers for routing
  const availableMarkers = markers.filter(
    (marker) =>
      marker.available === "available" ||
      !marker.available ||
      marker.available === "unknown"
  );

  // Handle edge cases for available markers
  if (availableMarkers.length === 0) return [];
  if (availableMarkers.length === 1) return [availableMarkers[0]._id];

  // Step 1: Get initial route using available markers only
  let bestRoute = optimizeRouteNearestNeighbor(userLocation, availableMarkers);
  let bestDistance = calculateTotalDistance(
    userLocation,
    availableMarkers,
    bestRoute
  );
  let improved = true;

  // Step 2: Keep improving until no more improvements
  while (improved) {
    improved = false;

    // Try all possible 2-opt swaps
    for (let i = 1; i < bestRoute.length - 1; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        // Create new route by swapping segments
        const newRoute = twoOptSwap(bestRoute, i, j);
        const newDistance = calculateTotalDistance(
          userLocation,
          availableMarkers,
          newRoute
        );

        // If better, keep it
        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
          break; // Restart the search with new route
        }
      }
      if (improved) break; // Restart the search with new route
    }
  }

  // Convert array indices to marker IDs - use availableMarkers, not original markers
  return bestRoute.map((index) => availableMarkers[index]._id);
};

// Export the simple algorithm as fallback
export const optimizeRouteNearestNeighborExport = (userLocation, markers) => {
  const availableMarkers = markers.filter(
    (marker) =>
      marker.available === "available" ||
      !marker.available ||
      marker.available === "unknown"
  );

  const route = optimizeRouteNearestNeighbor(userLocation, availableMarkers);
  return route.map((index) => availableMarkers[index]._id);
};
