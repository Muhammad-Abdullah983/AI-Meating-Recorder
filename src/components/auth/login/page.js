"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/store/authSlice";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state) => state.auth);
  console.log("Current user:", user);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      if (result) {
        router.push("/");
      }
    } catch (err) {
      // Error is already handled in Redux state
      console.error("Login error:", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-white flex pt-8 items-center justify-center px-4">
      {/* Background Blobs */}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-white fill-current transform translate-x-px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M3 22v-20l18 10-18 10z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold text-teal-600">
                MeetingAI
              </span>
              <span className="text-xs font-medium text-gray-500">
                Intelligent Meeting Insights
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 ">
          <h2 className="text-3xl text-center font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-center text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="text-black">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input
                type="email"
                placeholder="e.g. daniel@example.com"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="text-black ">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/auth/signup" className="font-semibold text-teal-600 hover:text-teal-700 transition">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
