import React from "react";
import { Trash2 } from "lucide-react";

const StopsList = ({ stops, onDeleteStop, loading, canDelete = false }) => {
  if (loading) {
    return (
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-slate-600">Loading stops...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-xl font-extrabold text-slate-900">My Delivery Stops ({stops.length})</h3>

      <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
        You can manage and delete your own delivery stops.
      </div>

      {stops.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {stops.map((stop, index) => (
            <li key={stop._id || index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{stop.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        stop.available === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : stop.available === "unavailable"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {stop.available || "unknown"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs text-slate-700 sm:grid-cols-2 sm:gap-x-4">
                    <p><span className="font-semibold text-slate-900">Address:</span> {stop.address || "N/A"}</p>
                    <p><span className="font-semibold text-slate-900">Customer Email:</span> {stop.customer?.email || "N/A"}</p>
                    <p><span className="font-semibold text-slate-900">Customer Name:</span> {stop.customer?.name || "N/A"}</p>
                    <p><span className="font-semibold text-slate-900">Mobile:</span> {stop.mobile_number || "N/A"}</p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => onDeleteStop(stop._id, stop.name)}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-700 bg-rose-600 p-2 text-white transition hover:bg-rose-700 disabled:opacity-50"
                    title="Delete this stop"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 italic text-slate-500">No stops added yet.</p>
      )}
    </div>
  );
};

export default StopsList;
