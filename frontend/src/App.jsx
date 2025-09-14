import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// ✅ Required for routing

import HomePage from "./components/homePage/HomePage";
import QrScanner from "./components/qr_scanner/QrScanner";
import MapComponent from "./components/map/MapComponent";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapComponent />} />
          <Route path="/qrpage" element={<QrScanner />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
