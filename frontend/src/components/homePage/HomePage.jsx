import React from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, can } = useAuth();

  const getRoleSpecificContent = () => {
    if (!user) return null;

    if (user.role === "driver") {
      return (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            🚚 Driver Dashboard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage deliveries, scan packages, and optimize your routes
            efficiently.
          </p>
        </div>
      );
    }

    if (user.role === "customer") {
      return (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            📦 Customer Portal
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your packages, receive notifications, and manage delivery
            preferences.
          </p>
        </div>
      );
    }

    if (user.role === "admin") {
      return (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            ⚙️ Admin Panel
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage users, monitor system activity, and oversee delivery
            operations.
          </p>
        </div>
      );
    }
  };

  const getRoleSpecificCards = () => {
    if (!user) return null;

    if (user.role === "driver") {
      return (
        <div className="flex gap-8 flex-wrap justify-center mt-6">
          <Link
            to="/qrpage"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/12216/12216522.png"
              alt="Scan QR Codes"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              Scan Packages
            </h1>
          </Link>

          <Link
            to="/map"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
              alt="Explore Map"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              Delivery Routes
            </h1>
          </Link>

          <Link
            to="/delivery-management"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3063/3063512.png"
              alt="Manage Deliveries"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              Manage Deliveries
            </h1>
          </Link>
        </div>
      );
    }

    if (user.role === "customer") {
      return (
        <div className="flex gap-8 flex-wrap justify-center mt-6">
          <Link
            to="/customer-dashboard"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1827/1827344.png"
              alt="Dashboard"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              My Dashboard
            </h1>
          </Link>

          <Link
            to="/customer-dashboard?tab=notifications"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/565/565422.png"
              alt="Notifications"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              Notifications
            </h1>
          </Link>
        </div>
      );
    }

    if (user.role === "admin") {
      return (
        <div className="flex gap-8 flex-wrap justify-center mt-6">
          <Link
            to="/user-management"
            className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
              alt="User Management"
              className="w-24 h-24 object-contain mb-4 drop-shadow-sm"
            />
            <h1 className="text-center text-lg font-bold text-gray-800">
              User Management
            </h1>
          </Link>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-130px)] bg-gradient-to-br from-emerald-50 via-white to-sky-100/50 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl ">
          <h1 className="text-5xl font-extrabold mb-4 text-center text-teal-950 tracking-tight">
            Welcome to SpeeLiable
          </h1>
          <p className="text-gray-600 mb-10 text-center max-w-md mx-auto">
            {user?.role === "driver" &&
              "Efficient delivery management for drivers"}
            {user?.role === "customer" &&
              "Track your packages and delivery status"}
            {user?.role === "admin" &&
              "Administrative control and user management"}
            {!user &&
              "Scan QR codes, manage deliveries, and track packages efficiently"}
          </p>

          {getRoleSpecificContent()}
          {getRoleSpecificCards()}

          {/* Default content for non-authenticated users */}
          {!user && (
            <div className="flex gap-8 flex-wrap justify-center mt-6">
              <Link
                to="/login"
                className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/565/565422.png"
                  alt="Login"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h1 className="text-center text-lg font-bold text-gray-800">
                  Login
                </h1>
              </Link>

              <Link
                to="/register"
                className="w-56 h-auto min-h-[14rem] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col items-center justify-center p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1000/1000997.png"
                  alt="Register"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h1 className="text-center text-lg font-bold text-gray-800">
                  Register
                </h1>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
