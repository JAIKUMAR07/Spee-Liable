import { useState, useEffect } from "react";
import { deliveryStopsAPI } from "../utils/apiClient";

export const useDeliveryStops = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all stops
  const fetchStops = async () => {
    try {
      setLoading(true);
      const response = await deliveryStopsAPI.getAll();
      setStops(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch delivery stops");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new stop
  const addStop = async (stopData) => {
    try {
      const response = await deliveryStopsAPI.create(stopData);
      setStops((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to add delivery stop";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Delete stop
  const deleteStop = async (id) => {
    try {
      await deliveryStopsAPI.delete(id);
      setStops((prev) => prev.filter((stop) => stop._id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete stop");
      throw err;
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
