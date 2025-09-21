import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../layout/Layout";
import { useDeliveryStops } from "./hooks/useDeliveryStops";
import { useQrScanner } from "./hooks/useQrScanner";
import { parseQrData } from "./utils/qrParser";
import ScannerControls from "./components/ScannerControls";
import ManualForm from "./components/ManualForm";
import StopsList from "./components/StopsList";

const QrScanner = () => {
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const { stops, loading, error, addStop, deleteStop, setError } =
    useDeliveryStops();
  const { scanning, toggleScanning, regionId } =
    useQrScanner(handleScanSuccess);

  // Handle scan success
  async function handleScanSuccess(decodedText) {
    try {
      const stopData = parseQrData(decodedText);
      const newStop = await addStop(stopData);
      alert(`${newStop.name} added successfully!`);
      setScanning(false);
    } catch (err) {
      alert(err.message);
    }
  }

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("upload-region");
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleScanSuccess(decodedText);
    } catch (err) {
      alert("Could not read QR from image. Please try another image.");
    } finally {
      event.target.value = null;
    }
  };

  // Add stop manually
  const addManually = async () => {
    if (!name.trim() || !manualAddress.trim()) {
      alert("Please enter both name and address.");
      return;
    }

    try {
      const stopData = {
        name: name.trim(),
        address: manualAddress.trim(),
        mobile_number: "Not scanned",
        available: "unknown",
        location: { lat: 0, lng: 0 }, // Default location
      };

      await addStop(stopData);
      setName("");
      setManualAddress("");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Delete stop
  const handleDeleteStop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteStop(id);
    } catch (error) {
      alert("Failed to delete stop.");
    }
  };

  // Show errors
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null); // Clear error after showing
    }
  }, [error, setError]);

  return (
    <Layout>
      <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Delivery Stop Manager
        </h2>

        <ScannerControls
          scanning={scanning}
          onToggleScan={toggleScanning}
          onImageUpload={handleImageUpload}
        />

        {/* Scanner View */}
        {scanning && <div id={regionId} className="mt-4" />}
        <div id="upload-region" style={{ display: "none" }} />

        <ManualForm
          name={name}
          address={manualAddress}
          onNameChange={(e) => setName(e.target.value)}
          onAddressChange={(e) => setManualAddress(e.target.value)}
          onSubmit={addManually}
          loading={loading}
        />

        <StopsList
          stops={stops}
          onDeleteStop={handleDeleteStop}
          loading={loading}
        />

        <button
          onClick={() => {
            console.log("Final Delivery List:", stops);
            alert(`Ready to delivery for ${stops.length} stops!`);
          }}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          ✅ Mark Location
        </button>
      </div>
    </Layout>
  );
};

export default QrScanner;
