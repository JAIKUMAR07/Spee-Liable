import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated, can } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  // Navigation based on user role
  const getNavLinks = () => {
    if (!user) return null;

    const links = [];

    // Common links for all roles
    links.push(
      <li key="home">
        <Link to={"/"}>Home</Link>
      </li>
    );
    links.push(
      <li key="profile">
        <Link to="/profile">Profile</Link>
      </li>
    );

    // Driver-specific links
    if (can("scan_qr")) {
      links.push(
        <li key="qr">
          <Link to={"/qrpage"}>QR Scanner</Link>
        </li>
      );
    }
    if (can("optimize_routes")) {
      links.push(
        <li key="map">
          <Link to={"/map"}>Map</Link>
        </li>
      );
    }
    if (can("manage_deliveries")) {
      links.push(
        <li key="management">
          <Link to="/delivery-management">Management</Link>
        </li>
      );
    }

    // Customer-specific links
    if (can("view_notifications")) {
      links.push(
        <li key="customer-dash">
          <Link to="/customer-dashboard">My Dashboard</Link>
        </li>
      );
    }

    // Admin-specific links
    if (can("view_users")) {
      links.push(
        <li key="users">
          <Link to="/user-management">User Management</Link>
        </li>
      );
    }

    return links;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "driver":
        return "bg-green-100 text-green-800";
      case "customer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-sky-400 to-emerald-400">
      <div className="lg:flex lg:justify-between items-center py-3 lg:px-3">
        {/* Left - Logo */}
        <div className="left py-3 lg:py-0">
          <h2 className="font-bold text-black text-2xl text-center">
            SpeeLiable
          </h2>
        </div>

        {/* Right - Navigation */}
        <div className="right flex justify-center mb-4 lg:mb-0">
          {isAuthenticated ? (
            <>
              <ul className="flex space-x-3 text-black font-bold text-md px-5">
                {getNavLinks()}
              </ul>

              {/* User Dropdown */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition"
                >
                  <span className="text-black font-semibold">{user?.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    {user?.role}
                  </span>
                  <span>▼</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-semibold">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-white/20 px-4 py-2 rounded-lg text-black font-semibold hover:bg-white/30 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white px-4 py-2 rounded-lg text-black font-semibold hover:bg-gray-100 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
