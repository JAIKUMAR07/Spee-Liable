import React from "react";
import Layout from "../layout/Layout";
import { useDeliveryManagement } from "./hooks/useDeliveryManagement";
import DeliveryCard from "./DeliveryCard";
import { useMapOperations } from "../map/hooks/useMapOperations";
import { personalStopsAPI } from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

const DeliveryManagement = () => {
  const {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    toggleAvailability,
    deleteDelivery,
    setError,
  } = useDeliveryManagement();

  const { refreshDeliveries } = useMapOperations();
  const { user, can } = useAuth();
  const [personalStops, setPersonalStops] = React.useState([]);

  const fetchPersonalStops = async () => {
    try {
      const response = await personalStopsAPI.getAll();
      const apiResponse = response.data;
      if (apiResponse.success) {
        setPersonalStops(apiResponse.data || []);
      } else {
        setPersonalStops([]);
      }
    } catch {
      setPersonalStops([]);
    }
  };

  React.useEffect(() => {
    fetchPersonalStops();
  }, []);

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      if (!can("manage_deliveries")) {
        alert("You don't have permission to manage deliveries");
        return;
      }

      await toggleAvailability(id, currentStatus);
      await refreshDeliveries();

      const newStatus =
        currentStatus === "available" ? "unavailable" : "available";
      if (newStatus === "unavailable") {
        alert("Stop marked as unavailable and removed from map routing.");
      } else {
        alert("Stop marked as available and added to map routing.");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteDelivery = async (id) => {
    const hasDeletePermission =
      can("delete_records") || can("delete_own_records");

    if (!hasDeletePermission) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    try {
      await deleteDelivery(id);
      alert("Delivery stop deleted successfully!");
    } catch {
      alert("Failed to delete delivery");
    }
  };

  const handleDeletePersonalStop = async (id, name) => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to delete personal stops");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await personalStopsAPI.delete(id);
      setPersonalStops((prev) => prev.filter((stop) => stop._id !== id));
      alert("Personal stop deleted successfully!");
    } catch {
      alert("Failed to delete personal stop");
    }
  };

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  const availableDeliveries = safeDeliveries.filter(
    (d) => d.available === "available"
  );
  const unavailableDeliveries = safeDeliveries.filter(
    (d) => d.available === "unavailable"
  );
  const unknownDeliveries = safeDeliveries.filter(
    (d) => !d.available || d.available === "unknown"
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deliveries...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Delivery Management
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your delivery stops and their availability status. You can
              only see and manage stops assigned to you.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Currently viewing stops for: <strong>{user?.name}</strong>
            </p>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-800 font-bold"
                >
                  x
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <button
              onClick={() => {
                fetchDeliveries();
                fetchPersonalStops();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Refresh List
            </button>
          </div>

          {personalStops.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-orange-700 mb-6 flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                Personal Stops ({personalStops.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalStops.map((stop) => (
                  <div
                    key={stop._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {stop.name || "Personal Stop"}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        personal
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">Reason:</span>
                        <p className="text-sm">{stop.reason}</p>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">Address:</span>
                        <p className="text-sm">{stop.address}</p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDeletePersonalStop(
                          stop._id,
                          stop.name || "Personal Stop"
                        )
                      }
                      className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 py-2.5 px-4 rounded-xl font-bold text-sm transition shadow-sm hover:shadow"
                    >
                      Delete Personal Stop
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {availableDeliveries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Available Delivery Stops ({availableDeliveries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery._id}
                    delivery={delivery}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDeleteDelivery}
                    canManage={can("manage_deliveries")}
                    canDelete={can("delete_records") || can("delete_own_records")}
                  />
                ))}
              </div>
            </section>
          )}

          {unavailableDeliveries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                Unavailable Delivery Stops ({unavailableDeliveries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unavailableDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery._id}
                    delivery={delivery}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDeleteDelivery}
                    canManage={can("manage_deliveries")}
                    canDelete={can("delete_records") || can("delete_own_records")}
                  />
                ))}
              </div>
            </section>
          )}

          {unknownDeliveries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-yellow-700 mb-6 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                Unknown Status ({unknownDeliveries.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unknownDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery._id}
                    delivery={delivery}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDeleteDelivery}
                    canManage={can("manage_deliveries")}
                    canDelete={can("delete_records") || can("delete_own_records")}
                  />
                ))}
              </div>
            </section>
          )}

          {safeDeliveries.length === 0 && personalStops.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">[]</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No stops found
              </h3>
              <p className="text-gray-500">
                Add delivery or personal stops first.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryManagement;
