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

  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setError("Could not get your location. Using default center.");
        setUserLocation([20.5937, 78.9629]);
      }
    );
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

      // FILTER: Only include available or unknown status deliveries
      const availableDeliveries = deliveries.filter(
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

      // Don't reset routeOrder here - keep the persisted route
      // setRouteOrder([]);
    } catch (err) {
      setError("Failed to load delivery stops from server.");
    } finally {
      setLoading(false);
    }
  };

  // Recreate route when markers and routeOrder are both available
  useEffect(() => {
    if (routeOrder.length > 0 && multipleMarkers.length > 0 && mapRef.current) {
      recreateRoute();
    }
  }, [routeOrder, multipleMarkers]);

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

    if (orderedMarkers.length === 0) {
      console.log("No valid markers found for persisted route");
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

  const handleOptimizeRoute = async (optimizationAlgorithm) => {
    if (!userLocation || multipleMarkers.length === 0) {
      setError(
        "Add at least one delivery stop and ensure your location is detected."
      );
      return;
    }

    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Use the new optimization algorithm
    const orderedIds = optimizationAlgorithm(userLocation, multipleMarkers);
    setRouteOrder(orderedIds);
    setIsRoutingActive(true);

    // The route will be automatically recreated by the useEffect above
  };

  const handleReset = () => {
    setMultipleMarkers([]);
    setRouteOrder([]);
    setIsRoutingActive(false);
    setError(null);

    // Clear persisted data
    localStorage.removeItem("deliveryRouteOrder");
    localStorage.removeItem("deliveryIsRoutingActive");

    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  };

  // In useMapOperations.js - update the return statement:
  return {
    userLocation,
    searchLocation,
    multipleMarkers,
    loading,
    error,
    routeOrder,
    isRoutingActive,
    setIsRoutingActive, // Add this
    searchInputRef,
    mapRef,
    routingControlRef,
    setError,
    setMultipleMarkers,
    setRouteOrder,
    setSearchLocation,
    getCurrentLocation,
    fetchDeliveries,
    handleOptimizeRoute,
    handleReset,
    refreshDeliveries,
  };
};
