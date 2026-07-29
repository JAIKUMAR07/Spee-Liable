import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI, setOnNetworkError } from "../utils/apiClient";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(true); // Start as true to block UI initially
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Add this function to update user data
  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  // Helper to check server health
  const checkServerConnection = useCallback(async () => {
    try {
      await authAPI.ping();
      setIsWakingUp(false);
      return true;
    } catch (error) {
      const isUnreachable =
        !error.response ||
        [502, 503, 504].includes(error.response?.status);

      if (isUnreachable) {
        setIsWakingUp(true);
      } else {
        setIsWakingUp(false);
      }
      return !isUnreachable;
    }
  }, []);

  // Listen for network errors from apiClient
  useEffect(() => {
    setOnNetworkError(() => {
      setIsWakingUp(true);
    });
  }, []);

  // Continuously check server connection
  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const runPing = async () => {
      try {
        await authAPI.ping();
        if (isMounted) {
          setIsWakingUp(false);
        }
      } catch (error) {
        if (!isMounted) return;
        const isUnreachable =
          !error.response ||
          [502, 503, 504].includes(error.response?.status);

        if (isUnreachable) {
          setIsWakingUp(true);
        } else {
          setIsWakingUp(false);
        }
      } finally {
        if (isMounted) {
          // Re-ping faster (2s) if disconnected/waking up, slower (10s) as heartbeat if connected
          const delay = isWakingUp ? 2000 : 10000;
          timeoutId = setTimeout(runPing, delay);
        }
      }
    };

    runPing();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isWakingUp]);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          setIsWakingUp(false);
          const userData = response.data.user;

          // Normalize the user object to have both id and _id
          const normalizedUser = normalizeUserObject(userData);

          console.log("🔐 Normalized user:", normalizedUser);
          setUser(normalizedUser);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          const isNetworkError =
            !error.response ||
            [502, 503, 504].includes(error.response?.status);

          if (isNetworkError) {
            setIsWakingUp(true);
          } else {
            setIsWakingUp(false);
            logout();
          }
        }
      } else {
        // If no token, test connection once
        checkServerConnection();
      }
      setLoading(false);
    };

    checkAuth();
  }, [checkServerConnection]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", email);
      const response = await authAPI.login({ email, password });
      setIsWakingUp(false);
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
      const isNetworkError =
        !error.response ||
        [502, 503, 504].includes(error.response?.status);

      if (isNetworkError) {
        setIsWakingUp(true);
        return {
          success: false,
          error: "Backend server is not connected. Please start the server.",
        };
      }

      setIsWakingUp(false);
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
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setIsWakingUp(false);
      const { user: responseUser, token } = response.data;

      // Normalize the user object
      const normalizedUser = normalizeUserObject(responseUser);

      localStorage.setItem("token", token);
      setUser(normalizedUser);
      setToken(token);

      return { success: true, user: normalizedUser };
    } catch (error) {
      const isNetworkError =
        !error.response ||
        [502, 503, 504].includes(error.response?.status);

      if (isNetworkError) {
        setIsWakingUp(true);
        return {
          success: false,
          error: "Backend server is not connected. Please start the server.",
        };
      }

      setIsWakingUp(false);
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
      admin: ["view_users", "manage_users", "view_all_deliveries", "delete_records"],
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
    isWakingUp,
    checkServerConnection,
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
