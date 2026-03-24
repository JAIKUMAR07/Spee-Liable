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
  canAddMarker = true,
  canOptimizeRoute = true,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Enter address, landmark, or pincode..."
        onKeyDown={handleKeyPress}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-start sm:gap-3">
        <button
          onClick={onSearch}
          disabled={loading}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
        >
          {loading ? "Searching..." : "Search"}
        </button>

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
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Personal Stop
          </button>
        )}

        <button
          onClick={onGetLocation}
          disabled={isGettingLocation}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isGettingLocation ? "Getting..." : "My Location"}
        </button>

        {canOptimizeRoute && (
          <button
            onClick={onOptimizeRoute}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            disabled={multipleMarkers.length === 0}
          >
            Optimize Route
          </button>
        )}

        {isRoutingActive && (
          <button
            onClick={onClearRoute}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Clear Route
          </button>
        )}

        <button
          onClick={onReset}
          className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Reset All
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          {error.includes("timed out") && (
            <button
              onClick={onGetLocation}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MapControls;
