import { useState, useEffect } from "react";
import { deliveryStopsAPI } from "../../../utils/apiClient"; // ✅ Correct import

export const useDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all deliveries - UPDATED with proper error handling
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryStopsAPI.getAll(); // ✅ Using API client

      const apiResponse = response.data;

      if (apiResponse.success) {
        setDeliveries(apiResponse.data || []);
      } else {
        setDeliveries([]);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch deliveries";
      setError(errorMessage);
      console.error("Fetch error:", err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability status - UPDATED to use API client
  const toggleAvailability = async (id, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "available" ? "unavailable" : "available";

      console.log(`Updating delivery ${id} to ${newStatus}`);

      // ✅ Using API client instead of direct axios
      const response = await deliveryStopsAPI.update(id, {
        available: newStatus,
      });

      const apiResponse = response.data;

      if (apiResponse.success) {
        // Update local state
        setDeliveries((prev) =>
          prev.map((delivery) =>
            delivery._id === id
              ? { ...delivery, available: newStatus }
              : delivery
          )
        );
        console.log(`Successfully updated to ${newStatus}`);
        return apiResponse.data;
      } else {
        throw new Error(apiResponse.error || "Failed to update delivery");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to update delivery status";
      setError(errorMessage);
      console.error("Update error:", err);
      throw err;
    }
  };

  // Delete delivery permanently - UPDATED to use API client
  const deleteDelivery = async (id) => {
    try {
      // ✅ Using API client instead of direct axios
      const response = await deliveryStopsAPI.delete(id);

      const apiResponse = response.data;

      if (apiResponse.success) {
        setDeliveries((prev) => prev.filter((delivery) => delivery._id !== id));
        setError(null);
      } else {
        throw new Error(apiResponse.error || "Failed to delete delivery");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete delivery";
      setError(errorMessage);
      throw err;
    }
  };

  // Load deliveries on component mount
  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    toggleAvailability,
    deleteDelivery,
    setError,
  };
};
