import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./components/homePage/HomePage";
import QrScanner from "./components/qr_scanner/QrScanner";
import MapComponent from "./components/map/MapComponent";
import DeliveryManagement from "./components/delivery_management/DeliveryManagement";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/profile/Profile";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* {profile routes } */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qrpage"
            element={
              <ProtectedRoute requiredPermission="scan_qr">
                <QrScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute requiredPermission="view_deliveries">
                <MapComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-management"
            element={
              <ProtectedRoute requiredPermission="manage_deliveries">
                <DeliveryManagement />
              </ProtectedRoute>
            }
          />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
