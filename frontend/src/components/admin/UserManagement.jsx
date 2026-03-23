import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../utils/apiClient"; // Import users API

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all"); // 'all', 'driver', 'customer', 'admin'

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      setUsers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      alert("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update role");
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await usersAPI.updateStatus(userId, isActive);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
      );
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update status");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole === "all") return true;
    return u.role === filterRole;
  });

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100/40 py-8">
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

          {/* Stats & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition border-2 ${filterRole === 'all' ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-indigo-200'}`} 
              onClick={() => setFilterRole('all')}
            >
              <div className="text-2xl font-bold text-indigo-600">{users.length}</div>
              <div className="text-gray-600 font-medium">Total Users</div>
            </div>
            
            <div 
              className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition border-2 ${filterRole === 'admin' ? 'border-purple-500 bg-purple-50' : 'border-transparent hover:border-purple-200'}`} 
              onClick={() => setFilterRole('admin')}
            >
              <div className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === "admin").length}</div>
              <div className="text-gray-600 font-medium">Admins</div>
            </div>
            
            <div 
              className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition border-2 ${filterRole === 'driver' ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-green-200'}`} 
              onClick={() => setFilterRole('driver')}
            >
              <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.role === "driver").length}</div>
              <div className="text-gray-600 font-medium">Delivery Drivers</div>
            </div>
            
            <div 
              className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition border-2 ${filterRole === 'customer' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-200'}`} 
              onClick={() => setFilterRole('customer')}
            >
              <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "customer").length}</div>
              <div className="text-gray-600 font-medium">Customers</div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {filterRole === 'all' ? "All Registered Users" : `Registered ${filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}s`}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No users found in this category.
                </div>
              ) : (
                filteredUsers.map((userItem) => (
                  <div key={userItem._id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {userItem.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {userItem.name} {user.id === userItem._id && <span className="text-indigo-500 text-xs ml-1">(You)</span>}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {userItem.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-[2px] rounded-full text-xs font-semibold ${
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
                              className={`px-2 py-[2px] rounded-full text-xs font-semibold ${
                                userItem.isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {userItem.isActive ? "Active" : "Deactivated"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <select
                          value={userItem.role}
                          onChange={(e) =>
                            handleRoleChange(userItem._id, e.target.value)
                          }
                          disabled={user.id === userItem._id} // Prevent changing own role
                          className={`border rounded px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none ${
                            user.id === userItem._id ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 text-gray-700"
                          }`}
                        >
                          <option value="customer">Customer</option>
                          <option value="driver">Driver</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() =>
                            handleStatusChange(userItem._id, !userItem.isActive)
                          }
                          disabled={user.id === userItem._id} // Prevent deactivating own account
                          className={`px-3 py-1.5 rounded text-sm font-bold transition w-28 text-center border ${
                            user.id === userItem._id 
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : userItem.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                          }`}
                        >
                          {userItem.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
