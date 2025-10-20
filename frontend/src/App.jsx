import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// ✅ Required for routing

import HomePage from "./components/homePage/HomePage";
import QrScanner from "./components/qr_scanner/QrScanner";
import MapComponent from "./components/map/MapComponent";
import DeliveryManagement from "./components/delivery_management/DeliveryManagement";

// Add to your routes

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapComponent />} />
          <Route path="/qrpage" element={<QrScanner />} />
          <Route path="/delivery-management" element={<DeliveryManagement />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
