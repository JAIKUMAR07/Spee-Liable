import React from "react";

const StopsList = ({ stops, onDeleteStop, loading, canDelete = false }) => {
  if (loading) {
    return (
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
        <p className="text-gray-500">Loading stops...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-3">
        My Delivery Stops ({stops.length})
      </h3>

      {/* ✅ UPDATED: Show ownership info */}
      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
        💼 You can manage and delete your own delivery stops
      </div>

      {stops.length > 0 ? (
        <ul className="space-y-2">
          {stops.map((stop, index) => (
            <li
              key={stop._id || index}
              className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100 group"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-800 block">
                  {stop.name}
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  {stop.address}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    stop.available === "available"
                      ? "bg-green-100 text-green-800"
                      : stop.available === "unavailable"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {stop.available || "unknown"}
                </span>
              </div>

              {/* ✅ UPDATED: Always show delete button for drivers (they can only delete their own) */}
              {canDelete || (
                <button
                  onClick={() => onDeleteStop(stop._id, stop.name)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800     ml-2"
                  title="Delete this stop"
                >
                  ❌
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No stops added yet.</p>
      )}
    </div>
  );
};

export default StopsList;
