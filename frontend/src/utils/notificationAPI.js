import apiClient from "./apiClient";

export const notificationAPI = {
  // Get user notifications
  getNotifications: (page = 1, limit = 20) =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`),

  // Mark notification as read - FIXED URL
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => apiClient.patch("/notifications/read-all"),

  // Get unread count
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),

  // Delete notification
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
};

export const customerAPI = {
  // Get customer packages - FIXED URL
  getMyPackages: () => apiClient.get("/delivery-stops/customer/my-packages"),

  // Update package availability - FIXED URL
  updatePackageAvailability: (id, available) =>
    apiClient.patch(`/delivery-stops/${id}/availability`, { available }),
};

export const deliveryAPI = {
  // Scan package with customer email
  scanPackage: (packageData) => apiClient.post("/delivery-stops", packageData),
};
