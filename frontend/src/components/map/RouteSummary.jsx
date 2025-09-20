import React from "react";

const RouteSummary = ({ routeOrder, multipleMarkers }) => {
  // jb delivery start kr do
  if (routeOrder.length > 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800">✅ Route Optimized!</h4>
        <p className="text-green-700 text-sm">
          You have {routeOrder.length} stops optimized for efficient delivery.
        </p>
      </div>
    );
  }

  // only jb mark hua rhe bs

  if (multipleMarkers.length > 0) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800">📍 Delivery Stops Ready</h4>
        <p className="text-blue-700 text-sm">
          You have {multipleMarkers.length} stops. Click "Optimize Route" to
          plan the best path.
        </p>
      </div>
    );
  }

  return null;
};

export default RouteSummary;
