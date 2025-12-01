"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!fullName.trim()) {
        throw new Error("Full name is required");
      }

      if (!email.trim()) {
        throw new Error("Email is required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // ✅ Step 1: Check if email already exists in profiles table (database check)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existingProfile) {
        throw new Error("This email is already registered. Please login instead.");
      }

      // ✅ Step 2: Create user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // ✅ Step 3: Create user profile in database
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: fullName,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        // If profile creation fails, we should ideally delete the auth user
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create user profile. Please try again.");
      }

      // ✅ Step 4: Redirect to OTP verification
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);

    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSignup}
        className="bg-white text-black p-8 rounded-2xl shadow-lg w-96 flex flex-col space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">Create Account</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-black text-white p-3 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="underline hover:text-black font-semibold">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
