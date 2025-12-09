"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@/lib/validationSchemas";
import FormInput from "@/components/ui/FormInput";
import { Clock } from "lucide-react";
import { IoMdArrowRoundBack } from "react-icons/io";
import toast from "react-hot-toast";

export default function VerifyForm() {
  const search = useSearchParams();
  const email = search.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds = 1 minute
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle back to signup
  const handleBackToSignup = () => {
    router.push("/auth/signup");
  };

  // Handle OTP verification
  async function onSubmit(data) {
    setError("");

    // Check if timer expired
    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new code.");
      toast.error("OTP has expired. Please request a new code.");
      return;
    }

    setLoading(true);

    try {
      // Validate email and OTP
      if (!email) {
        throw new Error("Email not found. Please sign up again.");
      }

      // Verify OTP with Supabase (OTP expires in 60 seconds by default)
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: data.otp,
        type: "email",
      });

      if (verifyError) {
        // Check if OTP expired
        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          throw new Error("OTP has expired or is invalid. Please request a new code.");
        }
        throw verifyError;
      }

      if (!verifyData.user) {
        throw new Error("Verification failed. Please try again.");
      }

      // Update profile in database to mark as verified
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verifyData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Sign out the user after verification (they must login)
      await supabase.auth.signOut();

      // Show success message and redirect to login
      toast.success("Email verified successfully! Please login to continue.");
      setTimeout(() => router.push("/auth/login"), 1500);

    } catch (err) {
      console.error("Verification Error:", err);
      setError(err.message || "OTP verification failed. Please try again.");
      toast.error(err.message || "OTP verification failed. Please try again.");
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

      // Resend OTP by triggering signup again with the same email
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new user, just resend OTP
        }
      });

      if (resendError) {
        throw resendError;
      }

      setError("");
      setTimeLeft(60); // Reset timer to 1 minute
      toast.success("OTP resent successfully! Check your email.");

    } catch (err) {
      console.error("Resend Error:", err);
      setError(err.message || "Failed to resend OTP");
      toast.error(err.message || "Failed to resend OTP");
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
          <h2 className="text-3xl text-center font-bold text-gray-900 mb-2">Verify Email</h2>
          <p className="text-gray-600 text-center text-sm mb-6">Enter the 6-digit code we sent to your email</p>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* OTP Input */}
            <FormInput
              label="Verification Code"
              type="text"
              placeholder="000000"
              maxLength={6}
              required
              error={errors.otp?.message}
              disabled={loading || isSubmitting}
              className="text-center tracking-widest text-3xl font-bold"
              {...register("otp", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }
              })}
            />

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={loading || isSubmitting || timeLeft <= 0}
            >
              {loading || isSubmitting ? "Verifying..." : timeLeft <= 0 ? "Code Expired" : "Verify"}
            </button>

            {/* Timer Display - Below Verify Button */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500' : 'text-teal-600'}`} />
              <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                {timeLeft > 0 ? (
                  <>Code expires in <span className="font-bold">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-600 font-semibold">Code expired! Request a new one</span>
                )}
              </span>
            </div>

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
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}

                className="font-semibold text-teal-600 cursor-pointer hover:text-teal-700 transition disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            </p>

            {/* Back to Signup Button - Always visible */}
            <p className="text-center cursor-pointer text-gray-600 text-sm mt-4 flex items-center justify-center gap-2">
              <IoMdArrowRoundBack className="w-5 h-5 text-teal-600" />

              <button
                type="button"
                onClick={handleBackToSignup}
                className="font-semibold text-teal-600 hover:text-teal-700 transition cursor-pointer"
              >
                Back to Signup
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
