"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyForm() {
  const search = useSearchParams();
  const email = search.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  // Handle OTP verification
  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email and OTP
      if (!email) {
        throw new Error("Email not found. Please sign up again.");
      }

      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit code");
      }

      // Verify OTP with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      if (!data.user) {
        throw new Error("Verification failed. Please try again.");
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Redirect to dashboard
      router.push("/dashboard");

    } catch (err) {
      console.error("Verification Error:", err);
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle resend OTP
  async function handleResendCode() {
    setError("");
    setResendLoading(true);

    try {
      if (!email) {
        throw new Error("Email not found");
      }

      const { error: resendError } = await supabase.auth.resendOtp({
        email,
        type: "email",
      });

      if (resendError) {
        throw resendError;
      }

      setError("");
      alert("OTP resent successfully! Check your email.");

    } catch (err) {
      console.error("Resend Error:", err);
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-white  flex items-center justify-center px-4">

      <div className="w-full  max-w-md">
        {/* Header */}
        <div className="mb-4 pt-10 text-center">
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
            <div className="flex flex-col text-left leading-none">
              <span className="text-2xl font-extrabold text-teal-600">
                MeetingAI
              </span>
              <span className="text-xs font-medium text-gray-500">
                Intelligent Meeting Insights
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 text-black">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
          <p className="text-gray-600 text-sm mb-6">Enter the 6-digit code we sent to your email</p>

        

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={verifyCode} className="space-y-5">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                className="w-full border border-gray-300 p-4 rounded-lg text-center tracking-widest text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 hover:bg-white disabled:bg-gray-100"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                disabled={loading}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
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

            {/* Resend Code */}
            <p className="text-center text-gray-600 text-sm">
              Didn't receive the code? <br />
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="font-semibold text-teal-600 hover:text-teal-700 transition disabled:opacity-50 mt-2"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
