import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { notificationAPI, customerAPI } from "../../utils/notificationAPI";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getMyPackages();
      setPackages(response.data.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  // Update package status
  const handleStatusUpdate = async (packageId, newStatus) => {
    try {
      await customerAPI.updatePackageAvailability(packageId, newStatus);

      // Update local state
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg._id === packageId ? { ...pkg, available: newStatus } : pkg
        )
      );

      alert(`Package marked as ${newStatus}`);

      // Refresh notifications to show status update
      fetchNotifications();
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Failed to update package status");
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    } else if (activeTab === "packages") {
      fetchPackages();
    }
  }, [activeTab]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Track your packages and manage delivery notifications
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "notifications"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🔔 Notifications (
                  {notifications.filter((n) => !n.isRead).length})
                </button>
                <button
                  onClick={() => setActiveTab("packages")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "packages"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📦 My Packages ({packages.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "notifications" && (
                <NotificationsTab
                  notifications={notifications}
                  loading={loading}
                  onMarkAsRead={handleMarkAsRead}
                />
              )}
              {activeTab === "packages" && (
                <PackagesTab
                  packages={packages}
                  loading={loading}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Notifications Tab Component
const NotificationsTab = ({ notifications, loading, onMarkAsRead }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() =>
              notifications.forEach((n) => !n.isRead && onMarkAsRead(n._id))
            }
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p>No notifications yet</p>
            <p className="text-sm mt-1">
              You'll get notifications when drivers scan your packages
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border rounded-lg cursor-pointer ${
                notification.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
              onClick={() =>
                !notification.isRead && onMarkAsRead(notification._id)
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  {notification.deliveryStop && (
                    <p className="text-sm text-gray-500 mt-2">
                      Package: {notification.deliveryStop.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    New
                  </span>
                )}
              </div>
              {notification.actionRequired && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                  ⚠️ Action required: Please update your package availability
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Packages Tab Component
const PackagesTab = ({ packages, loading, onStatusUpdate }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading packages...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Packages</h2>
      <div className="space-y-4">
        {packages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>No packages yet</p>
            <p className="text-sm mt-1">
              Your packages will appear here once scanned by delivery drivers
            </p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{pkg.address}</p>
                  {pkg.assignedTo && (
                    <p className="text-sm text-gray-500 mt-1">
                      Driver: {pkg.assignedTo.name}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pkg.available === "available"
                          ? "bg-green-100 text-green-800"
                          : pkg.available === "unavailable"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {pkg.available}
                    </span>
                    <span className="text-xs text-gray-500">
                      Scanned: {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onStatusUpdate(pkg._id, "available")}
                    disabled={pkg.available === "available"}
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      pkg.available === "available"
                        ? "bg-green-300 text-white cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => onStatusUpdate(pkg._id, "unavailable")}
                    disabled={pkg.available === "unavailable"}
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      pkg.available === "unavailable"
                        ? "bg-red-300 text-white cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>Note:</strong> Packages marked as "available" will
                  appear on delivery maps. "Unavailable" packages will be hidden
                  from drivers until marked available.
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
