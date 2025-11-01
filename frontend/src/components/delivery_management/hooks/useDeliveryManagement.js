import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const useDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all deliveries - FIXED
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/delivery-stops`);

      // FIX: Your backend returns { success: true, data: [], count: 0 }
      const apiResponse = response.data;

      if (apiResponse.success) {
        setDeliveries(apiResponse.data || []);
      } else {
        setDeliveries([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch deliveries");
      console.error("Fetch error:", err);
      setDeliveries([]); // Ensure deliveries is always an array
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability status - FIXED
  const toggleAvailability = async (id, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "available" ? "unavailable" : "available";

      console.log(`Updating delivery ${id} to ${newStatus}`);

      const response = await axios.patch(
        `${API_BASE_URL}/delivery-stops/${id}`,
        {
          available: newStatus,
        }
      );

      // FIX: Your backend returns { success: true, data: {...} }
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
      console.error("Update error:", err.response?.data || err.message);
      setError(
        `Failed to update delivery status: ${
          err.response?.data?.error || err.message
        }`
      );
      throw err;
    }
  };

  // Delete delivery permanently - FIXED
  const deleteDelivery = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/delivery-stops/${id}`
      );

      // FIX: Your backend returns { success: true, message: '...' }
      const apiResponse = response.data;

      if (apiResponse.success) {
        setDeliveries((prev) => prev.filter((delivery) => delivery._id !== id));
      } else {
        throw new Error(apiResponse.error || "Failed to delete delivery");
      }
    } catch (err) {
      setError("Failed to delete delivery");
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
