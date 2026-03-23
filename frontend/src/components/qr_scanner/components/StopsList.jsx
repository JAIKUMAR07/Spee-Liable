import React from "react";
import { User, MapPin, Mail, Phone, Trash2 } from "lucide-react";

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
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-900 text-lg block">
                    {stop.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                      stop.available === "available"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : stop.available === "unavailable"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {stop.available || "unknown"}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-2">
                  <div className="flex items-center text-xs text-slate-600 mb-1">
                    <span className="font-semibold mr-1 text-slate-800">📍 Address:</span> {stop.address}
                  </div>
                  <div className="flex items-center text-xs text-slate-600 mb-1">
                    <span className="font-semibold mr-1 text-slate-800">📧 Customer:</span> {stop.customer?.email || 'N/A'}
                  </div>
                  <div className="flex items-center text-xs text-slate-600 mb-1">
                    <span className="font-semibold mr-1 text-slate-800">👤 Name:</span> {stop.customer?.name || 'N/A'}
                  </div>
                  <div className="flex items-center text-xs text-slate-600 mb-1">
                    <span className="font-semibold mr-1 text-slate-800">📱 Mobile:</span> {stop.mobile_number || 'N/A'}
                  </div>
                </div>
              </div>

              {/* ✅ UPDATED: Always show delete button if user has permission */}
              {canDelete && (
                <button
                  onClick={() => onDeleteStop(stop._id, stop.name)}
                  disabled={loading}
                  className="p-2 text-red-100 bg-red-600 hover:bg-red-700 rounded-lg transition-colors ml-4"
                  title="Delete this stop"
                >
                  <Trash2 size={16} />
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
