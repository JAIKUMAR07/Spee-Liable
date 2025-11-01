import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import deliveryAPI from "../qr_scanner/utils/apiClient";

import Layout from "../layout/Layout";
import { useMapOperations } from "./hooks/useMapOperations";
import { reorderMarkersByRoute, geocodeAddress } from "./utils/mapUtils";
import { optimizeRoute2Opt } from "./utils/routeOptimization";
import MapControls from "./MapControls";
import DeliveryMarkers from "./DeliveryMarkers";
import RouteOrderPanel from "./RouteOrderPanel";
import RouteSummary from "./RouteSummary";
import DeleteModal from "./DeleteModal";
import AutoCenterOnLocation from "./AutoCenterOnLocation";

const MapComponent = () => {
  const {
    userLocation,
    searchLocation,
    multipleMarkers,
    loading,
    error,
    routeOrder,
    isRoutingActive,
    setIsRoutingActive,
    locationPermissionDenied, // ADD THIS
    resetLocationPermission, // ADD THIS
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
  } = useMapOperations();

  const [showModal, setShowModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [addingMarker, setAddingMarker] = React.useState(false);

  useEffect(() => {
    fetchDeliveries();
    getCurrentLocation();
  }, []);

  const handleDeleteStop = async (id, name) => {
    if (!window.confirm(`Mark "${name}" as arrived and remove from list?`)) {
      return;
    }

    try {
      // Delete from backend first
      const response = await fetch(
        `http://localhost:5000/api/delivery-stops/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete from backend");
      }

      // Then remove from local state
      setMultipleMarkers((prev) => prev.filter((marker) => marker._id !== id));
      setRouteOrder((prev) => prev.filter((markerId) => markerId !== id));

      alert(`"${name}" marked as arrived and removed successfully!`);
    } catch (error) {
      console.error("Error deleting stop:", error);
      alert("Failed to mark as arrived. Please try again.");
    }
  };

  const handleSearch = async () => {
    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location.");
      return;
    }

    setError(null);
    const coordinates = await geocodeAddress(locationName);
    if (!coordinates) {
      setError("Location not found");
      return;
    }

    setSearchLocation(coordinates);
    if (mapRef.current) mapRef.current.flyTo(coordinates, 15);
  };

  const handleAddMarker = async () => {
    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location to add.");
      return;
    }
    setAddingMarker(true); // Start loading
    try {
      const coordinates = await geocodeAddress(locationName);
      if (!coordinates) {
        setError("Location not found");
        return;
      }

      // Prepare data for backend
      const stopData = {
        name: locationName,
        address: locationName,
        location: {
          lat: coordinates[0],
          lng: coordinates[1],
        },
        mobile_number: "Manually Added",
        available: "unknown",
      };

      // Save to backend using API client
      const response = await deliveryAPI.create(stopData);
      const savedStop = response.data;

      // Update local state
      setMultipleMarkers((prev) => [
        ...prev,
        {
          _id: savedStop._id,
          name: savedStop.name,
          address: savedStop.address,
          phone_num: savedStop.mobile_number,
          pincode: savedStop.pincode || "N/A",
          position: coordinates,
          available: savedStop.available,
        },
      ]);

      setSearchLocation(null);
      searchInputRef.current.value = "";

      alert(`"${locationName}" added successfully and saved to database!`);
    } catch (error) {
      console.error("Error adding stop:", error);
      setError("Failed to add stop. Please try again.");
    } finally {
      setAddingMarker(false); // End loading
    }
  };

  const handleDeleteDeliveries = async () => {
    try {
      setDeleting(true);
      await fetch("http://localhost:5000/api/delivery-marks", {
        method: "DELETE",
      });

      setMultipleMarkers([]);
      setRouteOrder([]);

      if (routingControlRef.current) {
        mapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      setShowModal(false);
    } catch (err) {
      setError("Failed to delete deliveries.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearRoute = () => {
    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setRouteOrder([]);
    setIsRoutingActive(false);

    localStorage.removeItem("deliveryRouteOrder");
    localStorage.removeItem("deliveryIsRoutingActive");

    alert("Route cleared successfully!");
  };

  return (
    <Layout>
      <div className="p-4 bg-green-50 rounded-xl shadow-md space-y-6">
        {/* ADD LOCATION PERMISSION WARNING HERE */}
        {locationPermissionDenied && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">📍 Location access is blocked</p>
            <p className="mt-1">To use automatic location detection:</p>
            <ol className="list-decimal list-inside mt-2 ml-2">
              <li>Click the lock icon (🔒) in your browser's address bar</li>
              <li>Change "Location" permission to "Allow"</li>
              <li>Refresh the page or click "Try Again" below</li>
            </ol>
            <div className="mt-3 flex gap-2">
              <button
                onClick={resetLocationPermission}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                🔃 Refresh Page
              </button>
            </div>
          </div>
        )}

        <MapControls
          searchInputRef={searchInputRef}
          loading={loading}
          error={error}
          multipleMarkers={multipleMarkers}
          onSearch={handleSearch}
          onAddMarker={handleAddMarker}
          onGetLocation={getCurrentLocation}
          onOptimizeRoute={() => handleOptimizeRoute(optimizeRoute2Opt)}
          onReset={handleReset}
          onClearRoute={handleClearRoute}
          isRoutingActive={isRoutingActive}
        />

        <div className="rounded-lg border-2 flex justify-center border-gray-300 p-5 relative">
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

            <AutoCenterOnLocation location={userLocation} />

            <DeliveryMarkers
              userLocation={userLocation}
              searchLocation={searchLocation}
              multipleMarkers={multipleMarkers.filter(
                (marker) =>
                  marker.available === "available" ||
                  !marker.available ||
                  marker.available === "unknown"
              )}
              routeOrder={routeOrder}
              onDeleteStop={handleDeleteStop}
            />
          </MapContainer>

          <RouteOrderPanel
            routeOrder={routeOrder}
            multipleMarkers={multipleMarkers}
          />
        </div>

        <RouteSummary
          routeOrder={routeOrder}
          multipleMarkers={multipleMarkers}
          isRoutingActive={isRoutingActive}
        />

        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
          >
            🗑️ Delete All Deliveries
          </button>
        </div>

        <DeleteModal
          showModal={showModal}
          deleting={deleting}
          onClose={() => setShowModal(false)}
          onDelete={handleDeleteDeliveries}
        />
      </div>
    </Layout>
  );
};

export default MapComponent;
