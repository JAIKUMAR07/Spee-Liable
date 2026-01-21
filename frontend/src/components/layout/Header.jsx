import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, User, ChevronDown } from "lucide-react";

const Header = () => {
  const { user, logout, isAuthenticated, can } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  // Navigation based on user role
  const getNavLinks = () => {
    if (!user) return null;

    const links = [];

    // Common links for all roles
    links.push(
      <li key="home">
        <Link
          to={"/"}
          onClick={() => setShowMobileMenu(false)}
          className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg "
        >
          Home
        </Link>
      </li>
    );
    links.push(
      <li key="profile">
        <Link
          to="/profile"
          onClick={() => setShowMobileMenu(false)}
          className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
        >
          Profile
        </Link>
      </li>
    );

    // Driver-specific links
    if (can("scan_qr")) {
      links.push(
        <li key="qr">
          <Link
            to={"/qrpage"}
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
          >
            QR Scanner
          </Link>
        </li>
      );
    }
    if (can("optimize_routes")) {
      links.push(
        <li key="map">
          <Link
            to={"/map"}
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
          >
            Map
          </Link>
        </li>
      );
    }
    if (can("manage_deliveries")) {
      links.push(
        <li key="management">
          <Link
            to="/delivery-management"
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
          >
            Management
          </Link>
        </li>
      );
    }

    // Customer-specific links
    if (can("view_notifications")) {
      links.push(
        <li key="customer-dash">
          <Link
            to="/customer-dashboard"
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
          >
            My Dashboard
          </Link>
        </li>
      );
    }

    // Admin-specific links
    if (can("view_users")) {
      links.push(
        <li key="users">
          <Link
            to="/user-management"
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2 hover:bg-blue-50 rounded transition text-lg"
          >
            User Management
          </Link>
        </li>
      );
    }

    return links;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "driver":
        return "bg-green-100 text-green-800 border-green-200";
      case "customer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-sky-400 to-emerald-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h2 className="font-bold text-black text-2xl">SpeeLiable</h2>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && !isMobile && (
            <div className="hidden lg:flex items-center space-x-4">
              <ul className="flex space-x-4 text-black font-medium text-sm">
                {getNavLinks()}
              </ul>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <User size={18} className="text-black" />
                  <span className="text-black font-semibold text-sm">
                    {user?.name.split(" ")[0]}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    {user?.role}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b">
                      <div className="font-semibold text-gray-900">
                        {user?.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user?.email}
                      </div>
                      <div className="flex items-center mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user?.role
                          )}`}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User size={16} className="mr-2" />
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login/Register for desktop when not authenticated */}
          {!isAuthenticated && !isMobile && (
            <div className="hidden lg:flex space-x-3">
              <Link
                to="/login"
                className="bg-white/20 px-4 py-2 rounded-lg text-black font-semibold hover:bg-white/30 transition text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white px-4 py-2 rounded-lg text-black font-semibold hover:bg-gray-100 transition text-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="lg:hidden">
            {isAuthenticated ? (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                <span className="text-black font-semibold text-sm">
                  {user?.name.split(" ")[0]}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden bg-white rounded-lg shadow-lg mt-2 py-2 border border-gray-200"
          >
            {isAuthenticated ? (
              <>
                {/* User Info in Mobile Menu */}
                <div className="px-4 py-3 border-b">
                  <div className="font-semibold text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  <div className="flex items-center mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                        user?.role
                      )}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <ul className="py-2">{getNavLinks()}</ul>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 border-t"
                >
                  <User size={18} className="mr-2" />
                  View Profile
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 border-t"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="py-2">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-t"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
