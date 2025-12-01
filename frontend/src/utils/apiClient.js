import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = apiBase.replace(/\/$/, "") + "/api";

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // ✅ Add timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // ✅ Better error messages
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout - Please check your connection";
    }

    if (!error.response) {
      error.message = "Network error - Please check your internet connection";
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (userData) => apiClient.put("/auth/profile", userData),
  changePassword: (passwordData) =>
    apiClient.put("/auth/password", passwordData),
};

// Delivery Stops API
export const deliveryStopsAPI = {
  getAll: () => apiClient.get("/delivery-stops"),
  create: (stopData) => apiClient.post("/delivery-stops", stopData),
  update: (id, updateData) =>
    apiClient.patch(`/delivery-stops/${id}`, updateData),
  delete: (id) => apiClient.delete(`/delivery-stops/${id}`),
};

// Delivery Marks API (for bulk operations)
export const deliveryMarksAPI = {
  deleteAll: () => apiClient.delete("/delivery-marks"),
};

// Optimization API
export const optimizationAPI = {
  optimizeRoute: (data) => apiClient.post("/optimization/optimize-route", data),
};

export default apiClient;
