import React from "react";

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="w-full max-w-2xl rounded-lg border border-rose-300 bg-rose-100 p-3 text-center text-sm font-medium text-rose-700">
      {error}
      <button onClick={onDismiss} className="ml-3 rounded px-2 py-0.5 font-bold text-rose-800 hover:bg-rose-200">
        x
      </button>
    </div>
  );
};

export default ErrorDisplay;
