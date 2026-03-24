import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../utils/apiClient";

const STAT_CARDS = [
  { role: "all", label: "Total Users", tone: "indigo" },
  { role: "admin", label: "Admins", tone: "violet" },
  { role: "driver", label: "Drivers", tone: "emerald" },
  { role: "customer", label: "Customers", tone: "sky" },
];

const toneClasses = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
};

const roleBadge = {
  admin: "bg-violet-100 text-violet-700",
  driver: "bg-emerald-100 text-emerald-700",
  customer: "bg-sky-100 text-sky-700",
};

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");

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
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update role");
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await usersAPI.updateStatus(userId, isActive);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive } : u)));
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update status");
    }
  };

  const filteredUsers = users.filter((u) => (filterRole === "all" ? true : u.role === filterRole));

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[calc(100vh-130px)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="mt-4 text-slate-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Manage user roles and account status.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STAT_CARDS.map((card) => {
              const count = card.role === "all" ? users.length : users.filter((u) => u.role === card.role).length;
              const active = filterRole === card.role;

              return (
                <button
                  key={card.role}
                  onClick={() => setFilterRole(card.role)}
                  className={`rounded-xl border p-4 text-left shadow-sm transition ${
                    active ? toneClasses[card.tone] : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-2xl font-extrabold">{count}</p>
                  <p className="text-sm font-semibold">{card.label}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800 sm:text-xl">
              {filterRole === "all"
                ? "All Registered Users"
                : `${filterRole.charAt(0).toUpperCase() + filterRole.slice(1)} Users`}
            </h2>

            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-600">
                No users found in this category.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((userItem) => {
                  const isCurrentUser = user.id === userItem._id;
                  return (
                    <article key={userItem._id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">{userItem.name}</h3>
                            {isCurrentUser && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                You
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-slate-600">{userItem.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${roleBadge[userItem.role] || "bg-slate-100 text-slate-700"}`}>
                              {userItem.role}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                userItem.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {userItem.isActive ? "Active" : "Deactivated"}
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                          <select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                            disabled={isCurrentUser}
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 ${
                              isCurrentUser
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                : "border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={() => handleStatusChange(userItem._id, !userItem.isActive)}
                            disabled={isCurrentUser}
                            className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                              isCurrentUser
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                : userItem.isActive
                                ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {userItem.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UserManagement;
