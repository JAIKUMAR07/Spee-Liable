import React from "react";

const ScannerControls = ({
  scanning,
  onToggleScan,
  onImageUpload,
  canScan = true, // ✅ New prop for permissions
  canUpload = true, // ✅ New prop for permissions
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      {/* ✅ Conditionally show scan button based on permissions */}
      {canScan && (
        <button
          onClick={onToggleScan}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {scanning ? "Stop Scanning" : "Scan QR (Camera)"}
        </button>
      )}

      {/* ✅ Conditionally show upload button based on permissions */}
      {canUpload && (
        <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition">
          Upload QR Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
        </label>
      )}

      {/* ✅ Show message if no permissions */}
      {!canScan && !canUpload && (
        <div className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
          QR Scanning Disabled
        </div>
      )}
    </div>
  );
};

export default ScannerControls;
