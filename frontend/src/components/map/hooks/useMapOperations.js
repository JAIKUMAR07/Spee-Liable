import { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";
import { deliveryStopsAPI, optimizationAPI } from "../../../utils/apiClient";
import { useSocket } from "../../../context/SocketContext";

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
  const socket = useSocket();

  // ✅ NEW: Auto-optimize route when markers change
  // ✅ UPDATED: Auto-optimize route when markers change with better error handling
  const handleAutoOptimizeRoute = useCallback(async () => {
    if (!userLocation || multipleMarkers.length === 0) {
      console.log("🔄 Auto-optimize: Not enough markers or location data");
      return;
    }

    // Don't auto-optimize if there's only 1 marker (no optimization needed)
    if (multipleMarkers.length <= 1) {
      console.log("🔄 Auto-optimize: Only one marker, no optimization needed");
      setRouteOrder(multipleMarkers.map((marker) => marker._id));
      return;
    }

    console.log("🔄 Auto-optimizing route due to marker changes...");
    console.log("Current markers:", multipleMarkers.length);

    try {
      // ✅ Using API client for optimization
      const response = await optimizationAPI.optimizeRoute({
        userLocation: userLocation,
        markers: multipleMarkers,
      });

      const data = response.data;
      console.log("📥 Auto-optimization response:", data);

      if (!data || !data.success) {
        throw new Error(data?.error || "Auto-optimization failed");
      }

      // ✅ ADD SAFETY CHECK for optimizedOrder
      if (
        !data.data ||
        !data.data.optimizedOrder ||
        !Array.isArray(data.data.optimizedOrder)
      ) {
        console.warn(
          "⚠️ Auto-optimization returned invalid optimizedOrder:",
          data.data
        );
        throw new Error("Invalid auto-optimization result");
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
        `✅ Route auto-optimized! ${data.data.optimizedOrder.length} stops, ${
          data.data.totalDistance || "N/A"
        } km`
      );
      console.log("Auto-optimized order:", data.data.optimizedOrder);
    } catch (error) {
      console.error("Auto-optimization error:", error);
      // ✅ FALLBACK: Use simple order if auto-optimization fails
      const fallbackOrder = multipleMarkers.map((marker) => marker._id);
      setRouteOrder(fallbackOrder);
      console.log(
        "🔄 Auto-optimization failed, using fallback order:",
        fallbackOrder
      );
    }
  }, [userLocation, multipleMarkers, setRouteOrder, setIsRoutingActive]);
  // ✅ UPDATED: Use useCallback for fetchDeliveries to avoid circular dependency
  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deliveryStopsAPI.getAll();

      let deliveryData = response.data;
      if (
        deliveryData &&
        deliveryData.data &&
        Array.isArray(deliveryData.data)
      ) {
        deliveryData = deliveryData.data;
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
      const errorMessage =
        err.response?.data?.error ||
        "Failed to load delivery stops from server.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependency array since we're not using any external variables

  // ✅ NEW: Auto-clear route when no markers are available
  useEffect(() => {
    // If route is active but no available markers, clear the route
    if (isRoutingActive && multipleMarkers.length === 0) {
      console.log("🔄 No available markers - clearing route");

      // Clear the route from map
      if (routingControlRef.current) {
        mapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Clear route order and deactivate routing
      setRouteOrder([]);
      setIsRoutingActive(false);

      // Clear persisted data
      localStorage.removeItem("deliveryRouteOrder");
      localStorage.removeItem("deliveryIsRoutingActive");

      console.log("✅ Route cleared - no markers available");
    }
  }, [
    multipleMarkers.length,
    isRoutingActive,
    setRouteOrder,
    setIsRoutingActive,
  ]);
  // ✅ NEW: Auto-optimize when markers change significantly
  useEffect(() => {
    // Only auto-optimize if we have a route active and markers changed
    if (isRoutingActive && multipleMarkers.length > 0 && userLocation) {
      console.log(
        `🔄 Markers changed: ${multipleMarkers.length} markers, triggering auto-optimization`
      );

      // Use a small delay to avoid too many rapid optimizations
      const optimizationTimer = setTimeout(() => {
        handleAutoOptimizeRoute();
      }, 1000); // 1 second delay

      return () => clearTimeout(optimizationTimer);
    }
  }, [
    multipleMarkers.length,
    isRoutingActive,
    userLocation,
    handleAutoOptimizeRoute,
  ]);

  // ✅ UPDATED: Real-time updates with auto-optimization
  // ✅ UPDATED: Real-time updates with auto-optimization
  useEffect(() => {
    if (!socket) {
      console.log("Socket not available yet - skipping real-time setup");
      return;
    }

    const handlePackageStatusChanged = (data) => {
      console.log("📡 Real-time package update received:", data);

      // Update markers based on status change
      if (data.status === "unavailable") {
        // Remove marker from map if unavailable
        setMultipleMarkers((prev) =>
          prev.filter((marker) => marker._id !== data.packageId)
        );
        // Also remove from route order if it's there
        setRouteOrder((prev) => prev.filter((id) => id !== data.packageId));

        console.log(
          `🗑️ Removed package ${data.packageId} from map (unavailable)`
        );

        // ✅ CHECK IF NO MARKERS LEFT - CLEAR ROUTE
        setTimeout(() => {
          const updatedMarkers = multipleMarkers.filter(
            (marker) => marker._id !== data.packageId
          );
          if (updatedMarkers.length === 0 && isRoutingActive) {
            console.log("🔄 All markers removed - clearing route");

            // Clear the route from map
            if (routingControlRef.current) {
              mapRef.current?.removeControl(routingControlRef.current);
              routingControlRef.current = null;
            }

            setRouteOrder([]);
            setIsRoutingActive(false);

            // Clear persisted data
            localStorage.removeItem("deliveryRouteOrder");
            localStorage.removeItem("deliveryIsRoutingActive");
          }
          // ✅ TRIGGER AUTO-OPTIMIZATION when marker is removed (if markers still exist)
          else if (isRoutingActive && updatedMarkers.length > 0) {
            console.log(
              "🔄 Triggering auto-optimization due to marker removal"
            );
            handleAutoOptimizeRoute();
          }
        }, 100);
      } else if (data.status === "available") {
        // Add or update marker if available - fetch fresh data
        console.log(
          `🔄 Package ${data.packageId} now available - refreshing data`
        );
        fetchDeliveries().then(() => {
          // ✅ TRIGGER AUTO-OPTIMIZATION after fetching new data
          if (isRoutingActive) {
            console.log(
              "🔄 Triggering auto-optimization due to marker addition"
            );
            setTimeout(() => handleAutoOptimizeRoute(), 1000);
          }
        });
      }
    };

    socket.on("package-status-changed", handlePackageStatusChanged);

    // Cleanup
    return () => {
      if (socket) {
        socket.off("package-status-changed", handlePackageStatusChanged);
      }
    };
  }, [
    socket,
    setMultipleMarkers,
    setRouteOrder,
    fetchDeliveries,
    isRoutingActive,
    handleAutoOptimizeRoute,
    multipleMarkers,
  ]);
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
    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(
          `📍 Location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );

        setUserLocation([latitude, longitude]);
        setLocationPermissionDenied(false);
        setIsGettingLocation(false);
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
            setTimeout(() => getCurrentLocationFallback(), 1000);
            break;
          default:
            setError("Could not get your location. Using default center.");
            setUserLocation([20.5937, 78.9629]);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

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
        setUserLocation([20.5937, 78.9629]);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
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
        setUserLocation([latitude, longitude]);
        console.log(
          `🔄 Live update: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );
      },
      (err) => {
        console.warn("Continuous tracking error:", err.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const resetLocationPermission = () => {
    setLocationPermissionDenied(false);
    setError(null);
    setUserLocation(null);
    setTimeout(() => getCurrentLocation(), 500);
  };

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

  // ✅ UPDATED: Use API client for optimization
  // ✅ UPDATED: Use API client for optimization with better error handling
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

      // ✅ Using API client instead of direct fetch
      const response = await optimizationAPI.optimizeRoute({
        userLocation: userLocation,
        markers: multipleMarkers,
      });

      const data = response.data;
      console.log("📥 Backend response:", data);

      if (!data || !data.success) {
        throw new Error(
          data?.error || "Optimization failed - no data returned"
        );
      }

      // ✅ ADD SAFETY CHECK for optimizedOrder
      if (
        !data.data ||
        !data.data.optimizedOrder ||
        !Array.isArray(data.data.optimizedOrder)
      ) {
        console.warn("⚠️ Backend returned invalid optimizedOrder:", data.data);
        throw new Error("Invalid optimization result from server");
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
        `✅ Route optimized via backend! ${
          data.data.optimizedOrder.length
        } stops, ${data.data.totalDistance || "N/A"} km`
      );
      console.log("Optimized order:", data.data.optimizedOrder);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to optimize route";
      console.error("Backend optimization error:", error);
      setError(`Failed to optimize route: ${errorMessage}`);

      // ✅ FALLBACK: Use simple order if optimization fails
      const fallbackOrder = multipleMarkers.map((marker) => marker._id);
      setRouteOrder(fallbackOrder);
      console.log("🔄 Using fallback route order:", fallbackOrder);
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
    console.log("✅ Complete reset - markers, route, and path cleared");
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
    handleAutoOptimizeRoute, // ✅ ADD THIS
    handleReset,
    refreshDeliveries,
  };
};
