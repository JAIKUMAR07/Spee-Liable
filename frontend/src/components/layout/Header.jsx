import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, User, ChevronDown } from "lucide-react";

const Header = () => {
  const { user, logout, isAuthenticated, can } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  const navLinkClass =
    "block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700";

  const getNavLinks = (isMobile = false) => {
    if (!user) return null;

    const onClick = () => isMobile && setShowMobileMenu(false);

    return (
      <>
        <li>
          <Link to="/" onClick={onClick} className={navLinkClass}>
            Home
          </Link>
        </li>
        {can("scan_qr") && (
          <li>
            <Link to="/qrpage" onClick={onClick} className={navLinkClass}>
              QR Scanner
            </Link>
          </li>
        )}
        {can("optimize_routes") && (
          <li>
            <Link to="/map" onClick={onClick} className={navLinkClass}>
              Map
            </Link>
          </li>
        )}
        {can("manage_deliveries") && (
          <li>
            <Link
              to="/delivery-management"
              onClick={onClick}
              className={navLinkClass}
            >
              Management
            </Link>
          </li>
        )}
        {can("view_notifications") && (
          <li>
            <Link
              to="/customer-dashboard"
              onClick={onClick}
              className={navLinkClass}
            >
              My Dashboard
            </Link>
          </li>
        )}
        {can("view_users") && (
          <li>
            <Link
              to="/user-management"
              onClick={onClick}
              className={navLinkClass}
            >
              User Management
            </Link>
          </li>
        )}
      </>
    );
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-violet-100 text-violet-700";
      case "driver":
        return "bg-emerald-100 text-emerald-700";
      case "customer":
        return "bg-sky-100 text-sky-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <header className="sticky top-0 z-[9999] border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="Speeliable home">
          <img
            src="speeliable_logo.png"
            className="h-10 w-auto object-contain sm:h-11"
            alt="Speeliable"
          />
        </Link>

        {isAuthenticated && (
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">{getNavLinks()}</ul>
          </nav>
        )}

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"
              >
                <User size={16} className="text-emerald-700" />
                <span className="max-w-24 truncate text-sm font-semibold text-slate-800">
                  {user?.name?.split(" ")[0]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-slate-500 transition ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-slate-100 px-3 pb-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="mt-2 flex items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={15} className="mr-2" />
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {showMobileMenu && (
        <div ref={mobileMenuRef} className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          {isAuthenticated ? (
            <>
              <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <ul className="space-y-1">{getNavLinks(true)}</ul>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="block rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
