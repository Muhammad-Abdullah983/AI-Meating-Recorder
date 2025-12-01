import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreAuthState, checkAuth } from "@/store/authSlice";

export function useAuthPersist() {
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeAuth = async () => {
            // Check if access token exists in localStorage
            const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

            if (accessToken) {
                // Try to restore session from Supabase
                try {
                    await dispatch(checkAuth()).unwrap();
                } catch (err) {
                    // If checkAuth fails, clear localStorage
                    localStorage.removeItem("accessToken");
                    console.error("Failed to restore auth session:", err);
                }
            }
        };

        initializeAuth();
    }, [dispatch]);
}
