import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../utils/apiClient";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // ✅ FIX: Remove the token parameter - interceptor handles it
          const response = await authAPI.getMe(); // Remove storedToken parameter
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  // Login function
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", email);
      const response = await authAPI.login({ email, password });
      console.log("📨 Login API response:", response);

      const { user, token } = response.data;
      console.log("👤 User data:", user);
      console.log("🔑 Token received:", token ? "YES" : "NO");

      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);

      return { success: true, user };
    } catch (error) {
      console.log("🚨 Login API error:", error);
      console.log("📊 Error response:", error.response);

      return {
        success: false,
        error: error.response?.data?.error || "Login failed - check console",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has permission for action
  const can = (action) => {
    if (!user) return false;

    const permissions = {
      admin: [
        "view_deliveries",
        "manage_deliveries",
        "scan_qr",
        "optimize_routes",
        "delete_records",
        "manage_users",
      ],
      manager: [
        "view_deliveries",
        "manage_deliveries",
        "scan_qr",
        "optimize_routes",
      ],
      driver: [
        "view_deliveries",
        "manage_deliveries",
        "scan_qr",
        "optimize_routes",
      ],
      viewer: ["view_deliveries"],
    };

    return permissions[user.role]?.includes(action) || false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    can,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
