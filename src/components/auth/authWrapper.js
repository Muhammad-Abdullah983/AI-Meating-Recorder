"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa6";


export default function AuthWrapper({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        // Check if user has access token in localStorage
        const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        // If user is authenticated or has token, redirect to dashboard
        if (isAuthenticated || accessToken) {
            router.push("/dashboard");
        }
        else if (!isAuthenticated && !accessToken) {
            router.push("/auth/login");
        }
        else {
            // User is not authenticated, allow access to auth pages
            setIsLoading(false);
        }
    }, [isAuthenticated, router]);

    // Show loading while checking auth status
    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto px-5 py-5 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">
                    <FaSpinner className='w-8 h-8 animate-spin text-teal-600' />

                </div>
            </div>
        );
    }

    return children;
}
