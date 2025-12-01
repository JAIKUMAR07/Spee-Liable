import React from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

const Profile = () => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "driver":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your account settings and personal information
            </p>
          </div>

          {/* User Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-indigo-600 font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {user?.name}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 capitalize ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <ProfileForm />
            </div>

            {/* Password Change */}
            <div className="lg:col-span-1">
              <PasswordForm />
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Account Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">📦</div>
                <div className="text-sm text-gray-600 mt-1">My Deliveries</div>
                <div className="text-lg font-semibold text-gray-800">
                  Coming Soon
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm text-gray-600 mt-1">Completed</div>
                <div className="text-lg font-semibold text-gray-800">
                  Coming Soon
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">⏳</div>
                <div className="text-sm text-gray-600 mt-1">Pending</div>
                <div className="text-lg font-semibold text-gray-800">
                  Coming Soon
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">⭐</div>
                <div className="text-sm text-gray-600 mt-1">Rating</div>
                <div className="text-lg font-semibold text-gray-800">-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
