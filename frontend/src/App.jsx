import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./components/homePage/HomePage";
import QrScanner from "./components/qr_scanner/QrScanner";
import MapComponent from "./components/map/MapComponent";
import DeliveryManagement from "./components/delivery_management/DeliveryManagement";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/profile/Profile";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import UserManagement from "./components/admin/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          {" "}
          {/* ✅ MOVE SocketProvider INSIDE AuthProvider */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
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
                <ProtectedRoute requiredPermission="optimize_routes">
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

            {/* Customer Routes */}
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute requiredPermission="view_notifications">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/user-management"
              element={
                <ProtectedRoute requiredPermission="view_users">
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
