import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { deliveryStopsAPI } from "../../utils/apiClient"; // ✅ Updated import
import { useAuth } from "../../context/AuthContext"; // ✅ Add auth hook

import { useSocket } from "../../context/SocketContext"; // ADD THIS

import Layout from "../layout/Layout";
import { useMapOperations } from "./hooks/useMapOperations";
import { geocodeAddress } from "./utils/mapUtils";

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
    locationPermissionDenied,
    resetLocationPermission,
    isGettingLocation,
    searchInputRef,
    mapRef,
    routingControlRef,
    setError,
    setMultipleMarkers,
    setRouteOrder,
    setSearchLocation,
    getCurrentLocation,
    refreshLocation,
    fetchDeliveries,
    handleOptimizeRoute,
    handleReset,
  } = useMapOperations();

  const { can } = useAuth(); // ✅ Get permission checks
  const socket = useSocket(); // ADD THIS
  const [showModal, setShowModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [addingMarker, setAddingMarker] = React.useState(false);

  // ✅ REAL-TIME UPDATES: Listen for package status changes
  useEffect(() => {
    if (!socket) return;

    const handlePackageStatusChanged = (data) => {
      console.log("Real-time package update received:", data);

      // Update markers based on status change
      if (data.status === "unavailable") {
        // Remove marker from map if unavailable
        setMultipleMarkers((prev) =>
          prev.filter((marker) => marker._id !== data.packageId)
        );
        // Also remove from route order if it's there
        setRouteOrder((prev) => prev.filter((id) => id !== data.packageId));
      } else if (data.status === "available") {
        // Add or update marker if available
        // We need to fetch the updated package data
        fetchDeliveries();
      }

      // Show notification to driver
    };

    socket.on("package-status-changed", handlePackageStatusChanged);

    // Cleanup
    return () => {
      socket.off("package-status-changed", handlePackageStatusChanged);
    };
  }, [socket, setMultipleMarkers, setRouteOrder, fetchDeliveries]);

  useEffect(() => {
    fetchDeliveries();
    getCurrentLocation();
  }, []);
  // ✅ Socket connection status indicator
  useEffect(() => {
    if (socket) {
      console.log("✅ Socket is available in MapComponent");
    } else {
      console.log("⏳ Socket not available yet in MapComponent");
    }
  }, [socket]);

  // ✅ UPDATED: Use API client and add permission check
  // ✅ UPDATED: Use API client and add permission check with auto-optimization
  const handleDeleteStop = async (id, name) => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to mark deliveries as arrived");
      return;
    }

    if (!window.confirm(`Mark "${name}" as arrived and remove from list?`)) {
      return;
    }

    try {
      // ✅ Using API client instead of direct fetch
      await deliveryStopsAPI.delete(id);

      // Then remove from local state
      setMultipleMarkers((prev) => prev.filter((marker) => marker._id !== id));
      setRouteOrder((prev) => prev.filter((markerId) => markerId !== id));

      // ✅ TRIGGER AUTO-OPTIMIZATION after deleting marker
      if (isRoutingActive) {
        console.log("🔄 Triggering auto-optimization after deleting marker");
        // Use setTimeout to ensure state updates complete first
        setTimeout(() => {
          handleOptimizeRoute(); // Use the existing optimize function
        }, 500);
      }

      alert(`"${name}" marked as arrived and removed successfully!`);
    } catch (error) {
      console.error("Error deleting stop:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to mark as arrived. Please try again.";
      alert(errorMessage);
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

  // ✅ UPDATED: Add permission check for adding markers
  const handleAddMarker = async () => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to add delivery stops");
      return;
    }

    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location to add.");
      return;
    }

    setAddingMarker(true);
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

      // ✅ Using API client
      const response = await deliveryStopsAPI.create(stopData);
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
      const errorMessage =
        error.response?.data?.error || "Failed to add stop. Please try again.";
      setError(errorMessage);
    } finally {
      setAddingMarker(false);
    }
  };

  // ✅ UPDATED: Add permission check for bulk deletion
  const handleDeleteDeliveries = async () => {
    if (!can("delete_records")) {
      alert("You don't have permission to delete all deliveries");
      return;
    }

    try {
      setDeleting(true);
      // ✅ Using API client - Note: You'll need to add this to your apiClient
      await deliveryStopsAPI.deleteAll(); // This should call /api/delivery-marks

      setMultipleMarkers([]);
      setRouteOrder([]);

      if (routingControlRef.current) {
        mapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      setShowModal(false);
      alert("All deliveries deleted successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to delete deliveries.";
      setError(errorMessage);
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
        {/* Location Permission Warning */}
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
          onOptimizeRoute={handleOptimizeRoute}
          onReset={handleReset}
          onClearRoute={handleClearRoute}
          isRoutingActive={isRoutingActive}
          isGettingLocation={isGettingLocation}
          canAddMarker={can("manage_deliveries")} // ✅ Pass permissions
          canOptimizeRoute={can("optimize_routes")}
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
              routeOrder={routeOrder || []} // ✅ ADD SAFETY CHECK
              onDeleteStop={handleDeleteStop}
              canManage={can("manage_deliveries")}
            />
          </MapContainer>

          <RouteOrderPanel
            routeOrder={routeOrder || []} // ✅ ADD SAFETY CHECK
            multipleMarkers={multipleMarkers}
          />
        </div>

        <RouteSummary
          routeOrder={routeOrder}
          multipleMarkers={multipleMarkers}
          isRoutingActive={isRoutingActive}
        />

        {/* ✅ Only show delete all button if user has permission */}
        {can("delete_records") && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
            >
              🗑️ Delete All Deliveries
            </button>
          </div>
        )}

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
