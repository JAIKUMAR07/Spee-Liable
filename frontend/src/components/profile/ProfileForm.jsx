import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const { loading, error, success, updateProfile, clearMessages } =
    useProfile();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user ID safely (now it will always work)
  const getUserId = () => {
    return user?.id || user?._id || "Not available";
  };

  // Initialize form with user data
  useEffect(() => {
    if (user && !isInitialized) {
      console.log("🔄 Initializing form with user:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // Clear messages when editing state changes
  useEffect(() => {
    clearMessages();
  }, [isEditing, clearMessages]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const result = await updateProfile(formData);
    console.log("📨 API Response:", result);

    if (result.success) {
      // Update global auth state
      if (typeof updateUser === "function") {
        console.log("🔄 Updating user context with:", result.user);

        // Normalize the API response user data
        const normalizedUser = {
          ...result.user,
          id: result.user?.id || result.user?._id,
          _id: result.user?._id || result.user?.id,
        };

        console.log("✅ Normalized update user:", normalizedUser);
        updateUser(normalizedUser);
      }
      setIsEditing(false);
      setTimeout(() => clearMessages(), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
    clearMessages();
  };

  // Show loading until user data is available and form is initialized
  if (!user || !isInitialized) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Profile updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={getUserId()}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            value={user.role || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed capitalize"
          />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "💾 Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
