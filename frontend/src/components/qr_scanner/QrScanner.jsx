import React, { useState, useEffect, useCallback } from "react"; // ✅ Add useCallback
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../layout/Layout";
import { useDeliveryStops } from "./hooks/useDeliveryStops";
import { useQrScanner } from "./hooks/useQrScanner";
import { parseQrData } from "./utils/qrParser";
import ScannerControls from "./components/ScannerControls";
import ManualForm from "./components/ManualForm";
import StopsList from "./components/StopsList";
import { useAuth } from "../../context/AuthContext";

const QrScanner = () => {
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [addingManually, setAddingManually] = useState(false);

  const { stops, loading, error, addStop, deleteStop, setError } =
    useDeliveryStops();
  const { can } = useAuth();

  // ✅ FIX: Define handleScanSuccess FIRST using useCallback
  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (!can("scan_qr")) {
        alert("You don't have permission to scan QR codes");
        toggleScanning();
        return;
      }

      try {
        const stopData = parseQrData(decodedText);
        const newStop = await addStop(stopData);
        alert(`${newStop.name} added successfully!`);
        toggleScanning();
      } catch (err) {
        alert(err.message);
      }
    },
    [can, addStop]
  ); // ✅ Add dependencies

  // ✅ Now initialize useQrScanner AFTER handleScanSuccess is defined
  const { scanning, toggleScanning, regionId } =
    useQrScanner(handleScanSuccess);

  // SIMPLE FIX: Replace only this function
  const geocodeAddress = async (address) => {
    try {
      // Simple working CORS proxy
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`
        )}`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // ✅ UPDATED: Add permission check for image upload
  const handleImageUpload = async (event) => {
    if (!can("scan_qr")) {
      alert("You don't have permission to upload QR images");
      return;
    }

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

  // ✅ UPDATED: Add permission check for manual addition
  const addManually = async () => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to add delivery stops");
      return;
    }

    if (!name.trim() || !manualAddress.trim()) {
      alert("Please enter both name and address.");
      return;
    }

    setAddingManually(true);
    try {
      // Get coordinates
      const location = await geocodeAddress(manualAddress.trim());

      const stopData = {
        name: name.trim(),
        address: manualAddress.trim(),
        mobile_number: "Not scanned",
        available: "unknown",
        location: location || { lat: 20.5937, lng: 78.9629 }, // Use actual or default
      };

      await addStop(stopData);
      setName("");
      setManualAddress("");

      if (location) {
        alert(`"${name.trim()}" added successfully with coordinates!`);
      } else {
        alert(`"${name.trim()}" added with default coordinates!`);
      }
    } catch (error) {
      console.error("Error adding manual stop:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add stop. Please try again.";
      alert(errorMessage);
    } finally {
      setAddingManually(false);
    }
  };

  // ✅ UPDATED: Add permission check for deletion
  const handleDeleteStop = async (id, name) => {
    if (!can("delete_records")) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteStop(id);
      alert(`"${name}" deleted successfully!`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete stop.";
      alert(errorMessage);
    }
  };

  // Show errors
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error, setError]);

  return (
    <Layout>
      <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Delivery Stop Manager
        </h2>

        {/* ✅ Permission notice for viewers */}
        {!can("scan_qr") && !can("manage_deliveries") && (
          <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-700 font-semibold">👀 View Only Mode</p>
            <p className="text-blue-600 text-sm mt-1">
              You have view-only access. Contact an administrator to add or
              manage delivery stops.
            </p>
          </div>
        )}

        <ScannerControls
          scanning={scanning}
          onToggleScan={toggleScanning}
          onImageUpload={handleImageUpload}
          canScan={can("scan_qr")} // ✅ Pass permissions
          canUpload={can("scan_qr")}
        />

        {scanning && <div id={regionId} className="mt-4" />}
        <div id="upload-region" style={{ display: "none" }} />

        {/* ✅ Only show manual form if user has permission */}
        {can("manage_deliveries") && (
          <ManualForm
            name={name}
            address={manualAddress}
            onNameChange={(e) => setName(e.target.value)}
            onAddressChange={(e) => setManualAddress(e.target.value)}
            onSubmit={addManually}
            loading={loading || addingManually}
          />
        )}

        <StopsList
          stops={stops}
          onDeleteStop={handleDeleteStop}
          loading={loading}
          canDelete={can("delete_records")} // ✅ Pass permission
        />

        {/* ✅ Only show mark location button if user has stops */}
        {stops.length > 0 && (
          <button
            onClick={() => {
              console.log("Final Delivery List:", stops);
              alert(`Ready for delivery! ${stops.length} stops loaded.`);
            }}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ✅ Ready for Delivery ({stops.length} stops)
          </button>
        )}
      </div>
    </Layout>
  );
};

export default QrScanner;
