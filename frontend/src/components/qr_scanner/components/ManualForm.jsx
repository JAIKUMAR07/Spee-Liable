import React from "react";

const ManualForm = ({
  name,
  address,
  customerEmail,
  onNameChange,
  onAddressChange,
  onCustomerEmailChange,
  onSubmit,
  loading,
}) => {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-xl font-extrabold text-slate-900">Scan Package Manually</h3>
      <p className="mt-1 text-sm text-slate-600">Enter package details and customer email.</p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Package Name</label>
          <input
            type="text"
            placeholder="e.g. iPhone 15"
            value={name}
            onChange={onNameChange}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Delivery Address</label>
          <input
            type="text"
            placeholder="Full delivery address"
            value={address}
            onChange={onAddressChange}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Customer Email</label>
          <input
            type="email"
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={onCustomerEmailChange}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-slate-500">Customer receives a notification to update package status.</p>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !name.trim() || !address.trim() || !customerEmail.trim()}
          className="inline-flex w-full items-center justify-center rounded-xl border border-indigo-700 bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan Package"}
        </button>

        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
          1. Enter package details and customer email.
          <br />
          2. Customer updates availability from notification.
          <br />
          3. Available packages appear in route optimization.
        </div>
      </div>
    </div>
  );
};

export default ManualForm;
