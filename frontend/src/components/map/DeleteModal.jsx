import React from "react";

const DeleteModal = ({ showModal, deleting, onClose, onDelete }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-500">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          Confirm Deletion
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Are you sure you want to delete <strong>all</strong> delivery records?
          This cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onDelete} // Use onDelete directly
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes, Delete All"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
