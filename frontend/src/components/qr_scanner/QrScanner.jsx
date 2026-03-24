import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [notifying, setNotifying] = useState(false); // ✅ ADD NOTIFYING STATE
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const { stops, loading, error, prependStop, deleteStop, setError } =
    useDeliveryStops();
  const { can } = useAuth();

  // Keep scanner callback stable while allowing latest logic inside.
  const scanSuccessRef = useRef(async () => {});
  const { scanning, toggleScanning, stopScanning, regionId } =
    useQrScanner((decodedText) => scanSuccessRef.current(decodedText));

  // ✅ FIXED: Handle QR scan success with customer email
  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (isProcessingScan) return;

      if (!can("scan_qr")) {
        alert("You don't have permission to scan QR codes");
        stopScanning();
        return;
      }

      setIsProcessingScan(true);
      // Stop camera immediately after first successful decode to avoid duplicate processing
      stopScanning();

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

        const savedStop = response.data.data;
        prependStop(savedStop);
        alert(`${savedStop.name} scanned successfully!`);
      } catch (err) {
        console.error("QR Scan error:", err);
        const errorMessage =
          err.response?.data?.error || err.message || "Failed to scan package";
        setScanError(errorMessage);
      } finally {
        setIsProcessingScan(false);
      }
    },
    [can, isProcessingScan, prependStop, stopScanning]
  );

  useEffect(() => {
    scanSuccessRef.current = handleScanSuccess;
  }, [handleScanSuccess]);

  // Geocode function
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
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

  // Avoid blocking manual scan flow on slow geocoding services.
  const geocodeAddressWithTimeout = async (address, timeoutMs = 2500) => {
    try {
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      );
      const result = await Promise.race([geocodeAddress(address), timeoutPromise]);
      return result;
    } catch {
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

      const savedStop = response.data.data;
      prependStop(savedStop);
      alert(`Package scanned successfully!`);
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
      const location = await geocodeAddressWithTimeout(manualAddress.trim());

      const stopData = {
        name: name.trim(),
        address: manualAddress.trim(),
        location: location || { lat: 20.5937, lng: 78.9629 },
        mobile_number: "Manually Added",
        customerEmail: customerEmail.trim(),
      };

      // ✅ USE THE NEW API
      const response = await deliveryAPI.scanPackage(stopData);
      const savedStop = response.data.data;
      prependStop(savedStop);

      alert(`"${savedStop.name}" added to your delivery list!`);

      // Clear form
      setName("");
      setManualAddress("");
      setCustomerEmail("");

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
      <div className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 to-sky-100/40 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
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
          onToggleScan={() => {
            if (!isProcessingScan) toggleScanning();
          }}
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
          <div className="w-full flex justify-center pb-10">
            <button
              onClick={async () => {
                setNotifying(true);
                try {
                  const response = await deliveryAPI.notifyReady();
                  alert(
                    response.data.message ||
                      `Ready for delivery! ${stops.length} customers notified.`
                  );
                } catch (error) {
                  console.error("Notify ready error:", error);
                  const errorMessage =
                    error.response?.data?.error ||
                    "Failed to notify customers about delivery start.";
                  alert(errorMessage);
                } finally {
                  setNotifying(false);
                }
              }}
              disabled={notifying}
              className={`w-full max-w-lg bg-indigo-600 shadow-xl border border-indigo-700 font-extrabold text-white px-10 py-4 rounded-2xl transition-all duration-300 transform ${
                notifying
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-indigo-700 hover:scale-105 active:scale-95"
              }`}
            >
              {notifying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Preparing...
                </div>
              ) : (
                `🚀 ✅ Ready for Delivery (${stops.length} packages loaded)`
              )}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QrScanner;
