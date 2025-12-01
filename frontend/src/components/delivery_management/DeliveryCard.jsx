import React from "react";

const DeliveryCard = ({
  delivery,
  onToggleAvailability,
  onDelete,
  canManage = true, // ✅ Default to true for backward compatibility
  canDelete = false, // ✅ Default to false for security
}) => {
  const handleToggle = async () => {
    if (!canManage) {
      alert("You don't have permission to manage delivery status");
      return;
    }

    try {
      await onToggleAvailability(delivery._id, delivery.available);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${delivery.name}"?`)) {
      onDelete(delivery._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with name and status */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 truncate">
          {delivery.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            delivery.available === "available"
              ? "bg-green-100 text-green-800"
              : delivery.available === "unavailable"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {delivery.available || "unknown"}
        </span>
      </div>

      {/* Delivery Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <span className="mr-2">📍</span>
          <p className="text-sm">{delivery.address}</p>
        </div>

        <div className="flex items-center text-gray-600">
          <span className="mr-2">📱</span>
          <p className="text-sm">{delivery.mobile_number}</p>
        </div>

        {delivery.location && (
          <div className="flex items-center text-gray-600">
            <span className="mr-2">🎯</span>
            <p className="text-sm">
              Lat: {delivery.location.lat?.toFixed(4)}, Lng:{" "}
              {delivery.location.lng?.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Conditionally rendered based on permissions */}
      <div className="flex justify-between items-center space-x-2">
        <button
          onClick={handleToggle}
          disabled={!canManage} // ✅ Disable if no permission
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            delivery.available === "available"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          } ${!canManage ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {delivery.available === "available"
            ? "Mark Unavailable"
            : "Mark Available"}
        </button>

        {canDelete && ( // ✅ Only show delete button if user has permission
          <button
            onClick={handleDelete}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Status Message */}
      {delivery.available === "unavailable" && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ⚠️ This stop will be excluded from route optimization
        </div>
      )}

      {/* Permission Notice for Viewers */}
      {!canManage && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          👀 View only - Contact admin for changes
        </div>
      )}
    </div>
  );
};

export default DeliveryCard;
