import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export const useQrScanner = (onScanSuccess) => {
  const [scanning, setScanning] = useState(false);
  const regionId = "qr-code-region";

  const toggleScanning = () => setScanning((prev) => !prev);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(regionId, {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, (error) => {
      console.warn("QR Scan error:", error);
    });

    // Cleanup function
    return () => {
      try {
        scanner.clear().catch(() => {});
      } catch (error) {
        console.warn("Scanner cleanup error:", error);
      }
    };
  }, [scanning, onScanSuccess]);

  return {
    scanning,
    toggleScanning,
    regionId,
  };
};
