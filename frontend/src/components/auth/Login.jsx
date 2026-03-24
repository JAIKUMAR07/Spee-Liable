import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPostAuthRoute } from "../../utils/authRedirect";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const destination = getPostAuthRoute({
          role: result.user?.role,
          fromPath: from,
        });
        navigate(destination, { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Sign in to Speeliable
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            create a new account
          </Link>
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} className="font-bold">
                x
              </button>
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => fillDemoAccount("admin@gmail.com", "admin123")}
              className="rounded-lg border border-violet-200 bg-violet-50 p-2 text-left text-xs"
            >
              <p className="font-bold text-violet-800">Admin</p>
              <p className="text-violet-700">admin@gmail.com</p>
            </button>
            <button
              onClick={() => fillDemoAccount("driver@gmail.com", "driver123")}
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-left text-xs"
            >
              <p className="font-bold text-emerald-800">Driver</p>
              <p className="text-emerald-700">driver@gmail.com</p>
            </button>
            <button
              onClick={() => fillDemoAccount("customer@gmail.com", "customer123")}
              className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-left text-xs sm:col-span-2"
            >
              <p className="font-bold text-sky-800">Customer</p>
              <p className="text-sky-700">customer@gmail.com</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
