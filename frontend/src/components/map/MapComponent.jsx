import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

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
    isRoutingActive, // ADD THIS
    setIsRoutingActive, // ADD THIS
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

  useEffect(() => {
    fetchDeliveries();
    getCurrentLocation();
  }, []);

  const handleDeleteStop = async (id, name) => {
    if (!window.confirm(`Mark "${name}" as arrived and remove from list?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/delivery-stops/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete from backend");
      }

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

    const coordinates = await geocodeAddress(locationName);
    if (!coordinates) {
      setError("Location not found");
      return;
    }

    const newMarker = {
      _id: `temp-${Date.now()}`,
      name: locationName,
      address: locationName,
      phone_num: "N/A",
      pincode: "N/A",
      position: coordinates,
    };

    setMultipleMarkers((prev) => [...prev, newMarker]);
    setSearchLocation(null);
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

            <RouteOrderPanel
              routeOrder={routeOrder}
              multipleMarkers={multipleMarkers}
            />
          </MapContainer>
        </div>

        <RouteSummary
          routeOrder={routeOrder}
          multipleMarkers={multipleMarkers}
          isRoutingActive={isRoutingActive} // Add this prop
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
