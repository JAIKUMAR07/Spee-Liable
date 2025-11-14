import { useState, useEffect } from "react";
import { deliveryStopsAPI } from "../../../utils/apiClient"; // ✅ Correct import path

export const useDeliveryStops = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all stops - UPDATED with better error handling
  const fetchStops = async () => {
    try {
      setLoading(true);
      const response = await deliveryStopsAPI.getAll();

      const apiResponse = response.data;

      if (apiResponse.success) {
        setStops(apiResponse.data || []);
      } else {
        setStops([]);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch delivery stops";
      setError(errorMessage);
      console.error("Fetch error:", err);
      setStops([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new stop - UPDATED with better error handling
  const addStop = async (stopData) => {
    try {
      const response = await deliveryStopsAPI.create(stopData);

      const apiResponse = response.data;

      if (apiResponse.success) {
        const newStop = apiResponse.data;
        setStops((prev) => [...prev, newStop]);
        setError(null);
        return newStop;
      } else {
        throw new Error(apiResponse.error || "Failed to add delivery stop");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to add delivery stop";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete stop - UPDATED with better error handling
  const deleteStop = async (id) => {
    try {
      const response = await deliveryStopsAPI.delete(id);

      const apiResponse = response.data;

      if (apiResponse.success) {
        setStops((prev) => prev.filter((stop) => stop._id !== id));
        setError(null);
      } else {
        throw new Error(apiResponse.error || "Failed to delete stop");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete stop";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load stops on mount
  useEffect(() => {
    fetchStops();
  }, []);

  return {
    stops,
    loading,
    error,
    fetchStops,
    addStop,
    deleteStop,
    setError,
  };
};
