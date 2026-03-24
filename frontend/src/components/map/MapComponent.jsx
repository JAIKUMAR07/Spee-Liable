import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import {
  deliveryStopsAPI,
  deliveryMarksAPI,
  personalStopsAPI,
} from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

import Layout from "../layout/Layout";
import { useMapOperations } from "./hooks/useMapOperations";
import { geocodeAddress } from "./utils/mapUtils";

import MapControls from "./MapControls";
import DeliveryMarkers from "./DeliveryMarkers";
import RouteOrderPanel from "./RouteOrderPanel";
import RouteInstructionsPanel from "./RouteInstructionsPanel";
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
    routeInstructions,
    showRouteInstructions,
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
    setRouteInstructions,
    setShowRouteInstructions,
    setSearchLocation,
    getCurrentLocation,
    fetchDeliveries,
    handleOptimizeRoute,
    handleReset,
  } = useMapOperations();

  const { can } = useAuth();
  const [showModal, setShowModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showRouteOrderPanel, setShowRouteOrderPanel] = React.useState(false);
  const [, setAddingMarker] = React.useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleDeleteStop = async (id, name, isPersonal) => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to modify stops");
      return;
    }

    if (!window.confirm(`Mark "${name}" as finished and remove from list?`)) {
      return;
    }

    try {
      if (isPersonal) {
        await personalStopsAPI.delete(id);
      } else {
        await deliveryStopsAPI.delete(id);
      }

      setMultipleMarkers((prev) => prev.filter((marker) => marker._id !== id));
      setRouteOrder((prev) => prev.filter((markerId) => markerId !== id));

      if (isRoutingActive) {
        console.log("Route remains active after stop removal.");
      }

      alert(`"${name}" marked as arrived and removed successfully!`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to mark as arrived. Please try again.";
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

  const handleAddPersonalMarker = async (reason) => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to add personal stops");
      return;
    }

    const locationName = searchInputRef.current.value.trim();
    if (!locationName) {
      setError("Please enter a location to add a personal stop.");
      return;
    }

    setAddingMarker(true);
    try {
      const coordinates = await geocodeAddress(locationName);
      if (!coordinates) {
        setError("Location not found");
        return;
      }

      const stopData = {
        reason,
        address: locationName,
        location: {
          lat: coordinates[0],
          lng: coordinates[1],
        },
      };

      const response = await personalStopsAPI.create(stopData);
      const savedStop = response.data.data;

      setMultipleMarkers((prev) => [
        ...prev,
        {
          _id: savedStop._id,
          name: savedStop.name,
          reason: savedStop.reason,
          address: savedStop.address,
          phone_num: "N/A",
          pincode: "N/A",
          position: coordinates,
          available: "available",
          isPersonal: true,
        },
      ]);

      setSearchLocation(null);
      searchInputRef.current.value = "";
      alert("Personal stop added successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to add personal stop.";
      setError(errorMessage);
    } finally {
      setAddingMarker(false);
    }
  };

  const handleDeleteDeliveries = async () => {
    if (!can("delete_records")) {
      alert("You don't have permission to delete all deliveries");
      return;
    }

    try {
      setDeleting(true);
      await deliveryMarksAPI.deleteAll();

      setMultipleMarkers([]);
      setRouteOrder([]);
      setRouteInstructions([]);
      setShowRouteInstructions(false);
      setShowRouteOrderPanel(false);

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
    setRouteInstructions([]);
    setShowRouteInstructions(false);
    setShowRouteOrderPanel(false);
    setIsRoutingActive(false);

    localStorage.removeItem("deliveryRouteOrder");
    localStorage.removeItem("deliveryIsRoutingActive");

    alert("Route cleared successfully!");
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-132px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-7xl space-y-5 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm sm:p-6">
          {locationPermissionDenied && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
              <p className="font-semibold">Location access is blocked</p>
              <p className="mt-1">To use automatic location detection:</p>
              <ol className="ml-2 mt-2 list-inside list-decimal text-sm">
                <li>Click the lock icon in your browser&apos;s address bar</li>
                <li>Change "Location" permission to "Allow"</li>
                <li>Refresh the page or click "Try Again" below</li>
              </ol>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={resetLocationPermission}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Refresh Page
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
            onAddPersonalMarker={handleAddPersonalMarker}
            onGetLocation={getCurrentLocation}
            onOptimizeRoute={handleOptimizeRoute}
            onReset={handleReset}
            onClearRoute={handleClearRoute}
            isRoutingActive={isRoutingActive}
            isGettingLocation={isGettingLocation}
            canAddMarker={can("manage_deliveries")}
            canOptimizeRoute={can("optimize_routes")}
          />

          <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
            <MapContainer
              ref={mapRef}
              center={userLocation || [20.5937, 78.9629]}
              zoom={13}
              style={{ height: "68vh", minHeight: "420px", width: "100%" }}
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
                routeOrder={routeOrder || []}
                onDeleteStop={handleDeleteStop}
                canManage={can("manage_deliveries")}
              />
            </MapContainer>

            {isRoutingActive && routeOrder.length > 0 && !showRouteOrderPanel && (
              <button
                onClick={() => setShowRouteOrderPanel((prev) => !prev)}
                className="absolute bottom-4 left-3 z-[5001] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-50 sm:bottom-6 sm:left-6"
              >
                Show Order
              </button>
            )}

            {showRouteOrderPanel && (
              <RouteOrderPanel
                routeOrder={routeOrder || []}
                multipleMarkers={multipleMarkers}
                onClose={() => setShowRouteOrderPanel(false)}
              />
            )}

            {isRoutingActive &&
              routeInstructions.length > 0 &&
              !showRouteInstructions && (
                <button
                  onClick={() => setShowRouteInstructions((prev) => !prev)}
                  className="absolute right-3 top-4 z-[5001] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-50 sm:right-6 sm:top-6"
                >
                  Show Directions
                </button>
              )}

            {showRouteInstructions && (
              <RouteInstructionsPanel
                instructions={routeInstructions}
                isRoutingActive={isRoutingActive}
                onClose={() => setShowRouteInstructions(false)}
              />
            )}
          </div>

          <RouteSummary
            routeOrder={routeOrder}
            multipleMarkers={multipleMarkers}
            isRoutingActive={isRoutingActive}
          />

          {can("delete_records") && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete All Deliveries
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
      </section>
    </Layout>
  );
};

export default MapComponent;
