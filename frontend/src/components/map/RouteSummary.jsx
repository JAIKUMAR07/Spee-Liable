// In RouteSummary.jsx
const RouteSummary = ({ routeOrder, multipleMarkers, isRoutingActive }) => {
  if (routeOrder.length > 0 && isRoutingActive) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800">✅ Active Route</h4>
        <p className="text-green-700 text-sm">
          You have an active route with {routeOrder.length} stops. This route
          will persist until you clear it.
        </p>
        <p className="text-green-600 text-xs mt-1">
          💡 Route is saved and will reappear when you return to this page.
        </p>
      </div>
    );
  }

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
