import { useState, useRef, useEffect } from "react";
import L from "leaflet";

export const useMapOperations = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [multipleMarkers, setMultipleMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeOrder, setRouteOrder] = useState([]);
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const watchIdRef = useRef(null);

  // Load persisted state on component mount
  useEffect(() => {
    const persistedRouteOrder = localStorage.getItem("deliveryRouteOrder");
    const persistedIsRoutingActive = localStorage.getItem(
      "deliveryIsRoutingActive"
    );

    if (persistedRouteOrder) {
      setRouteOrder(JSON.parse(persistedRouteOrder));
    }
    if (persistedIsRoutingActive) {
      setIsRoutingActive(JSON.parse(persistedIsRoutingActive));
    }
  }, []);

  // Save route state whenever it changes
  useEffect(() => {
    if (routeOrder.length > 0) {
      localStorage.setItem("deliveryRouteOrder", JSON.stringify(routeOrder));
      localStorage.setItem(
        "deliveryIsRoutingActive",
        JSON.stringify(isRoutingActive)
      );
    }
  }, [routeOrder, isRoutingActive]);

  // Cleanup watch position on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Check if permission was previously denied
    if (locationPermissionDenied) {
      setError(
        "Location permission was denied. Please enable it in your browser settings."
      );
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    console.log("Getting current location...");

    // SIMPLIFIED: Use a single reliable geolocation call
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(
          `📍 Location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );

        setUserLocation([latitude, longitude]);
        setLocationPermissionDenied(false);
        setIsGettingLocation(false);

        // Start continuous tracking for live updates
        startContinuousTracking();
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setIsGettingLocation(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            setError(
              "Location access denied. Please allow location permissions in your browser."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable. Check your device settings."
            );
            break;
          case err.TIMEOUT:
            setError(
              "Location request timed out. Please try again or check your connection."
            );
            // Try again with different settings
            setTimeout(() => getCurrentLocationFallback(), 1000);
            break;
          default:
            setError("Could not get your location. Using default center.");
            setUserLocation([20.5937, 78.9629]);
        }
      },
      {
        // More relaxed settings for better success rate
        enableHighAccuracy: true, // Try to get GPS if available
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  };

  // Fallback method with different settings
  const getCurrentLocationFallback = () => {
    console.log("Trying fallback location method...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(`📍 Fallback location: ${latitude}, ${longitude}`);
        setUserLocation([latitude, longitude]);
        setLocationPermissionDenied(false);
        startContinuousTracking();
      },
      (err) => {
        console.warn("Fallback also failed:", err.message);
        setError("Cannot access your location. Using default map center.");
        setUserLocation([20.5937, 78.9629]); // Default India center
      },
      {
        enableHighAccuracy: false, // Don't wait for GPS
        timeout: 10000, // 10 seconds
        maximumAge: 300000, // Accept 5-minute old cached position
      }
    );
  };

  const startContinuousTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    console.log("Starting continuous location tracking...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Always update for live tracking
        setUserLocation([latitude, longitude]);

        console.log(
          `🔄 Live update: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );
      },
      (err) => {
        console.warn("Continuous tracking error:", err.message);
        // Don't show error for tracking failures, just log
      },
      {
        enableHighAccuracy: false, // Use less battery
        timeout: 10000,
        maximumAge: 30000, // Update every 30 seconds max
      }
    );
  };

  // Add a method to manually reset location permission
  const resetLocationPermission = () => {
    setLocationPermissionDenied(false);
    setError(null);
    // Clear any existing location data and try again
    setUserLocation(null);
    setTimeout(() => getCurrentLocation(), 500);
  };

  // Force refresh location
  const refreshLocation = () => {
    console.log("Manually refreshing location...");
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    getCurrentLocation();
  };

  const refreshDeliveries = async () => {
    await fetchDeliveries();
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/delivery-stops");
      if (!res.ok) throw new Error("Failed to fetch deliveries");

      const deliveries = await res.json();

      // FIX: Handle both response formats (array or {data: array})
      let deliveryData = deliveries;
      if (deliveries && deliveries.data && Array.isArray(deliveries.data)) {
        deliveryData = deliveries.data;
      }

      // FILTER: Only include available or unknown status deliveries
      const availableDeliveries = deliveryData.filter(
        (delivery) =>
          delivery.available === "available" ||
          !delivery.available ||
          delivery.available === "unknown"
      );

      const updatedMarkers = [];

      for (const delivery of availableDeliveries) {
        try {
          let coordinates;

          // Case 1: Already has coordinates in database
          if (
            delivery.location &&
            delivery.location.lat !== undefined &&
            delivery.location.lng !== undefined
          ) {
            coordinates = [delivery.location.lat, delivery.location.lng];
          }
          // Case 2: No coordinates but has address - geocode it
          else if (delivery.address) {
            coordinates = await geocodeAddress(delivery.address);
          }
          // Case 3: No location data at all - use fallback
          else {
            coordinates = [20.5937, 78.9629];
          }

          if (coordinates) {
            updatedMarkers.push({
              _id: delivery._id,
              name: delivery.name || "Unknown",
              address: delivery.address,
              phone_num: delivery.mobile_number || "N/A",
              pincode: delivery.pincode || "N/A",
              position: coordinates,
              available: delivery.available || "unknown",
              wasGeocoded: !delivery.location,
            });
          }
        } catch (deliveryError) {
          console.error("Failed to process delivery:", delivery, deliveryError);
        }
      }

      setMultipleMarkers(updatedMarkers);
    } catch (err) {
      setError("Failed to load delivery stops from server.");
    } finally {
      setLoading(false);
    }
  };

  // Geocode function
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      throw new Error("Address not found");
    } catch (error) {
      console.error("Geocoding error:", error);
      return [20.5937, 78.9629];
    }
  };

  // Recreate route when markers and routeOrder are both available
  useEffect(() => {
    if (
      routeOrder.length > 0 &&
      multipleMarkers.length > 0 &&
      mapRef.current &&
      userLocation
    ) {
      recreateRoute();
    }
  }, [routeOrder, multipleMarkers, userLocation]);

  const recreateRoute = () => {
    // Clear existing route
    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create waypoints based on persisted route order
    const orderedMarkers = routeOrder
      .map((id) => multipleMarkers.find((marker) => marker._id === id))
      .filter((marker) => marker !== undefined);

    if (orderedMarkers.length === 0 || !userLocation) {
      console.log(
        "No valid markers found for persisted route or no user location"
      );
      return;
    }

    const waypoints = [
      L.latLng(...userLocation),
      ...orderedMarkers.map((m) => L.latLng(...m.position)),
    ];

    // Recreate the route visualization
    routingControlRef.current = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      show: false,
      lineOptions: { styles: [{ color: "#0066ff", opacity: 0.7, weight: 5 }] },
      createMarker: () => null,
    })
      .on("routesfound", (e) => {
        const routes = e.routes;
        if (routes.length === 0) return;

        const totalDistance = (routes[0].summary.totalDistance / 1000).toFixed(
          1
        );
        const totalTime = Math.round(routes[0].summary.totalTime / 60);

        console.log(
          `Route recreated! Total: ${totalDistance} km, ~${totalTime} min`
        );
      })
      .addTo(mapRef.current);

    setIsRoutingActive(true);
  };

  const handleOptimizeRoute = async () => {
    if (!userLocation || multipleMarkers.length === 0) {
      setError(
        "Add at least one delivery stop and ensure your location is detected."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Sending to backend optimization:");
      console.log("User Location:", userLocation);
      console.log("Markers count:", multipleMarkers.length);

      // Call backend optimization API
      const response = await fetch(
        "http://localhost:5000/api/optimization/optimize-route",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userLocation: userLocation,
            markers: multipleMarkers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Backend response:", data);

      if (!data || !data.success) {
        throw new Error(
          data?.error || "Optimization failed - no data returned"
        );
      }

      // Clear existing route
      if (routingControlRef.current) {
        mapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Set the optimized route order from backend
      setRouteOrder(data.data.optimizedOrder);
      setIsRoutingActive(true);

      console.log(
        `✅ Route optimized via backend! ${data.data.totalStops} stops, ${
          data.data.totalDistance || "N/A"
        } km`
      );
      console.log("Optimized order:", data.data.optimizedOrder);
    } catch (error) {
      console.error("Backend optimization error:", error);
      setError(`Failed to optimize route: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setMultipleMarkers([]);
    setRouteOrder([]);
    setIsRoutingActive(false);
    setError(null);
    setLocationPermissionDenied(false);

    // Clear persisted data
    localStorage.removeItem("deliveryRouteOrder");
    localStorage.removeItem("deliveryIsRoutingActive");

    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Stop watching location
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return {
    userLocation,
    searchLocation,
    multipleMarkers,
    loading,
    error,
    routeOrder,
    isRoutingActive,
    locationPermissionDenied,
    isGettingLocation,
    setIsRoutingActive,
    searchInputRef,
    mapRef,
    routingControlRef,
    setError,
    setMultipleMarkers,
    setRouteOrder,
    setSearchLocation,
    getCurrentLocation,
    refreshLocation,
    resetLocationPermission,
    fetchDeliveries,
    handleOptimizeRoute,
    handleReset,
    refreshDeliveries,
  };
};
