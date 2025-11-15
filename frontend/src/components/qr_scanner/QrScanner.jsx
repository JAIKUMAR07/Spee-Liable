import React, { useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../layout/Layout";
import { useDeliveryStops } from "./hooks/useDeliveryStops";
import { useQrScanner } from "./hooks/useQrScanner";
import { parseQrData } from "./utils/qrParser";
import ScannerControls from "./components/ScannerControls";
import ManualForm from "./components/ManualForm";
import StopsList from "./components/StopsList";
import ErrorDisplay from "./components/ErrorDisplay";
import { useAuth } from "../../context/AuthContext";
import { deliveryAPI } from "../../utils/notificationAPI"; // ✅ ADD THIS IMPORT

const QrScanner = () => {
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState(""); // ✅ ADD THIS STATE
  const [addingManually, setAddingManually] = useState(false);
  const [scanError, setScanError] = useState(""); // ✅ ADD ERROR STATE

  const { stops, loading, error, addStop, deleteStop, setError, fetchStops } =
    useDeliveryStops();
  const { can } = useAuth();

  // ✅ FIXED: Handle QR scan success with customer email
  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (!can("scan_qr")) {
        alert("You don't have permission to scan QR codes");
        toggleScanning();
        return;
      }

      try {
        const stopData = parseQrData(decodedText);

        // ✅ ADD: Prompt for customer email for QR scans too
        const email = prompt("Please enter customer email for this package:");
        if (!email || !email.trim()) {
          alert("Customer email is required");
          return;
        }

        // ✅ USE THE NEW API with customer email
        const response = await deliveryAPI.scanPackage({
          ...stopData,
          customerEmail: email.trim(),
        });

        const savedStop = response.data;
        alert(`${savedStop.name} scanned successfully! Customer notified.`);
        toggleScanning();

        // Refresh the stops list
        fetchStops();
      } catch (err) {
        console.error("QR Scan error:", err);
        const errorMessage =
          err.response?.data?.error || err.message || "Failed to scan package";
        setScanError(errorMessage);
      }
    },
    [can, fetchStops]
  );

  // ✅ Initialize scanner
  const { scanning, toggleScanning, regionId } =
    useQrScanner(handleScanSuccess);

  // Geocode function
  const geocodeAddress = async (address) => {
    try {
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

  // ✅ FIXED: Handle image upload with customer email
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

      // ✅ ADD: Prompt for customer email for image uploads too
      const email = prompt("Please enter customer email for this package:");
      if (!email || !email.trim()) {
        alert("Customer email is required");
        return;
      }

      const stopData = parseQrData(decodedText);

      // ✅ USE THE NEW API
      const response = await deliveryAPI.scanPackage({
        ...stopData,
        customerEmail: email.trim(),
      });

      alert(`Package scanned successfully! Customer notified.`);

      // Refresh the stops list
      fetchStops();
    } catch (err) {
      console.error("Image upload error:", err);
      setScanError("Could not read QR from image. Please try another image.");
    } finally {
      event.target.value = null;
    }
  };

  // ✅ FIXED: Manual package scanning
  const addManually = async () => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to scan packages");
      return;
    }

    if (!name.trim() || !manualAddress.trim() || !customerEmail.trim()) {
      alert("Please enter name, address, and customer email.");
      return;
    }

    setAddingManually(true);
    setScanError(""); // Clear previous errors

    try {
      const location = await geocodeAddress(manualAddress.trim());

      const stopData = {
        name: name.trim(),
        address: manualAddress.trim(),
        location: location || { lat: 20.5937, lng: 78.9629 },
        mobile_number: "Manually Added",
        customerEmail: customerEmail.trim(),
      };

      // ✅ USE THE NEW API
      const response = await deliveryAPI.scanPackage(stopData);
      const savedStop = response.data;

      alert(`"${savedStop.name}" scanned successfully! Customer notified.`);

      // Clear form
      setName("");
      setManualAddress("");
      setCustomerEmail("");

      // Refresh stops list
      fetchStops();
    } catch (error) {
      console.error("Manual scan error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to scan package. Please try again.";
      setScanError(errorMessage);
    } finally {
      setAddingManually(false);
    }
  };

  // ✅ FIXED: Delete stop function
  const handleDeleteStop = async (id, name) => {
    if (!can("delete_own_records")) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteStop(id);
      alert(`"${name}" deleted successfully!`);
      // Refresh the list
      fetchStops();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete stop.";
      alert(errorMessage);
    }
  };

  // Show errors from useDeliveryStops hook
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
          Package Scanner
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

        {/* ✅ Display scan errors */}
        <ErrorDisplay error={scanError} onDismiss={() => setScanError("")} />

        <ScannerControls
          scanning={scanning}
          onToggleScan={toggleScanning}
          onImageUpload={handleImageUpload}
          canScan={can("scan_qr")}
          canUpload={can("scan_qr")}
        />

        {scanning && <div id={regionId} className="mt-4" />}
        <div id="upload-region" style={{ display: "none" }} />

        {/* ✅ Only show manual form if user has permission */}
        {can("manage_deliveries") && (
          <ManualForm
            name={name}
            address={manualAddress}
            customerEmail={customerEmail}
            onNameChange={(e) => setName(e.target.value)}
            onAddressChange={(e) => setManualAddress(e.target.value)}
            onCustomerEmailChange={(e) => setCustomerEmail(e.target.value)}
            onSubmit={addManually}
            loading={loading || addingManually}
          />
        )}

        <StopsList
          stops={stops}
          onDeleteStop={handleDeleteStop}
          loading={loading}
          canDelete={can("delete_own_records")}
        />

        {/* ✅ Only show ready button if user has stops */}
        {stops.length > 0 && (
          <button
            onClick={() => {
              console.log("Delivery List:", stops);
              alert(`Ready for delivery! ${stops.length} packages loaded.`);
            }}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ✅ Ready for Delivery ({stops.length} packages)
          </button>
        )}
      </div>
    </Layout>
  );
};

export default QrScanner;
