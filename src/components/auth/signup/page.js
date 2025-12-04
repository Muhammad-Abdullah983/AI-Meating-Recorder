"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("First and last name are required");
      }

      if (!username.trim()) {
        throw new Error("Username is required");
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

      // ✅ Step 1: Check if email already exists in profiles table
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
          data: {
            full_name: `${firstName} ${lastName}`,
            username: username.toLowerCase()
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // ✅ Step 3: Create user profile in database (optional - proceed with verification even if this fails)
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          full_name: `${firstName} ${lastName}`,
          username: username.toLowerCase(),
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profile creation warning (non-critical):", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            status: profileError.status
          });
          // Don't throw - profile creation is optional, verification is more important
        }
      } catch (profileErr) {
        console.warn("Profile creation exception (non-critical):", profileErr);
        // Continue anyway - profile can be created later
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
    <div className="fixed inset-0 bg-white flex pt-6 items-center justify-center px-4">

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className=" text-left">
          <div className="flex items-center justify-center gap-3 mb-8">
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

        <div className="">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Sign Up To Get Started</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-4">
              <div>
                <label className="block text-sm font-semibold  mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daniel"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmadi"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email & Username Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="e.g. daniel@example.com"
                  className="w-full border border-gray-300 p-3  rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
                <input
                  type="text"
                  placeholder="e.g. danielahmadi123"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-4">
              <div>
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
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>



            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="font-semibold text-teal-600 hover:text-teal-700 transition">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
