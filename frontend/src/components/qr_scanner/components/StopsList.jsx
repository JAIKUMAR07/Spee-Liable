const StopsList = ({ stops, onDeleteStop, loading }) => {
  if (loading) {
    return (
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
        <p className="text-gray-500">Loading stops...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-3">
        Delivery Stops ({stops.length})
      </h3>
      {stops.length > 0 ? (
        <ul className="space-y-2">
          {stops.map((stop, index) => (
            <li
              key={stop._id || index}
              className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100 group"
            >
              <span className="font-medium text-gray-800">{stop.name}</span>
              <button
                onClick={() => onDeleteStop(stop._id, stop.name)}
                disabled={loading}
                className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No stops added yet.</p>
      )}
    </div>
  );
};

export default StopsList;
