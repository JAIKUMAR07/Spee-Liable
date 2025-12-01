import { useState } from "react";
import { authAPI } from "../utils/apiClient";

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await authAPI.updateProfile(userData);

      if (response.data.success) {
        setSuccess(true);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.error || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await authAPI.changePassword(passwordData);

      if (response.data.success) {
        setSuccess(true);
        return { success: true };
      } else {
        throw new Error(response.data.error || "Failed to change password");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to change password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    updateProfile,
    changePassword,
    clearMessages,
  };
};
