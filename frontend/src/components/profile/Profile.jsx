import React from "react";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

const getRoleBadgeColor = (role) => {
  switch (role) {
    case "admin":
      return "bg-violet-100 text-violet-700";
    case "manager":
      return "bg-sky-100 text-sky-700";
    case "driver":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Profile</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Manage your account settings and personal information.</p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-extrabold text-indigo-700 sm:h-16 sm:w-16 sm:text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">{user?.name}</h2>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Member since</p>
                <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProfileForm />
            <PasswordForm />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
