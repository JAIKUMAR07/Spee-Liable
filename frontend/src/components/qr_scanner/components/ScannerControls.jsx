const ScannerControls = ({ scanning, onToggleScan, onImageUpload }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <button
        onClick={onToggleScan}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {scanning ? "Stop Scanning" : "Scan QR (Camera)"}
      </button>

      <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition">
        Upload QR Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageUpload}
        />
      </label>
    </div>
  );
};

export default ScannerControls;
