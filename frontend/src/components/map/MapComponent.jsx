import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Layout from "../layout/Layout";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom numbered icon for route order
const createNumberedIcon = (number) =>
  new L.DivIcon({
    className: "custom-div-icon",
    html: `
      <div style="position: relative; width: 25px; height: 41px;">
        <img src="${markerIcon}" style="width: 25px; height: 41px;" />
        <div style="
          position: absolute; 
          top: 3px; 
          left: 0; 
          width: 25px; 
          text-align: center; 
          color: white; 
          font-weight: bold; 
          font-size: 12px; 
          text-shadow: 1px 1px 1px rgba(0,0,0,0.7);
          background-color: rgba(0,0,0,0.5);
          border-radius: 50%;
          padding: 1px;
        ">
          ${number}
        </div>
      </div>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

// Component to auto-center map when user location changes
const AutoCenterOnLocation = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location && map) {
      map.flyTo(location, 15);
    }
  }, [location, map]);
  return null;
};

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [multipleMarkers, setMultipleMarkers] = useState([]); // From DB or manual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [routeOrder, setRouteOrder] = useState([]); // Optimized delivery order [id1, id2, ...]
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  // Load deliveries from backend on mount
  useEffect(() => {
    fetchDeliveries();
    getCurrentLocation();
  }, []);

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
        setUserLocation([20.5937, 78.9629]); // India center fallback
      }
    );
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Change this URL to match your local backend
      const res = await fetch("http://localhost:5000/api/delivery-stops");
      if (!res.ok) throw new Error("Failed to fetch deliveries");

      const deliveries = await res.json();

      const updatedMarkers = [];
      for (const delivery of deliveries) {
        // If location is already geocoded in your QR data, use it directly
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
          // Fallback to geocoding if no coordinates
          const fullAddress = `${delivery.address}, ${delivery.pincode || ""}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              fullAddress
            )}&format=json&limit=1`
          );
          const data = await response.json();
          if (data.length > 0) {
            updatedMarkers.push({
              _id: delivery._id,
              name: delivery.name || "Unknown",
              address: delivery.address,
              phone_num: delivery.mobile_number || "N/A",
              pincode: delivery.pincode || "N/A",
              position: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
            });
          }
        }
      }
      setMultipleMarkers(updatedMarkers);
      setRouteOrder([]); // Reset optimized order
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Failed to load delivery stops from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationName
        )}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length === 0) throw new Error("Location not found");

      const latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setSearchLocation(latlng);
      if (mapRef.current) mapRef.current.flyTo(latlng, 15);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarker = async () => {
    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location to add.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationName
        )}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length === 0) throw new Error("Location not found");

      const latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

      // Create dummy record for frontend only
      const newMarker = {
        _id: `temp-${Date.now()}`,
        name: locationName,
        address: locationName,
        phone_num: "N/A",
        pincode: "N/A",
        position: latlng,
      };

      setMultipleMarkers((prev) => [...prev, newMarker]);
      setSearchLocation(null); // Clear search result after adding
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = async () => {
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

    // Prepare waypoints: [driver_location, stop1, stop2, ...]
    const waypoints = [
      L.latLng(...userLocation),
      ...multipleMarkers.map((m) => L.latLng(...m.position)),
    ];

    // Show route without markers
    routingControlRef.current = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      show: false,
      lineOptions: {
        styles: [{ color: "#0066ff", opacity: 0.7, weight: 5 }],
      },
      createMarker: () => null, // Hide default markers
    })
      .on("routesfound", (e) => {
        const routes = e.routes;
        if (routes.length === 0) return;

        // Get the actual sequence of points (excluding start)
        const pathPoints = routes[0].coordinates;

        // Calculate total distance and time (optional)
        const totalDistance = routes[0].summary.totalDistance / 1000; // km
        const totalTime = Math.round(routes[0].summary.totalTime / 60); // minutes

        // Reorder markers based on route proximity (greedy approach)
        const orderedIds = reorderMarkersByRoute(multipleMarkers, pathPoints);

        setRouteOrder(orderedIds);
        alert(
          `Route optimized! Total: ${totalDistance.toFixed(
            1
          )} km, ~${totalTime} min`
        );
      })
      .addTo(mapRef.current);

    setIsRoutingActive(true);
  };

  // Simple greedy reordering: Find nearest neighbor
  const reorderMarkersByRoute = (markers, routeCoords) => {
    if (markers.length <= 1) return markers.map((m) => m._id);

    const firstStop = routeCoords[1]; // First delivery point after driver
    let remaining = [...markers];
    const ordered = [];

    // Start from driver's location -> find closest stop
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

  const handleDeleteDeliveries = async () => {
    try {
      setDeleting(true);
      await fetch("https://delivery-tw6a.onrender.com/api/delivery/all", {
        method: "DELETE",
      });
      setMultipleMarkers([]);
      setRouteOrder([]);
      setShowModal(false);
      setIsRoutingActive(false);
      if (routingControlRef.current) {
        mapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    } catch (err) {
      console.error("Error deleting deliveries:", err);
      setError("Failed to delete deliveries.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReset = () => {
    setMultipleMarkers([]);
    setRouteOrder([]);
    setIsRoutingActive(false);
    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setError(null);
  };

  return (
    <Layout>
      <div className="p-4 bg-white rounded-xl shadow-md space-y-6">
        {/* Search & Controls */}
        <div className="flex flex-col items-center space-y-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Enter address, landmark, or pincode..."
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {loading ? "Searching..." : "🔍 Search"}
            </button>

            <button
              onClick={handleAddMarker}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              ➕ Add Stop
            </button>

            <button
              onClick={getCurrentLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📍 My Location
            </button>

            <button
              onClick={handleOptimizeRoute}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              disabled={multipleMarkers.length === 0}
            >
              🧭 Optimize Route
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              🗑️ Reset
            </button>
          </div>

          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md border border-red-300 w-full max-w-md text-center">
              {error}
            </div>
          )}
        </div>
        {/* Map */}
        <div className="rounded-lg border border-gray-300 relative">
          <MapContainer
            ref={mapRef}
            center={userLocation || [20.5937, 78.9629]}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Auto-center on user location */}
            <AutoCenterOnLocation location={userLocation} />

            {/* Driver's location */}
            {userLocation && (
              <Marker position={userLocation} icon={redIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Search result marker */}
            {searchLocation &&
              !multipleMarkers.some(
                (m) => m.position[0] === searchLocation[0]
              ) && (
                <Marker position={searchLocation} icon={redIcon}>
                  <Popup>Searched Location</Popup>
                </Marker>
              )}

            {/* Delivery markers with route numbers */}
            {/* Delivery markers with numbered blue icons */}
            {/* Delivery markers with numbered blue icons - Always show numbers */}
            {multipleMarkers.map((marker, index) => {
              const isOptimized = routeOrder.includes(marker._id);
              const orderIndex = routeOrder.indexOf(marker._id) + 1;
              const displayNumber = isOptimized ? orderIndex : index + 1;

              const blueNumberedIcon = new L.DivIcon({
                className: "custom-div-icon",
                html: `
      <div style="position: relative; width: 30px; height: 41px;">
        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="width: 30px; height: 41px;" />
        <div style="
          position: absolute; 
          top: 3px; 
          left: 0; 
          width: 30px; 
          text-align: center; 
          color: white; 
          font-weight: 900; 
          font-size: 16px; 
          text-shadow: 
            1px 1px 3px #000000,
            -1px -1px 3px #000000,
            1px -1px 3px #000000,
            -1px 1px 3px #000000,
            0px 0px 4px #000000;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          line-height: 22px;
          margin-left: 4px;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
        ">
          ${displayNumber}
        </div>
      </div>`,
                iconSize: [30, 41],
                iconAnchor: [15, 41],
                popupAnchor: [1, -34],
              });

              return (
                <Marker
                  key={marker._id}
                  position={marker.position}
                  icon={blueNumberedIcon}
                >
                  <Popup>
                    <div className="text-sm space-y-1 font-medium min-w-[200px]">
                      <div className="font-semibold text-blue-800">
                        {marker.name}
                      </div>
                      <div className="text-gray-600">📍 {marker.address}</div>
                      {marker.phone_num !== "N/A" && (
                        <div className="text-gray-600">
                          📱 {marker.phone_num}
                        </div>
                      )}
                      {marker.pincode !== "N/A" && (
                        <div className="text-gray-600">📦 {marker.pincode}</div>
                      )}
                      {isOptimized ? (
                        <div className="mt-2 p-1 bg-green-100 text-green-800 text-xs rounded text-center font-bold">
                          ✅ Optimized Stop #{orderIndex}
                        </div>
                      ) : (
                        <div className="mt-2 p-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                          📍 Stop #{index + 1}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {/* Show route order list below map */}
            {routeOrder.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 max-w-xs">
                <h4 className="font-bold text-gray-800 mb-1">
                  Optimized Delivery Order:
                </h4>
                <ol className="text-sm space-y-1">
                  {routeOrder.map((id, i) => {
                    const marker = multipleMarkers.find((m) => m._id === id);
                    return (
                      <li key={id} className="flex items-center">
                        <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                          {i + 1}
                        </span>
                        {marker?.name || "Unknown"}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </MapContainer>
        </div>
        {/* Route Summary */}
        {/* Route Summary */}
        {routeOrder.length > 0 ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">
              ✅ Route Optimized!
            </h4>
            <p className="text-green-700 text-sm">
              You have {routeOrder.length} stops optimized for efficient
              delivery.
            </p>
          </div>
        ) : multipleMarkers.length > 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">
              📍 Delivery Stops Ready
            </h4>
            <p className="text-blue-700 text-sm">
              You have {multipleMarkers.length} stops. Click "Optimize Route" to
              plan the best path.
            </p>
          </div>
        ) : null}{" "}
        {/* Route Summary */}
        {routeOrder.length > 0 ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">
              ✅ Route Optimized!
            </h4>
            <p className="text-green-700 text-sm">
              You have {routeOrder.length} stops optimized for efficient
              delivery.
            </p>
          </div>
        ) : multipleMarkers.length > 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">
              📍 Delivery Stops Ready
            </h4>
            <p className="text-blue-700 text-sm">
              You have {multipleMarkers.length} stops. Click "Optimize Route" to
              plan the best path.
            </p>
          </div>
        ) : null}
        {/* Delete All Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
          >
            🗑️ Delete All Deliveries
          </button>
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete <strong>all</strong> delivery
                records? This cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeliveries}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete All"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MapComponent;
