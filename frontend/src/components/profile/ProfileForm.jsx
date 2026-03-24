import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const { loading, error, success, updateProfile, clearMessages } = useProfile();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const getUserId = () => user?.id || user?._id || "Not available";

  useEffect(() => {
    if (user && !isInitialized) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

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

    if (result.success) {
      if (typeof updateUser === "function") {
        const normalizedUser = {
          ...result.user,
          id: result.user?.id || result.user?._id,
          _id: result.user?._id || result.user?.id,
        };
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

  if (!user || !isInitialized) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-slate-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-extrabold text-slate-900">Profile Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-indigo-700 bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Profile updated successfully.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">User ID</label>
          <input
            type="text"
            value={getUserId()}
            disabled
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-sm text-slate-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
          <input
            type="text"
            value={user.role || ""}
            disabled
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 capitalize text-slate-700"
          />
        </div>

        {isEditing && (
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
