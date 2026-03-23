import React from "react";
import { Marker, Popup } from "react-leaflet";
import { redIcon, createBlueNumberedIcon, createOrangeNumberedIcon } from "./utils/icons";

const DeliveryMarkers = ({
  userLocation,
  searchLocation,
  multipleMarkers,
  routeOrder = [], // ✅ ADD DEFAULT VALUE
  onDeleteStop,
  canManage = true,
}) => {
  // ✅ ADD SAFETY CHECK
  const safeRouteOrder = Array.isArray(routeOrder) ? routeOrder : [];

  return (
    <>
      {/* Driver's location */}
      {userLocation && (
        <Marker position={userLocation} icon={redIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Search result marker */}
      {searchLocation &&
        !multipleMarkers.some((m) => m.position[0] === searchLocation[0]) && (
          <Marker position={searchLocation} icon={redIcon}>
            <Popup>Searched Location</Popup>
          </Marker>
        )}

      {/* Delivery markers */}
      {multipleMarkers.map((marker, index) => {
        // ✅ ADD SAFETY CHECK for routeOrder
        const isOptimized = safeRouteOrder.includes(marker._id);
        const orderIndex = safeRouteOrder.indexOf(marker._id) + 1;
        const displayNumber = isOptimized ? orderIndex : index + 1;

        return (
          <Marker
            key={marker._id}
            position={marker.position}
            icon={marker.isPersonal ? createOrangeNumberedIcon(displayNumber) : createBlueNumberedIcon(displayNumber)}
          >
            <Popup>
              <div className="text-sm space-y-1 font-medium min-w-[200px]">
                {/* Availability Status Badge */}
                {!marker.isPersonal && (
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded-full text-center ${
                      marker.available === "available"
                        ? "bg-green-100 text-green-800"
                        : marker.available === "unavailable"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {marker.available === "available"
                      ? "✅ Available"
                      : marker.available === "unavailable"
                      ? "❌ Unavailable"
                      : "❓ Unknown"}
                  </div>
                )}

                {isOptimized ? (
                  <div className="mt-2 p-1 bg-green-100 text-green-800 text-xs rounded text-center font-bold">
                    ✅ Optimized Stop #{orderIndex}
                  </div>
                ) : (
                  <div className="mt-2 p-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                    📍 Stop #{index + 1}
                  </div>
                )}
                
                {marker.isPersonal ? (
                  <div className="font-semibold text-orange-800">☕ {marker.name}</div>
                ) : (
                  <div className="font-semibold text-blue-800">{marker.name}</div>
                )}

                <div className="text-gray-600">📍 {marker.address}</div>
                {marker.phone_num !== "N/A" && (
                  <div className="text-gray-600">📱 {marker.phone_num}</div>
                )}

                {/* ✅ Only show arrived button if user has permission */}
                {canManage && (
                  <div className="mt-2 flex justify-center space-x-2">
                    <button
                      onClick={() => onDeleteStop(marker._id, marker.name, marker.isPersonal)}
                      className="bg-green-700 text-white px-2 py-1 rounded text-xs hover:bg-green-800 transition"
                    >
                      {marker.isPersonal ? "✅ Finish Stop" : "✅ Mark Arrived"}
                    </button>
                  </div>
                )}

                {/* ✅ Show message for viewers */}
                {!canManage && (
                  <div className="mt-2 p-1 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs text-center">
                    👀 View only mode
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default DeliveryMarkers;
