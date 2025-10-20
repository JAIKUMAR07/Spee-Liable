import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const useDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all deliveries
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/delivery-stops`);
      setDeliveries(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch deliveries");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability status
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

      // Update local state
      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery._id === id ? { ...delivery, available: newStatus } : delivery
        )
      );

      console.log(`Successfully updated to ${newStatus}`);
      return response.data;
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      setError(
        `Failed to update delivery status: ${
          err.response?.data?.message || err.message
        }`
      );
      throw err;
    }
  };

  // Delete delivery permanently
  const deleteDelivery = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/delivery-stops/${id}`);
      setDeliveries((prev) => prev.filter((delivery) => delivery._id !== id));
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
