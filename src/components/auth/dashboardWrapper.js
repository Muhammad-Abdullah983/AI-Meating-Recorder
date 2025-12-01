"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function DashboardWrapper({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        // Check if user has access token in localStorage
        const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        // If user is NOT authenticated and has NO token, redirect to login
        if (!isAuthenticated && !accessToken) {
            router.push("/auth/login");
        } else {
            // User is authenticated, allow access to dashboard
            setIsLoading(false);
        }
    }, [isAuthenticated, router]);

    // Show loading while checking auth status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return children;
}
