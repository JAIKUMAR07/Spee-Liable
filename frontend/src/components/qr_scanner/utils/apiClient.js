import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const deliveryStopsAPI = {
  // Get all delivery stops
  getAll: () => axios.get(`${API_BASE_URL}/delivery-stops`),

  // Create new delivery stop
  create: (stopData) => axios.post(`${API_BASE_URL}/delivery-stops`, stopData),

  // Delete delivery stop
  delete: (id) => axios.delete(`${API_BASE_URL}/delivery-stops/${id}`),

  // Delete all delivery stops
  deleteAll: () => axios.delete(`${API_BASE_URL}/delivery-stops`),
};
