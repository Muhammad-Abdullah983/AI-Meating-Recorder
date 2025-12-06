"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validationSchemas";
import FormInput from "@/components/ui/FormInput";
import toast from "react-hot-toast";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data) {
    setLoading(true);

    try {

      // ✅ Step 1: Check if email already exists in profiles table
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", data.email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        // User already exists - show error, do NOT redirect
        toast.error("This email is already registered. Please login instead.");
        throw new Error("This email is already registered. Please login instead.");
      }

      // ✅ Step 2: Create user in Supabase Authentication
      // This will send OTP email automatically if email confirmation is enabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            username: data.username.toLowerCase()
          }
        },
      });

      if (authError) {
        // console.error("Signup error details:", authError);
        // Check if user already exists in auth system
        if (authError.message.includes('already registered') ||
          authError.message.includes('User already registered') ||
          authError.message.includes('already been registered')) {
          toast.error("This email is already registered. Please login instead.");
          throw new Error("This email is already registered. Please login instead.");
        }
        toast.error(authError.message || "Signup failed");
        throw new Error(authError.message || "Signup failed");
      }

      if (!authData.user) {
        toast.error("Failed to create user account");
        throw new Error("Failed to create user account");
      }

      // ⚠️ CRITICAL CHECK: Supabase returns existing user if they signed up but didn't confirm
      // Check if this is a new signup or existing user
      if (authData.user.identities && authData.user.identities.length === 0) {
        // User already exists but hasn't confirmed email (fake signup success)
        console.warn("User already exists (unconfirmed):", authData.user.email);
        toast.error("This email is already registered. Please login instead.");
        throw new Error("This email is already registered. Please login instead.");
      }

      console.log("Signup successful:", {
        userId: authData.user.id,
        email: authData.user.email,
        hasSession: !!authData.session,
        identitiesCount: authData.user.identities?.length
      });

      // ✅ Step 3: Create user profile in database with unverified status
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: data.email.toLowerCase(),
          full_name: `${data.firstName} ${data.lastName}`,
          username: data.username.toLowerCase(),
          email_verified: false,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profile creation warning:", profileError);
          // If profile already exists (duplicate), it means user exists
          if (profileError.code === '23505') {
            toast.error("This email is already registered. Please login instead.");
            throw new Error("This email is already registered. Please login instead.");
          }
        }
      } catch (profileErr) {
        console.error("Profile creation error:", profileErr);
        // Re-throw if it's our duplicate error
        if (profileErr.message?.includes("already registered")) {
          throw profileErr;
        }
      }

      // ✅ Step 4: Redirect to verification page (only if signup was successful)
      console.log("Redirecting to verify page for:", data.email);
      toast.success("Account created! Please check your email for verification code.");
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);

    } catch (err) {
      console.error("Signup Error:", err);
      // Only show toast if it's not already shown
      if (!err.message?.includes("already registered")) {
        toast.error(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex pt-6 items-start md:items-center justify-center px-4 overflow-y-auto">

      <div className="w-full max-w-2xl md:max-w-[50%] max-w-[97%]">
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
              {/* <img src="/images/ai-meeting.png" alt="MeetingAI Logo" className="w-10 h-10 mt-2" /> */}
            </div>
          </div>
        </div>

        <div className="">
          <h2 className="text-3xl font-bold text-center text-black mb-8">Sign Up To Get Started</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-2 text-black gap-3 md:gap-4">
              <FormInput
                label="First Name"
                type="text"
                placeholder="e.g. Daniel"
                required
                error={errors.firstName?.message}
                disabled={loading || isSubmitting}
                {...register("firstName")}
              />
              <FormInput
                label="Last Name"
                type="text"
                placeholder="e.g. Ahmadi"
                required
                error={errors.lastName?.message}
                disabled={loading || isSubmitting}
                {...register("lastName")}
              />
            </div>

            {/* Email & Username Row */}
            <div className="grid grid-cols-2 text-black gap-3 md:gap-4">
              <FormInput
                label="Email"
                type="email"
                placeholder="e.g. daniel@example.com"
                required
                error={errors.email?.message}
                disabled={loading || isSubmitting}
                {...register("email")}
              />
              <FormInput
                label="Username"
                type="text"
                placeholder="e.g. danielahmadi123"
                required
                error={errors.username?.message}
                disabled={loading || isSubmitting}
                {...register("username")}
              />
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-2 text-black gap-3 md:gap-4">
              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                error={errors.password?.message}
                disabled={loading || isSubmitting}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                {...register("password")}
              />
              <FormInput
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                error={errors.confirmPassword?.message}
                disabled={loading || isSubmitting}
                showPasswordToggle={true}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                {...register("confirmPassword")}
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Creating Account..." : "Sign Up"}
              {!loading && !isSubmitting && <ArrowRight className="w-5 h-5" />}
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
