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
    <div className="flex h-screen items-center justify-center bg-black">
      <form
        onSubmit={verifyCode}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 flex flex-col space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-black">
          Verify Your Email
        </h2>

        <p className="text-center text-gray-600 text-sm">
          Enter the 6-digit code sent to:
          <br />
          <span className="font-semibold text-black">{email || "your email"}</span>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          className="border border-gray-300 p-3 rounded text-black text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-black text-white p-3 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Didn't receive the code? <br />
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="underline font-medium cursor-pointer hover:text-black disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </p>
      </form>
    </div>
  );
}
