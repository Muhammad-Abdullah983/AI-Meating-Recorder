"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validationSchemas";
import FormInput from "@/components/ui/FormInput";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        // Check if user has valid recovery session
        const checkSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    setError("Invalid or expired reset link. Please request a new password reset.");
                    setVerifying(false);
                    return;
                }

                // Session is valid
                setVerifying(false);
            } catch (err) {
                console.error("Session check error:", err);
                setError("Failed to verify reset link. Please try again.");
                setVerifying(false);
            }
        };

        checkSession();
    }, []);

    async function onSubmit(data) {
        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (updateError) throw updateError;

            toast.success("Password reset successful! Redirecting to login...");

            // Sign out the user after password reset
            await supabase.auth.signOut();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err) {
            console.error("Password reset error:", err);
            toast.error(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Show loading state while verifying session
    if (verifying) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    // Show error state if session is invalid
    if (error) {
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
                        </div>
                    </nav>
                </header>

                <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 65px)' }}>
                    <div className="w-full md:max-w-[30%] max-w-[92%] text-center">
                        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="space-y-3">
                            <Link
                                href="/auth/forgot-password"
                                className="block w-full px-6 py-3 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                Request New Reset Link
                            </Link>
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
                        <h2 className="text-3xl text-center font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-600 text-center text-sm mb-6">
                            Enter your new password below
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* New Password */}
                            <FormInput
                                label="New Password"
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

                            {/* Confirm Password */}
                            <FormInput
                                label="Confirm New Password"
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

                            {/* Password Requirements */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        At least 6 characters
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        One uppercase letter
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        One lowercase letter
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        One special character
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                        One number
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold p-3 rounded-lg transition transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                                disabled={loading || isSubmitting}
                            >
                                {loading || isSubmitting ? "Resetting Password..." : "Reset Password"}
                                {!loading && !isSubmitting && <ArrowRight className="w-5 h-5" />}
                            </button>



                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
