import { useState, useRef } from "react";
import L from "leaflet";

export const useMapOperations = () => {
  //stores the current user’s latitude & longitude.
  const [userLocation, setUserLocation] = useState(null);

  const [searchLocation, setSearchLocation] = useState(null);
  // array of delivery stop markers (position, name, address, etc.).
  const [multipleMarkers, setMultipleMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //stores order of stops after optimizing route.
  const [routeOrder, setRouteOrder] = useState([]);

  //It’s true when you’ve optimized a route (user location → delivery stops).
  //It’s false when there’s no route or you’ve reset the map.
  const [isRoutingActive, setIsRoutingActive] = useState(false);

  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  // user current locaiton
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

  // Fetch delivery stops from backend
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/delivery-stops");
      if (!res.ok) throw new Error("Failed to fetch deliveries");

      // getting delivery details
      const deliveries = await res.json();

      // add into markers component for displaying on map
      const updatedMarkers = [];

      for (const delivery of deliveries) {
        // not compalsary that if they can add delivery   lcoaiton or address only
        if (
          delivery.location &&
          delivery.location.lat &&
          delivery.location.lng
        ) {
          updatedMarkers.push({
            _id: delivery._id,
            name: delivery.name || "Unknown",
            address: delivery.address,
            phone_num: delivery.mobile_number || "N/A",
            pincode: delivery.pincode || "N/A",
            position: [delivery.location.lat, delivery.location.lng],
          });
        } else {
          const fullAddress = `${delivery.address}, ${delivery.pincode || ""}`;
          // getting coordinates from  address but may be #remove
          const coordinates = await geocodeAddress(fullAddress);
          if (coordinates) {
            updatedMarkers.push({
              _id: delivery._id,
              name: delivery.name || "Unknown",
              address: delivery.address,
              phone_num: delivery.mobile_number || "N/A",
              pincode: delivery.pincode || "N/A",
              position: coordinates,
            });
          }
        }
      }

      setMultipleMarkers(updatedMarkers);
      setRouteOrder([]);
    } catch (err) {
      setError("Failed to load delivery stops from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = async (reorderMarkersByRoute) => {
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

    const waypoints = [
      L.latLng(...userLocation),
      ...multipleMarkers.map((m) => L.latLng(...m.position)),
    ];

    // create routing path
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
        const orderedIds = reorderMarkersByRoute(
          multipleMarkers,
          routes[0].coordinates
        );

        setRouteOrder(orderedIds);
        alert(`Route optimized! Total: ${totalDistance} km, ~${totalTime} min`);
      })
      .addTo(mapRef.current);

    setIsRoutingActive(true);
  };

  const handleReset = () => {
    setMultipleMarkers([]);
    setRouteOrder([]);
    setIsRoutingActive(false);
    setError(null);

    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
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
    setRouteOrder, // This must be included
    routingControlRef,
    searchInputRef,
    mapRef,
    setError,
    setMultipleMarkers,
    setRouteOrder,
    getCurrentLocation,
    fetchDeliveries,
    handleOptimizeRoute,
    handleReset,
  };
};
