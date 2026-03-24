import React from "react";

const ScannerControls = ({
  scanning,
  onToggleScan,
  onImageUpload,
  canScan = true,
  canUpload = true,
}) => {
  return (
    <div className="mt-2 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {canScan && (
        <button
          onClick={onToggleScan}
          className="rounded-xl border border-indigo-700 bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {scanning ? "Stop Scanning" : "Scan QR (Camera)"}
        </button>
      )}

      {canUpload && (
        <label className="cursor-pointer rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700">
          Upload QR Image
          <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
        </label>
      )}

      {!canScan && !canUpload && (
        <div className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
          QR scanning disabled for your role.
        </div>
      )}
    </div>
  );
};

export default ScannerControls;
