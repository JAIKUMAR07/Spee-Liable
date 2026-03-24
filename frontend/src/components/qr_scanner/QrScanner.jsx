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
import { deliveryAPI } from "../../utils/notificationAPI";

const QrScanner = () => {
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addingManually, setAddingManually] = useState(false);
  const [scanError, setScanError] = useState("");
  const [notifying, setNotifying] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const { stops, loading, error, prependStop, deleteStop, setError } = useDeliveryStops();
  const { can } = useAuth();

  const scanSuccessRef = useRef(async () => {});
  const { scanning, toggleScanning, stopScanning, regionId } = useQrScanner((decodedText) =>
    scanSuccessRef.current(decodedText)
  );

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (isProcessingScan) return;

      if (!can("scan_qr")) {
        alert("You don't have permission to scan QR codes");
        stopScanning();
        return;
      }

      setIsProcessingScan(true);
      stopScanning();

      try {
        const stopData = parseQrData(decodedText);

        const email = prompt("Please enter customer email for this package:");
        if (!email || !email.trim()) {
          alert("Customer email is required");
          return;
        }

        const response = await deliveryAPI.scanPackage({
          ...stopData,
          customerEmail: email.trim(),
        });

        const savedStop = response.data.data;
        prependStop(savedStop);
        alert(`${savedStop.name} scanned successfully!`);
      } catch (err) {
        console.error("QR Scan error:", err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to scan package";
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

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (fetchError) {
      console.error("Geocoding error:", fetchError);
      return null;
    }
  };

  const geocodeAddressWithTimeout = async (address, timeoutMs = 2500) => {
    try {
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
      const result = await Promise.race([geocodeAddress(address), timeoutPromise]);
      return result;
    } catch {
      return null;
    }
  };

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

      const email = prompt("Please enter customer email for this package:");
      if (!email || !email.trim()) {
        alert("Customer email is required");
        return;
      }

      const stopData = parseQrData(decodedText);
      const response = await deliveryAPI.scanPackage({
        ...stopData,
        customerEmail: email.trim(),
      });

      const savedStop = response.data.data;
      prependStop(savedStop);
      alert("Package scanned successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      setScanError("Could not read QR from image. Please try another image.");
    } finally {
      event.target.value = null;
    }
  };

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
    setScanError("");

    try {
      const location = await geocodeAddressWithTimeout(manualAddress.trim());

      const stopData = {
        name: name.trim(),
        address: manualAddress.trim(),
        location: location || { lat: 20.5937, lng: 78.9629 },
        mobile_number: "Manually Added",
        customerEmail: customerEmail.trim(),
      };

      const response = await deliveryAPI.scanPackage(stopData);
      const savedStop = response.data.data;
      prependStop(savedStop);

      alert(`"${savedStop.name}" added to your delivery list!`);

      setName("");
      setManualAddress("");
      setCustomerEmail("");
    } catch (scanErr) {
      console.error("Manual scan error:", scanErr);
      const errorMessage = scanErr.response?.data?.error || "Failed to scan package. Please try again.";
      setScanError(errorMessage);
    } finally {
      setAddingManually(false);
    }
  };

  const handleDeleteStop = async (id, stopName) => {
    if (!can("delete_own_records")) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${stopName}"?`)) {
      return;
    }

    try {
      await deleteStop(id);
      alert(`"${stopName}" deleted successfully!`);
    } catch (deleteErr) {
      const errorMessage = deleteErr.response?.data?.error || "Failed to delete stop.";
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error, setError]);

  return (
    <Layout>
      <section className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Package Scanner</h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Scan by camera, upload image, or add package details manually.</p>
          </div>

          {!can("scan_qr") && !can("manage_deliveries") && (
            <div className="w-full max-w-2xl rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
              <p className="font-semibold text-sky-800">View only mode</p>
              <p className="mt-1 text-sm text-sky-700">You have view-only access. Contact an administrator to add or manage delivery stops.</p>
            </div>
          )}

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

          {scanning && (
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div id={regionId} className="mx-auto w-full" />
            </div>
          )}
          <div id="upload-region" style={{ display: "none" }} />

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

          {stops.length > 0 && (
            <div className="w-full pb-8">
              <button
                onClick={async () => {
                  setNotifying(true);
                  try {
                    const response = await deliveryAPI.notifyReady();
                    alert(response.data.message || `Ready for delivery! ${stops.length} customers notified.`);
                  } catch (notifyErr) {
                    console.error("Notify ready error:", notifyErr);
                    const errorMessage =
                      notifyErr.response?.data?.error ||
                      "Failed to notify customers about delivery start.";
                    alert(errorMessage);
                  } finally {
                    setNotifying(false);
                  }
                }}
                disabled={notifying}
                className={`mx-auto block w-full max-w-2xl rounded-2xl border px-6 py-4 text-sm font-extrabold text-white shadow-sm transition sm:text-base ${
                  notifying
                    ? "cursor-not-allowed border-indigo-400 bg-indigo-400"
                    : "border-indigo-700 bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {notifying ? "Preparing..." : `Ready for Delivery (${stops.length} packages loaded)`}
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default QrScanner;
