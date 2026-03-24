import React from "react";

const formatDistance = (meters) => {
  if (!meters || meters <= 0) return "";
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

const RouteInstructionsPanel = ({
  instructions = [],
  isRoutingActive,
  onClose,
}) => {
  if (!isRoutingActive || !instructions.length) return null;

  return (
    <div className="absolute top-8 right-8 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-[5000] w-[320px] max-h-[360px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800">Turn-by-Turn</h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none font-bold px-1"
          aria-label="Close directions"
        >
          x
        </button>
      </div>
      <ol className="text-sm space-y-2">
        {instructions.map((step, index) => (
          <li key={`${step.text}-${index}`} className="border-b border-gray-100 pb-2">
            <p className="text-gray-800">{step.text}</p>
            {step.distance > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                In {formatDistance(step.distance)}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RouteInstructionsPanel;
