import React from "react";
import { Marker, Popup } from "react-leaflet";
import { redIcon, createBlueNumberedIcon } from "./utils/icons";

const DeliveryMarkers = ({
  userLocation,
  searchLocation,
  multipleMarkers,
  routeOrder,
}) => {
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
        const isOptimized = routeOrder.includes(marker._id);
        const orderIndex = routeOrder.indexOf(marker._id) + 1;
        const displayNumber = isOptimized ? orderIndex : index + 1;

        return (
          <Marker
            key={marker._id}
            position={marker.position}
            icon={createBlueNumberedIcon(displayNumber)}
          >
            <Popup>
              <div className="text-sm space-y-1 font-medium min-w-[200px]">
                <div className="font-semibold text-blue-800">{marker.name}</div>
                <div className="text-gray-600">📍 {marker.address}</div>
                {marker.phone_num !== "N/A" && (
                  <div className="text-gray-600">📱 {marker.phone_num}</div>
                )}
                {marker.pincode !== "N/A" && (
                  <div className="text-gray-600">📦 {marker.pincode}</div>
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
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default DeliveryMarkers;
