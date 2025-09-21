// components/qr_scanner/components/ErrorDisplay.jsx
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="p-2 bg-red-100 text-red-700 rounded-md border border-red-300 w-full max-w-md text-center">
      {error}
      <button onClick={onDismiss} className="ml-2 text-red-800 font-bold">
        ×
      </button>
    </div>
  );
};
