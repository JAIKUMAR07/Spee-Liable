import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch users from API
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: "John Driver",
          email: "driver@speeliable.com",
          role: "driver",
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Alice Customer",
          email: "alice@example.com",
          role: "customer",
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "Bob Customer",
          email: "bob@example.com",
          role: "customer",
          isActive: false,
          createdAt: new Date(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRoleChange = (userId, newRole) => {
    // TODO: Update user role via API
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  };

  const handleStatusChange = (userId, isActive) => {
    // TODO: Update user status via API
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive } : u)),
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage all registered users in the system
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {users.length}
              </div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.role === "driver").length}
              </div>
              <div className="text-gray-600">Delivery Drivers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.role === "customer").length}
              </div>
              <div className="text-gray-600">Customers</div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Registered Users
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((userItem) => (
                <div key={userItem.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {userItem.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {userItem.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {userItem.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              userItem.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : userItem.role === "driver"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {userItem.role}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              userItem.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {userItem.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={userItem.role}
                        onChange={(e) =>
                          handleRoleChange(userItem.id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                      >
                        <option value="customer">Customer</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() =>
                          handleStatusChange(userItem.id, !userItem.isActive)
                        }
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          userItem.isActive
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {userItem.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
