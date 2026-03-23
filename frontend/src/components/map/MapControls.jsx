import React from "react";

const MapControls = ({
  searchInputRef,
  loading,
  error,
  multipleMarkers,
  onSearch,
  onAddPersonalMarker,
  onGetLocation,
  onOptimizeRoute,
  onReset,
  onClearRoute,
  isRoutingActive,
  isGettingLocation,
  canAddMarker = true, // ✅ New prop for permissions
  canOptimizeRoute = true, // ✅ New prop for permissions
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Enter address, landmark, or pincode..."
        onKeyPress={handleKeyPress}
        className="w-full max-w-md px-4 py-2 border border-black rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? "Searching..." : "🔍 Search"}
        </button>

        {/* ✅ Conditionally show Add Stop button based on permissions */}
        {canAddMarker && (
          <button
            onClick={() => {
              const reason = window.prompt(
                "Enter reason for personal stop (e.g., Lunch, Fuel):",
              );
              if (reason && onAddPersonalMarker) {
                onAddPersonalMarker(reason);
              }
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            ☕ Personal Stop
          </button>
        )}

        <button
          onClick={onGetLocation}
          disabled={isGettingLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition flex items-center"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Getting Location...
            </>
          ) : (
            "📍 My Location"
          )}
        </button>

        {/* ✅ Conditionally show Optimize Route button based on permissions */}
        {canOptimizeRoute && (
          <button
            onClick={onOptimizeRoute}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            disabled={multipleMarkers.length === 0}
          >
            🧭 Optimize Route
          </button>
        )}

        {/* Clear Route Button - Only show when route is active */}
        {isRoutingActive && (
          <button
            onClick={onClearRoute}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            🗑️ Clear Route
          </button>
        )}

        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🔄 Reset All
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md border border-red-300 w-full max-w-md text-center">
          {error}
          {error.includes("timed out") && (
            <div className="mt-1 text-sm">
              <button
                onClick={onGetLocation}
                className="text-blue-600 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapControls;
