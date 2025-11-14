import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const navList = (
    <ul className="flex space-x-3 text-black font-bold text-md px-5">
      <li>
        <Link to={"/"}>Home</Link>
      </li>
      <li>
        <Link to={"/qrpage"}>Qr-Scan</Link>
      </li>
      <li>
        <Link to={"/map"}>Map</Link>
      </li>
      <li>
        <Link to="/delivery-management">Management</Link>
      </li>
    </ul>
  );

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
              {navList}

              {/* User Dropdown */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition"
                >
                  <span className="text-black font-semibold">{user?.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user?.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : user?.role === "manager"
                        ? "bg-blue-100 text-blue-800"
                        : user?.role === "driver"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
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
