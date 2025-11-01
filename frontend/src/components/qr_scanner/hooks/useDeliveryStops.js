import { useState, useEffect } from "react";
import { deliveryStopsAPI } from "../utils/apiClient";

export const useDeliveryStops = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all stops - FIXED for Axios
  const fetchStops = async () => {
    try {
      setLoading(true);
      const response = await deliveryStopsAPI.getAll();

      // FIX: With Axios, data is in response.data
      // Your backend returns { success: true, data: [], count: 0 }
      const apiResponse = response.data;

      if (apiResponse.success) {
        setStops(apiResponse.data || []);
      } else {
        setStops([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch delivery stops");
      console.error("Fetch error:", err);
      setStops([]); // Ensure stops is always an array
    } finally {
      setLoading(false);
    }
  };

  // Add new stop - FIXED for Axios
  const addStop = async (stopData) => {
    try {
      const response = await deliveryStopsAPI.create(stopData);

      // FIX: With Axios, data is in response.data
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
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to add delivery stop";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Delete stop - FIXED for Axios
  const deleteStop = async (id) => {
    try {
      const response = await deliveryStopsAPI.delete(id);

      // FIX: With Axios, data is in response.data
      const apiResponse = response.data;

      if (apiResponse.success) {
        setStops((prev) => prev.filter((stop) => stop._id !== id));
        setError(null);
      } else {
        throw new Error(apiResponse.error || "Failed to delete stop");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to delete stop";
      setError(errorMsg);
      throw new Error(errorMsg);
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
