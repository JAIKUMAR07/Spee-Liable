import React, { useState } from "react";
import { useProfile } from "../../hooks/useProfile";

const PasswordForm = () => {
  const { loading, error, success, changePassword, clearMessages } = useProfile();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const result = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (result.success) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => clearMessages(), 3000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-6 text-xl font-extrabold text-slate-900">Change Password</h3>

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Password changed successfully.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={loading}
            required
            minLength="6"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            placeholder="Enter new password (min 6 characters)"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
            minLength="6"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-indigo-700 bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordForm;
