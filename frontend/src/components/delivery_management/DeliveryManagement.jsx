import React from "react";
import Layout from "../layout/Layout";
import { useDeliveryManagement } from "./hooks/useDeliveryManagement";
import DeliveryCard from "./DeliveryCard";
import { useMapOperations } from "../map/hooks/useMapOperations";
import { useAuth } from "../../context/AuthContext"; // ✅ Add auth hook

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
  const { user } = useAuth();
  const { can } = useAuth(); // ✅ Get permission checks

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      // ✅ Check permission before action
      if (!can("manage_deliveries")) {
        alert("You don't have permission to manage deliveries");
        return;
      }

      await toggleAvailability(id, currentStatus);

      // Refresh the map to reflect changes
      await refreshDeliveries();

      // Show success message based on new status
      const newStatus =
        currentStatus === "available" ? "unavailable" : "available";
      if (newStatus === "unavailable") {
        alert("Stop marked as unavailable and removed from map routing.");
      } else {
        alert("Stop marked as available and added to map routing.");
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDeleteDelivery = async (id) => {
    // ✅ Check permission before deletion
    if (!can("delete_records")) {
      alert("You don't have permission to delete delivery stops");
      return;
    }
    if (!can("delete_own_records")) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    try {
      await deleteDelivery(id);
      alert("Delivery stop deleted successfully!");
    } catch (error) {
      alert("Failed to delete delivery");
    }
  };

  // FIX: Ensure deliveries is always an array before using filter
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  // Filter deliveries by status
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
          {/* Header */}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Delivery Management
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your delivery stops and their availability status. You can
              only see and manage stops assigned to you.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              👤 Currently viewing stops for: <strong>{user?.name}</strong>
            </p>
          </div>
          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-800 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {/* Refresh Button */}
          <div className="text-center mb-8">
            <button
              onClick={fetchDeliveries}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              🔄 Refresh List
            </button>
          </div>
          {/* Available Deliveries */}
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
                    onDelete={handleDeleteDelivery} // ✅ Use the wrapped function
                    canManage={can("manage_deliveries")} // ✅ Pass permission to card
                    canDelete={can("delete_records")} // ✅ Pass permission to card
                  />
                ))}
              </div>
            </section>
          )}
          {/* Unavailable Deliveries */}
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
                    onDelete={handleDeleteDelivery} // ✅ Use the wrapped function
                    canManage={can("manage_deliveries")}
                    canDelete={can("delete_records")}
                  />
                ))}
              </div>
            </section>
          )}
          {/* Unknown Status Deliveries */}
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
                    onDelete={handleDeleteDelivery} // ✅ Use the wrapped function
                    canManage={can("manage_deliveries")}
                    canDelete={can("delete_records")}
                  />
                ))}
              </div>
            </section>
          )}
          {/* Empty State */}
          {safeDeliveries.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No delivery stops found
              </h3>
              <p className="text-gray-500">
                Add some delivery stops using the QR scanner first.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryManagement;
