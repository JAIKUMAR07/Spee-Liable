import { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";
import { deliveryStopsAPI, optimizationAPI, personalStopsAPI } from "../../../utils/apiClient";
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
  const [isLocationTrackingActive, setIsLocationTrackingActive] = useState(false);
  const [deliveriesLoaded, setDeliveriesLoaded] = useState(false);

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
          data.data,
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
        } km`,
      );
      console.log("Auto-optimized order:", data.data.optimizedOrder);
    } catch (error) {
      console.error("Auto-optimization error:", error);
      // ✅ FALLBACK: Use simple order if auto-optimization fails
      const fallbackOrder = multipleMarkers.map((marker) => marker._id);
      setRouteOrder(fallbackOrder);
      console.log(
        "🔄 Auto-optimization failed, using fallback order:",
        fallbackOrder,
      );
    }
  }, [userLocation, multipleMarkers, setRouteOrder, setIsRoutingActive]);
  // ✅ UPDATED: Use useCallback for fetchDeliveries to avoid circular dependency
  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setDeliveriesLoaded(false);
      const [response, personalResponse] = await Promise.all([
        deliveryStopsAPI.getAll(),
        personalStopsAPI.getAll().catch((err) => {
          console.error("Failed to fetch personal stops", err);
          return { data: { data: [] } };
        })
      ]);

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
          delivery.available === "unknown",
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

      let personalData = personalResponse.data;
      if (
        personalData &&
        personalData.data &&
        Array.isArray(personalData.data)
      ) {
        personalData = personalData.data;
      } else if (Array.isArray(personalData)) {
        // Keep array response as-is
      } else {
        personalData = [];
      }

      for (const stop of personalData) {
        try {
          let coordinates;

          if (
            stop.location &&
            stop.location.lat !== undefined &&
            stop.location.lng !== undefined
          ) {
            coordinates = [stop.location.lat, stop.location.lng];
          } else if (stop.address) {
            coordinates = await geocodeAddress(stop.address);
          } else {
            coordinates = [20.5937, 78.9629];
          }

          if (coordinates) {
            updatedMarkers.push({
              _id: stop._id,
              name: stop.name || "Personal Stop",
              reason: stop.reason,
              address: stop.address,
              phone_num: "N/A",
              pincode: "N/A",
              position: coordinates,
              available: "available", // Always make personal stops visible
              isPersonal: true,
              wasGeocoded: !stop.location,
            });
          }
        } catch (stopError) {
          console.error("Failed to process personal stop:", stop, stopError);
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
      setDeliveriesLoaded(true);
    }
  }, []); // ✅ Empty dependency array since we're not using any external variables

  // Only clear route when data is fully loaded and no markers truly remain.
  useEffect(() => {
    if (deliveriesLoaded && isRoutingActive && multipleMarkers.length === 0) {
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
    deliveriesLoaded,
    multipleMarkers.length,
    isRoutingActive,
    setRouteOrder,
    setIsRoutingActive,
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
          prev.filter((marker) => marker._id !== data.packageId),
        );
        // Also remove from route order if it's there
        setRouteOrder((prev) => prev.filter((id) => id !== data.packageId));

        console.log(
          `🗑️ Removed package ${data.packageId} from map (unavailable)`,
        );

      } else if (data.status === "available") {
        // Add or update marker if available - fetch fresh data
        console.log(
          `🔄 Package ${data.packageId} now available - refreshing data`,
        );
        fetchDeliveries();
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
  ]);
  // Load persisted state on component mount
  useEffect(() => {
    const persistedRouteOrder = localStorage.getItem("deliveryRouteOrder");
    const persistedIsRoutingActive = localStorage.getItem(
      "deliveryIsRoutingActive",
    );
    const persistedUserLocation = localStorage.getItem("deliveryUserLocation");
    const persistedLocationTracking = localStorage.getItem(
      "deliveryLocationTrackingActive",
    );

    if (persistedRouteOrder) {
      setRouteOrder(JSON.parse(persistedRouteOrder));
    }
    if (persistedIsRoutingActive) {
      setIsRoutingActive(JSON.parse(persistedIsRoutingActive));
    }
    if (persistedUserLocation) {
      try {
        const parsedLocation = JSON.parse(persistedUserLocation);
        if (Array.isArray(parsedLocation) && parsedLocation.length === 2) {
          setUserLocation(parsedLocation);
        }
      } catch {
        localStorage.removeItem("deliveryUserLocation");
      }
    }
    if (persistedLocationTracking) {
      setIsLocationTrackingActive(JSON.parse(persistedLocationTracking));
    }
  }, []);

  // Save route state whenever it changes
  useEffect(() => {
    if (routeOrder.length > 0) {
      localStorage.setItem("deliveryRouteOrder", JSON.stringify(routeOrder));
      localStorage.setItem(
        "deliveryIsRoutingActive",
        JSON.stringify(isRoutingActive),
      );
    }
  }, [routeOrder, isRoutingActive]);

  useEffect(() => {
    if (userLocation && Array.isArray(userLocation)) {
      localStorage.setItem("deliveryUserLocation", JSON.stringify(userLocation));
    }
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem(
      "deliveryLocationTrackingActive",
      JSON.stringify(isLocationTrackingActive),
    );
  }, [isLocationTrackingActive]);

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
          address,
        )}`,
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


  // ✅ SINGLE source of truth for drawing a route on the map
  const drawRoute = (order, markers, location) => {
    if (!mapRef.current) {
      console.warn("⚠️ drawRoute: mapRef not ready");
      return;
    }

    // Always clear previous route first
    if (routingControlRef.current) {
      try {
        // Force-clear waypoints first so repeated optimize clicks always redraw
        routingControlRef.current.setWaypoints([]);
      } catch (e) {
        console.warn("Could not clear previous waypoints", e);
      }
      try {
        mapRef.current.removeControl(routingControlRef.current);
      } catch (e) {
        console.warn("Could not remove old routing control", e);
      }
      routingControlRef.current = null;
    }

    if (!order || order.length === 0 || !location) {
      console.log("drawRoute: nothing to draw");
      return;
    }

    const orderedMarkers = order
      .map((id) => markers.find((m) => m._id === id))
      .filter(Boolean);

    if (orderedMarkers.length === 0) return;

    const waypoints = [
      L.latLng(...location),
      ...orderedMarkers.map((m) => L.latLng(...m.position)),
    ];

    console.log(`🗺️ Drawing route with ${waypoints.length} waypoints`);

    try {
      routingControlRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [{ color: "#4f46e5", opacity: 0.85, weight: 6 }],
        },
        createMarker: () => null,
      })
        .on("routesfound", (e) => {
          const routes = e.routes;
          if (!routes || routes.length === 0) return;
          const dist = (routes[0].summary.totalDistance / 1000).toFixed(1);
          const mins = Math.round(routes[0].summary.totalTime / 60);
          console.log(`✅ Route drawn: ${dist} km, ~${mins} min`);
        })
        .on("routingerror", (e) => {
          console.error("❌ Routing error:", e?.error);
        })
        .addTo(mapRef.current);

      setIsRoutingActive(true);
    } catch (err) {
      console.error("drawRoute crashed:", err);
    }
  };

  // Keep route visible and re-draw it after navigation/page return.
  useEffect(() => {
    if (!deliveriesLoaded || !isRoutingActive) return;
    if (!routeOrder || routeOrder.length === 0) return;
    if (!userLocation || !mapRef.current) return;
    // Prevent redraw on every live-location update.
    if (routingControlRef.current) return;

    const validOrder = routeOrder.filter((id) =>
      multipleMarkers.some((m) => m._id === id)
    );

    if (validOrder.length === 0) return;

    drawRoute(validOrder, multipleMarkers, userLocation);
  }, [
    deliveriesLoaded,
    isRoutingActive,
    routeOrder,
    multipleMarkers,
    userLocation,
  ]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Check if permission was previously denied
    if (locationPermissionDenied) {
      setError(
        "Location permission was denied. Please enable it in your browser settings.",
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
          `📍 Location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`,
        );

        setUserLocation([latitude, longitude]);
        setLocationPermissionDenied(false);
        setIsGettingLocation(false);
        setIsLocationTrackingActive(true);
        startContinuousTracking();
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setIsGettingLocation(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            setError(
              "Location access denied. Please allow location permissions in your browser.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable. Check your device settings.",
            );
            break;
          case err.TIMEOUT:
            setError(
              "Location request timed out. Please try again or check your connection.",
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
      },
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLocationTrackingActive(false);
    setIsGettingLocation(false);
    console.log("Stopped live location tracking");
  };

  const getCurrentLocation = () => {
    // Always start/refresh live location when button is clicked.
    startLocationTracking();
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
      },
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
          `🔄 Live update: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`,
        );
      },
      (err) => {
        console.warn("Continuous tracking error:", err.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  const resetLocationPermission = () => {
    setLocationPermissionDenied(false);
    setError(null);
    setUserLocation(null);
    setTimeout(() => startLocationTracking(), 500);
  };

  const refreshLocation = () => {
    console.log("Manually refreshing location...");
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    startLocationTracking();
  };

  const refreshDeliveries = async () => {
    await fetchDeliveries();
  };

  const handleOptimizeRoute = async () => {
    if (!userLocation || multipleMarkers.length === 0) {
      setError(
        "Add at least one delivery stop and ensure your location is detected.",
      );
      return;
    }

    if (!mapRef.current) {
      setError("Map is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always force a fresh redraw before rebuilding route.
      if (routingControlRef.current && mapRef.current) {
        try {
          routingControlRef.current.setWaypoints([]);
        } catch (e) {
          console.warn("Could not clear waypoints before optimize", e);
        }
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn("Could not remove existing route before optimize", e);
        }
        routingControlRef.current = null;
      }

      const response = await optimizationAPI.optimizeRoute({
        userLocation,
        markers: multipleMarkers,
      });

      const data = response.data;

      if (!data?.success || !Array.isArray(data?.data?.optimizedOrder)) {
        throw new Error(data?.error || "Invalid optimization result");
      }

      const newOrder = data.data.optimizedOrder;
      setRouteOrder(newOrder);

      // ✅ Draw using the single centralized function
      drawRoute(newOrder, multipleMarkers, userLocation);

      console.log(`✅ Route optimized: ${newOrder.length} stops`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to optimize route";
      console.error("Optimization error:", error);
      setError(`Failed to optimize route: ${errorMessage}`);

      // Fallback: Use simple unoptimized order
      const fallbackOrder = multipleMarkers.map((m) => m._id);
      setRouteOrder(fallbackOrder);
      drawRoute(fallbackOrder, multipleMarkers, userLocation);
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
    stopLocationTracking();

    // Clear persisted data
    localStorage.removeItem("deliveryRouteOrder");
    localStorage.removeItem("deliveryIsRoutingActive");
    localStorage.removeItem("deliveryUserLocation");
    localStorage.removeItem("deliveryLocationTrackingActive");

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
    isLocationTrackingActive,
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
