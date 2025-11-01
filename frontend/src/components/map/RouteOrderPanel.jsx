import React from "react";

const RouteOrderPanel = ({ routeOrder, multipleMarkers }) => {
  if (routeOrder.length === 0) return null;

  return (
    <div className="absolute bottom-8 left-8 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-5000 max-w-xs">
      <h4 className="font-bold text-gray-800 mb-1">
        Optimized Delivery Order:
      </h4>
      <ol className="text-sm space-y-1">
        {routeOrder.map((id, i) => {
          const marker = multipleMarkers.find((m) => m._id === id);
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
