import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

import Layout from "../layout/Layout";
import { useMapOperations } from "./hooks/useMapOperations";
import { reorderMarkersByRoute, geocodeAddress } from "./utils/mapUtils";
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
    searchInputRef,
    mapRef,
    setError,
    setMultipleMarkers,
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

      // Clear markers and route order
      setMultipleMarkers([]);
      setRouteOrder([]);

      // Remove the routing path from the map
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

  return (
    <Layout>
      <div className="p-4 bg-white rounded-xl shadow-md space-y-6">
        <MapControls
          searchInputRef={searchInputRef}
          loading={loading}
          error={error}
          multipleMarkers={multipleMarkers}
          onSearch={handleSearch}
          onAddMarker={handleAddMarker}
          onGetLocation={getCurrentLocation}
          onOptimizeRoute={() => handleOptimizeRoute(reorderMarkersByRoute)}
          onReset={handleReset}
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
              multipleMarkers={multipleMarkers}
              routeOrder={routeOrder}
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
          onDelete={handleDeleteDeliveries} // Just pass one function
        />
      </div>
    </Layout>
  );
};

export default MapComponent;
