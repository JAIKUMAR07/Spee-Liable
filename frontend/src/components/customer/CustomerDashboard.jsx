import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { notificationAPI, customerAPI } from "../../utils/notificationAPI";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.data);
    } catch {
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getMyPackages();
      setPackages(response.data.data);
    } catch {
      alert("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (packageId, newStatus) => {
    try {
      await customerAPI.updatePackageAvailability(packageId, newStatus);

      setPackages((prev) => prev.map((pkg) => (pkg._id === packageId ? { ...pkg, available: newStatus } : pkg)));

      if (socket) {
        socket.emit("package-status-updated", {
          packageId,
          status: newStatus,
          customerId: user.id,
          customerName: user.name,
        });
      }

      await fetchNotifications();
      alert(`Package marked as ${newStatus}`);
    } catch {
      alert("Failed to update package status");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif))
      );
    } catch {
      // no-op
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      if (!response?.data?.success) throw new Error("Delete failed");
      await fetchNotifications();
    } catch {
      alert("Failed to delete notification");
    }
  };

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    } else {
      fetchPackages();
    }
  }, [activeTab]);

  return (
    <Layout>
      <section className="min-h-[calc(100vh-132px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, <span className="text-indigo-700">{user?.name}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Track your packages and manage delivery notifications.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-2">
              <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "notifications"
                      ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border border-transparent bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  Notifications ({notifications.filter((n) => !n.isRead).length})
                </button>
                <button
                  onClick={() => setActiveTab("packages")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "packages"
                      ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border border-transparent bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  My Packages ({packages.length})
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {activeTab === "notifications" && (
                <NotificationsTab
                  notifications={notifications}
                  loading={loading}
                  onMarkAsRead={handleMarkAsRead}
                  onDeleteNotification={handleDeleteNotification}
                />
              )}
              {activeTab === "packages" && (
                <PackagesTab packages={packages} loading={loading} onStatusUpdate={handleStatusUpdate} />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const LoadingState = ({ label }) => (
  <div className="py-8 text-center">
    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    <p className="mt-2 text-slate-600">{label}</p>
  </div>
);

const EmptyState = ({ label }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-600">
    {label}
  </div>
);

const NotificationsTab = ({ notifications, loading, onMarkAsRead, onDeleteNotification }) => {
  if (loading) return <LoadingState label="Loading notifications..." />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold text-slate-900">Your Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => notifications.forEach((n) => !n.isRead && onMarkAsRead(n._id))}
            className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState label="No notifications yet." />
        ) : (
          notifications.map((notification) => (
            <article
              key={notification._id}
              className={`cursor-pointer rounded-xl border p-4 transition sm:p-5 ${
                notification.isRead
                  ? "border-slate-200 bg-white hover:bg-slate-50"
                  : "border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50"
              }`}
              onClick={() => !notification.isRead && onMarkAsRead(notification._id)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{notification.title}</h3>
                  <p className="mt-1 text-sm text-slate-700">{notification.message}</p>
                  {notification.deliveryStop && (
                    <p className="mt-2 text-xs text-slate-600">Package: {notification.deliveryStop.name}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>

                {!notification.isRead && (
                  <span className="inline-flex rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">New</span>
                )}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notification._id);
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>

              {notification.actionRequired && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
                  Action required: Please update your package availability.
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};

const PackagesTab = ({ packages, loading, onStatusUpdate }) => {
  if (loading) return <LoadingState label="Loading packages..." />;

  return (
    <div>
      <h2 className="mb-4 text-xl font-extrabold text-slate-900">Your Packages</h2>
      <div className="space-y-3">
        {packages.length === 0 ? (
          <EmptyState label="No packages yet." />
        ) : (
          packages.map((pkg) => (
            <article key={pkg._id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-700">{pkg.address}</p>
                  {pkg.assignedTo && <p className="mt-1 text-sm text-slate-600">Driver: {pkg.assignedTo.name}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        pkg.available === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : pkg.available === "unavailable"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {pkg.available}
                    </span>
                    <span className="text-xs text-slate-500">
                      Scanned: {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    onClick={() => onStatusUpdate(pkg._id, "available")}
                    disabled={pkg.available === "available"}
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${
                      pkg.available === "available"
                        ? "cursor-not-allowed bg-emerald-200 text-emerald-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => onStatusUpdate(pkg._id, "unavailable")}
                    disabled={pkg.available === "unavailable"}
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${
                      pkg.available === "unavailable"
                        ? "cursor-not-allowed bg-rose-200 text-rose-700"
                        : "bg-rose-600 text-white hover:bg-rose-700"
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
