import express from "express";

const router = express.Router();

// Haversine formula to calculate distance between two points in meters
const calculateDistance = (point1, point2) => {
  const R = 6371000; // Earth radius in meters
  const lat1 = (point1[0] * Math.PI) / 180;
  const lat2 = (point2[0] * Math.PI) / 180;
  const deltaLat = ((point2[0] - point1[0]) * Math.PI) / 180;
  const deltaLon = ((point2[1] - point1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Helper function: Calculate total route distance
const calculateTotalDistance = (userLocation, markers, route) => {
  let totalDistance = 0;

  // Add distance from user to first stop
  if (route.length > 0) {
    totalDistance += calculateDistance(
      userLocation,
      markers[route[0]].position
    );
  }

  // Add distances between stops
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      markers[route[i]].position,
      markers[route[i + 1]].position
    );
  }

  return totalDistance;
};

// Helper function: Perform the 2-opt swap
const twoOptSwap = (route, i, j) => {
  const newRoute = [...route];
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
        const distance = calculateDistance(
          currentPosition,
          markers[i].position
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
    }

    if (nearestIndex === -1) break;

    route.push(nearestIndex);
    visited.add(nearestIndex);
    currentPosition = markers[nearestIndex].position;
  }

  return route;
};

// Main 2-opt optimization function
const optimizeRoute2Opt = (userLocation, markers) => {
  // Handle edge cases
  if (!markers || markers.length === 0) return [];
  if (markers.length === 1) return [markers[0]._id];

  // FIX: Use the same filtering logic as frontend
  const availableMarkers = markers.filter((marker) => {
    // Basic validation - marker exists and has position
    if (!marker || !marker.position || !Array.isArray(marker.position)) {
      return false;
    }

    // Check availability - same as frontend
    const isAvailable =
      marker.available === "available" ||
      !marker.available ||
      marker.available === "unknown";

    return isAvailable;
  });

  // Handle edge cases for available markers
  if (availableMarkers.length === 0) return [];
  if (availableMarkers.length === 1) return [availableMarkers[0]._id];

  console.log(
    `Optimizing route with ${availableMarkers.length} available markers`
  );

  // Step 1: Get initial route using available markers only
  let bestRoute = optimizeRouteNearestNeighbor(userLocation, availableMarkers);
  let bestDistance = calculateTotalDistance(
    userLocation,
    availableMarkers,
    bestRoute
  );
  let improved = true;

  // Step 2: Keep improving until no more improvements
  let iteration = 0;
  const maxIterations = 100;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 1; i < bestRoute.length - 1; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        const newRoute = twoOptSwap(bestRoute, i, j);
        const newDistance = calculateTotalDistance(
          userLocation,
          availableMarkers,
          newRoute
        );

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  console.log(`Optimization completed in ${iteration} iterations`);

  // Convert array indices to marker IDs
  const optimizedOrder = bestRoute.map((index) => availableMarkers[index]._id);

  return {
    optimizedOrder,
    totalDistance: (bestDistance / 1000).toFixed(2),
    totalStops: optimizedOrder.length,
  };
};

// POST route for optimization
router.post("/optimize-route", (req, res) => {
  try {
    const { userLocation, markers } = req.body;

    console.log("🔍 Received optimization request:");
    console.log("User location:", userLocation);
    console.log("Markers received:", markers?.length);

    if (!userLocation || !markers) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: userLocation and markers",
      });
    }

    const result = optimizeRoute2Opt(userLocation, markers);

    console.log("✅ Optimization result:", result);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Route optimization error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to optimize route: " + error.message,
    });
  }
});

export default router;
