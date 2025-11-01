const ManualForm = ({
  name,
  address,
  onNameChange,
  onAddressChange,
  onSubmit,
  loading,
}) => {
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-3">Add Delivery Stop</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Enter Location Name"
          value={name}
          onChange={onNameChange}
          disabled={loading}
          className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Enter Full Address"
          value={address}
          onChange={onAddressChange}
          disabled={loading}
          className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            "➕ Add to Database"
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualForm;
