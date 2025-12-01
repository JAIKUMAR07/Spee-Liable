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
        <div className="flex gap-6 flex-wrap justify-center">
          <Link
            to="/qrpage"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/12216/12216522.png"
              alt="Scan QR Codes"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              Scan Packages
            </h1>
          </Link>

          <Link
            to="/map"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
              alt="Explore Map"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              Delivery Routes
            </h1>
          </Link>

          <Link
            to="/delivery-management"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3063/3063512.png"
              alt="Manage Deliveries"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              Manage Deliveries
            </h1>
          </Link>
        </div>
      );
    }

    if (user.role === "customer") {
      return (
        <div className="flex gap-6 flex-wrap justify-center">
          <Link
            to="/customer-dashboard"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1827/1827344.png"
              alt="Dashboard"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              My Dashboard
            </h1>
          </Link>

          <Link
            to="/customer-dashboard?tab=notifications"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/565/565422.png"
              alt="Notifications"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              Notifications
            </h1>
          </Link>
        </div>
      );
    }

    if (user.role === "admin") {
      return (
        <div className="flex gap-6 flex-wrap justify-center">
          <Link
            to="/user-management"
            className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
              alt="User Management"
              className="w-full h-3/4 object-contain p-4"
            />
            <h1 className="text-center text-lg font-semibold py-2">
              User Management
            </h1>
          </Link>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Welcome to Speeliable
          </h1>
          <p className="text-gray-600 mb-10 text-center max-w-md">
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
            <div className="flex gap-6 flex-wrap justify-center">
              <Link
                to="/login"
                className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/565/565422.png"
                  alt="Login"
                  className="w-full h-3/4 object-contain p-4"
                />
                <h1 className="text-center text-lg font-semibold py-2">
                  Login
                </h1>
              </Link>

              <Link
                to="/register"
                className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1000/1000997.png"
                  alt="Register"
                  className="w-full h-3/4 object-contain p-4"
                />
                <h1 className="text-center text-lg font-semibold py-2">
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
