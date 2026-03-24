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
    <div className="absolute bottom-20 left-3 z-[5000] w-[calc(100%-1.5rem)] max-w-sm rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:left-8 sm:w-auto sm:max-w-xs">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-slate-800">Optimized Delivery Order:</h4>
        <button
          onClick={onClose}
          className="px-1 text-2xl font-bold leading-none text-slate-500 hover:text-slate-700"
          aria-label="Close optimized order"
        >
          x
        </button>
      </div>
      <ol className="space-y-1 text-sm">
        {safeRouteOrder.map((id, i) => {
          const marker = safeMultipleMarkers.find((m) => m._id === id);
          return (
            <li key={id} className="flex items-center text-slate-700">
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
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
