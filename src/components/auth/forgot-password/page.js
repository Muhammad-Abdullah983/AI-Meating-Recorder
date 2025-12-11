"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validationSchemas";
import FormInput from "@/components/ui/FormInput";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordForm() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const email = watch("email");

    async function onSubmit(data) {
        setLoading(true);
        try {
            // Step 1: Check if user exists in profiles table
            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("id, email")
                .eq("email", data.email.toLowerCase().trim())
                .maybeSingle();

            console.log("User lookup:", {
                searchEmail: data.email.toLowerCase().trim(),
                userData,
                userError
            });

            // Step 2: If user not found, show error
            if (!userData) {
                toast.error("This email is not registered. Please sign up first.");
                setLoading(false);
                return;
            }

            if (userError) {
                // Other errors (like RLS policy errors)
                console.error("Profile lookup error:", userError);
                toast.error("Unable to verify email. Please try again.");
                setLoading(false);
                return;
            }

            // Step 3: User exists, send password reset link
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                data.email.toLowerCase(),
                {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                }
            );

            if (resetError) {
                if (resetError.message.includes("rate limit")) {
                    toast.error("Too many requests. Please try again in a few minutes.");
                } else {
                    throw resetError;
                }
                setLoading(false);
                return;
            }

            // Step 4: Show success
            setEmailSent(true);
            toast.success("Password reset link sent! Check your email.");
        } catch (err) {
            console.error("Password reset error:", err);
            toast.error(err.message || "Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (emailSent) {
        return (
            <div className="fixed inset-0 bg-white">
                {/* Navbar */}
                <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                    <nav className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
                            <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg shadow-md">
                                <svg
                                    className="w-5 h-5 text-white fill-current transform translate-x-px"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M3 22v-20l18 10-18 10z" />
                                </svg>
                            </div>
                            <div className="flex flex-col text-left leading-none">
                                <span className="text-xl sm:text-2xl font-extrabold text-teal-600">
                                    MeetingAI
                                </span>
                                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">
                                    Intelligent Meeting Insights
                                </span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-teal-600 transition"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="px-4 py-2 text-sm sm:text-base font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Success Message */}
                <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 65px)' }}>
                    <div className="w-full md:max-w-[30%] max-w-[92%] text-center">
                        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-2">
                            We've sent a password reset link to:
                        </p>
                        <p className="text-teal-600 font-semibold mb-6">{email}</p>
                        <p className="text-sm text-gray-500 mb-8">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setEmailSent(false)}
                                className="w-full px-6 py-3 text-sm cursor-pointer font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
                            >
                                Didn't receive the email? Try again
                            </button>
                            <Link
                                href="/auth/login"
                                className="block w-full px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white">
            {/* Navbar */}
            <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <nav className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
                        <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg shadow-md">
                            <svg
                                className="w-5 h-5 text-white fill-current transform translate-x-px"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M3 22v-20l18 10-18 10z" />
                            </svg>
                        </div>
                        <div className="flex flex-col text-left leading-none">
                            <span className="text-xl sm:text-2xl font-extrabold text-teal-600">
                                MeetingAI
                            </span>
                            <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">
                                Intelligent Meeting Insights
                            </span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="/auth/login"
                            className="px-4 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-teal-600 transition"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="px-4 py-2 text-sm sm:text-base font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Content */}
            <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 65px)' }}>
                <div className="w-full md:max-w-[30%] max-w-[92%]">
                    <div className="pt-2">
                        <h2 className="text-3xl text-center font-bold text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-gray-600 text-center text-sm mb-6">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <FormInput
                                label="Email Address"
                                type="email"
                                placeholder="e.g. daniel@example.com"
                                required
                                error={errors.email?.message}
                                disabled={loading || isSubmitting}
                                {...register("email")}
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-teal-600 cursor-pointer to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                                disabled={loading || isSubmitting}
                            >
                                {loading || isSubmitting ? "Sending..." : "Send Reset Link"}
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

                            {/* Back to Login */}
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center gap-2 text-center text-gray-600 text-sm hover:text-teal-600 transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
