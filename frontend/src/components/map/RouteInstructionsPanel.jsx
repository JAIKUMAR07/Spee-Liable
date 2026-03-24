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
    <div className="absolute right-3 top-18 z-[5000] w-[calc(100%-1.5rem)] max-w-sm overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:right-8 sm:top-8 sm:w-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-slate-800">Turn-by-Turn</h4>
        <button
          onClick={onClose}
          className="px-1 text-2xl font-bold leading-none text-slate-500 hover:text-slate-700"
          aria-label="Close directions"
        >
          x
        </button>
      </div>
      <ol className="space-y-2 text-sm">
        {instructions.map((step, index) => (
          <li key={`${step.text}-${index}`} className="border-b border-slate-100 pb-2">
            <p className="text-slate-800">{step.text}</p>
            {step.distance > 0 && (
              <p className="mt-1 text-xs text-slate-500">
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
