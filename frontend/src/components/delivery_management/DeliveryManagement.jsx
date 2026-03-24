import React from "react";
import Layout from "../layout/Layout";
import { useDeliveryManagement } from "./hooks/useDeliveryManagement";
import DeliveryCard from "./DeliveryCard";
import { useMapOperations } from "../map/hooks/useMapOperations";
import { personalStopsAPI } from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

const Section = ({ title, count, tone, children }) => {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "rose"
      ? "bg-rose-100 text-rose-700"
      : tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-orange-100 text-orange-700";

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${toneClass}`}>
          {count}
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
};

const DeliveryManagement = () => {
  const {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    toggleAvailability,
    deleteDelivery,
    setError,
  } = useDeliveryManagement();

  const { refreshDeliveries } = useMapOperations();
  const { user, can } = useAuth();
  const [personalStops, setPersonalStops] = React.useState([]);

  const fetchPersonalStops = async () => {
    try {
      const response = await personalStopsAPI.getAll();
      const apiResponse = response.data;
      if (apiResponse.success) {
        setPersonalStops(apiResponse.data || []);
      } else {
        setPersonalStops([]);
      }
    } catch {
      setPersonalStops([]);
    }
  };

  React.useEffect(() => {
    fetchPersonalStops();
  }, []);

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      if (!can("manage_deliveries")) {
        alert("You don't have permission to manage deliveries");
        return;
      }

      await toggleAvailability(id, currentStatus);
      await refreshDeliveries();

      const newStatus = currentStatus === "available" ? "unavailable" : "available";
      if (newStatus === "unavailable") {
        alert("Stop marked as unavailable and removed from map routing.");
      } else {
        alert("Stop marked as available and added to map routing.");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteDelivery = async (id) => {
    const hasDeletePermission = can("delete_records") || can("delete_own_records");

    if (!hasDeletePermission) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    try {
      await deleteDelivery(id);
      alert("Delivery stop deleted successfully!");
    } catch {
      alert("Failed to delete delivery");
    }
  };

  const handleDeletePersonalStop = async (id, name) => {
    if (!can("manage_deliveries")) {
      alert("You don't have permission to delete personal stops");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await personalStopsAPI.delete(id);
      setPersonalStops((prev) => prev.filter((stop) => stop._id !== id));
      alert("Personal stop deleted successfully!");
    } catch {
      alert("Failed to delete personal stop");
    }
  };

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
  const availableDeliveries = safeDeliveries.filter((d) => d.available === "available");
  const unavailableDeliveries = safeDeliveries.filter((d) => d.available === "unavailable");
  const unknownDeliveries = safeDeliveries.filter((d) => !d.available || d.available === "unknown");

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[calc(100vh-130px)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="mt-4 font-medium text-slate-600">Loading deliveries...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Delivery Management</h1>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">Manage your assigned delivery stops and personal stops.</p>
                <p className="mt-1 text-sm font-semibold text-indigo-700">Signed in as: {user?.name}</p>
              </div>
              <button
                onClick={() => {
                  fetchDeliveries();
                  fetchPersonalStops();
                }}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-700 bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Refresh List
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <div className="flex items-start justify-between gap-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-lg font-bold leading-none">x</button>
              </div>
            </div>
          )}

          {personalStops.length > 0 && (
            <Section title="Personal Stops" count={personalStops.length} tone="orange">
              {personalStops.map((stop) => (
                <article key={stop._id} className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{stop.name || "Personal Stop"}</h3>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">Personal</span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-900">Reason:</span> {stop.reason || "N/A"}</p>
                    <p><span className="font-semibold text-slate-900">Address:</span> {stop.address || "N/A"}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalStop(stop._id, stop.name || "Personal Stop")}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Delete Personal Stop
                  </button>
                </article>
              ))}
            </Section>
          )}

          {availableDeliveries.length > 0 && (
            <Section title="Available Delivery Stops" count={availableDeliveries.length} tone="emerald">
              {availableDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  onToggleAvailability={handleToggleAvailability}
                  onDelete={handleDeleteDelivery}
                  canManage={can("manage_deliveries")}
                  canDelete={can("delete_records") || can("delete_own_records")}
                />
              ))}
            </Section>
          )}

          {unavailableDeliveries.length > 0 && (
            <Section title="Unavailable Delivery Stops" count={unavailableDeliveries.length} tone="rose">
              {unavailableDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  onToggleAvailability={handleToggleAvailability}
                  onDelete={handleDeleteDelivery}
                  canManage={can("manage_deliveries")}
                  canDelete={can("delete_records") || can("delete_own_records")}
                />
              ))}
            </Section>
          )}

          {unknownDeliveries.length > 0 && (
            <Section title="Unknown Status" count={unknownDeliveries.length} tone="amber">
              {unknownDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  onToggleAvailability={handleToggleAvailability}
                  onDelete={handleDeleteDelivery}
                  canManage={can("manage_deliveries")}
                  canDelete={can("delete_records") || can("delete_own_records")}
                />
              ))}
            </Section>
          )}

          {safeDeliveries.length === 0 && personalStops.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
              <h3 className="text-xl font-bold text-slate-800">No stops found</h3>
              <p className="mt-2 text-slate-600">Add delivery or personal stops first.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default DeliveryManagement;
