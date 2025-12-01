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
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-3">Scan Package Manually</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter package details and customer email to scan a package
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package Name *
          </label>
          <input
            type="text"
            placeholder="e.g., iPhone 15, MacBook Pro, etc."
            value={name}
            onChange={onNameChange}
            disabled={loading}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address *
          </label>
          <input
            type="text"
            placeholder="Full delivery address"
            value={address}
            onChange={onAddressChange}
            disabled={loading}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Email *
          </label>
          <input
            type="email"
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={onCustomerEmailChange}
            disabled={loading}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Customer will receive notification to update package status
          </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={
            loading || !name.trim() || !address.trim() || !customerEmail.trim()
          }
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Scanning...
            </>
          ) : (
            "📦 Scan Package"
          )}
        </button>

        {/* Help text */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <strong>How it works:</strong>
            <br />
            1. Enter package details and customer email
            <br />
            2. Customer gets notification to update availability
            <br />
            3. Package appears on map when marked "available"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualForm;
