import React from "react";

const RouteOrderPanel = ({
  routeOrder = [],
  multipleMarkers = [],
  onClose,
}) => {
  // ✅ ADD SAFETY CHECKS
  const safeRouteOrder = Array.isArray(routeOrder) ? routeOrder : [];
  const safeMultipleMarkers = Array.isArray(multipleMarkers)
    ? multipleMarkers
    : [];

  if (safeRouteOrder.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-8 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-[5000] max-w-xs">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-gray-800">Optimized Delivery Order:</h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none font-bold px-1"
          aria-label="Close optimized order"
        >
          x
        </button>
      </div>
      <ol className="text-sm space-y-1">
        {safeRouteOrder.map((id, i) => {
          const marker = safeMultipleMarkers.find((m) => m._id === id);
          return (
            <li key={id} className="flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                {i + 1}
              </span>
              {marker?.name || "Unknown"}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default RouteOrderPanel;
