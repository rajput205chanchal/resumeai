import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import api from "../utils/api";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/user/login", form);
      login(data.token, data.user);
      toast.success("Signed in");
      const dest = loc.state?.from?.pathname || "/resumes/mine";
      nav(dest, { replace: true });
    } catch {
      /* toast is handled by interceptor */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <FiLogIn /> 
          Welcome Back
        </h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {loading && (
        <div className="mt-4">
          <Spinner />
        </div>
      )}
      <p className="mt-6 text-center text-sm text-gray-600">
        No account?{" "}
        <Link
          className="text-blue-600 hover:text-blue-700 font-medium underline"
          to="/register"
        >
          Create one here
        </Link>
      </p>
    </div>
  );
}
