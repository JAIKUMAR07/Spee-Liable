import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../utils/apiClient";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Add this function to update user data
  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  // Check if user is authenticated on app start
  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          const userData = response.data.user;

          // Normalize the user object to have both id and _id
          const normalizedUser = normalizeUserObject(userData);

          console.log("🔐 Normalized user:", normalizedUser);
          setUser(normalizedUser);
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
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", email);
      const response = await authAPI.login({ email, password });
      console.log("📨 Login API response:", response);

      const { user: userData, token } = response.data;

      // Normalize the user object
      const normalizedUser = normalizeUserObject(userData);

      console.log("👤 Normalized user:", normalizedUser);
      console.log("🔑 Token received:", token ? "YES" : "NO");

      localStorage.setItem("token", token);
      setUser(normalizedUser);
      setToken(token);

      return { success: true, user: normalizedUser };
    } catch (error) {
      console.log("🚨 Login API error:", error);
      console.log("📊 Error response:", error.response);

      return {
        success: false,
        error: error.response?.data?.error || "Login failed - check console",
      };
    }
  };

  // Add this helper function to normalize user objects
  const normalizeUserObject = (userData) => {
    return {
      ...userData,
      id: userData.id || userData._id, // Ensure 'id' field exists
      _id: userData._id || userData.id, // Ensure '_id' field exists
    };
  };
  // Register function
  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: userData, token } = response.data;

      // Normalize the user object
      const normalizedUser = normalizeUserObject(userData);

      localStorage.setItem("token", token);
      setUser(normalizedUser);
      setToken(token);

      return { success: true, user: normalizedUser };
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
  // ✅ ADD THIS: Check if user has permission for action
  const can = (action) => {
    if (!user) return false;

    const permissions = {
      admin: ["view_users", "manage_users", "view_all_deliveries"],
      driver: [
        "view_deliveries",
        "manage_deliveries",
        "scan_qr",
        "optimize_routes",
        "delete_own_records",
        "assign_deliveries",
      ],
      customer: [
        "view_own_deliveries",
        "update_delivery_status",
        "view_notifications",
      ],
    };

    return permissions[user.role]?.includes(action) || false;
  };

  // Check if user can delete a specific record
  // Check if user can delete a specific record
  const canDelete = (resource) => {
    if (!user) return false;

    if (user.role === "admin") {
      return true;
    }

    if (user.role === "driver") {
      return (
        resource?.createdBy?.toString() === user.id ||
        resource?.assignedTo?.toString() === user.id
      );
    }

    return false;
  };
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    can, // ✅ Add the can function to context value
    canDelete,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
