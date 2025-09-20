import React from "react";

const MapControls = ({
  searchInputRef,
  loading,
  error,
  multipleMarkers,
  onSearch,
  onAddMarker,
  onGetLocation,
  onOptimizeRoute,
  onReset,
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
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? "Searching..." : "🔍 Search"}
        </button>

        <button
          onClick={onAddMarker}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          ➕ Add Stop
        </button>

        <button
          onClick={onGetLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          📍 My Location
        </button>

        <button
          onClick={onOptimizeRoute}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          disabled={multipleMarkers.length === 0}
        >
          🧭 Optimize Route
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🗑️ Reset
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md border border-red-300 w-full max-w-md text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default MapControls;
