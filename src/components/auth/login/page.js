"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/store/authSlice";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const { user,loading, error } = useSelector((state) => state.auth);
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
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white text-black p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-black text-white p-3 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="underline hover:text-black">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
