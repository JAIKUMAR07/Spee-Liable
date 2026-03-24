import React from "react";
import { MapPin, Phone, Trash2, AlertTriangle, Eye } from "lucide-react";

const DeliveryCard = ({
  delivery,
  onToggleAvailability,
  onDelete,
  canManage = true,
  canDelete = false,
}) => {
  const handleToggle = async () => {
    if (!canManage) {
      alert("You don't have permission to manage delivery status");
      return;
    }

    try {
      await onToggleAvailability(delivery._id, delivery.available);
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      alert("You don't have permission to delete delivery stops");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${delivery.name}"?`)) {
      onDelete(delivery._id);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-lg font-extrabold text-slate-900 sm:text-xl">
          {delivery.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            delivery.available === "available"
              ? "bg-emerald-100 text-emerald-700"
              : delivery.available === "unavailable"
              ? "bg-rose-100 text-rose-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {delivery.available || "unknown"}
        </span>
      </div>

      <div className="mb-5 space-y-2">
        <div className="flex items-start gap-2 text-sm text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="line-clamp-2">{delivery.address}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Phone className="h-4 w-4 shrink-0 text-slate-500" />
          <p>{delivery.mobile_number || "N/A"}</p>
        </div>

        {delivery.location && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
            Lat: {delivery.location.lat?.toFixed(4)}, Lng: {delivery.location.lng?.toFixed(4)}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={handleToggle}
          disabled={!canManage}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition sm:flex-1 ${
            delivery.available === "available"
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          } ${!canManage ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {delivery.available === "available" ? "Mark Unavailable" : "Mark Available"}
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      {delivery.available === "unavailable" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          This stop will be excluded from route optimization
        </div>
      )}

      {!canManage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2 text-sm text-sky-700">
          <Eye className="h-4 w-4 shrink-0" />
          View only. Contact admin for changes.
        </div>
      )}
    </article>
  );
};

export default DeliveryCard;
