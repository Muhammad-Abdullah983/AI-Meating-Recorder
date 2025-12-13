import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, restoreAuthState, checkAuth } from "@/store/authSlice";
import { supabase } from "@/lib/supabaseClient";

export function useAuthPersist() {
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeAuth = async () => {
            // Check if access token exists in localStorage
            const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

            if (accessToken) {
                // Validate the session with Supabase
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

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                dispatch(setUser({ user: session.user, session }));
                if (typeof window !== "undefined") {
                    localStorage.setItem("accessToken", session.access_token);
                }
            } else if (event === 'SIGNED_OUT') {
                dispatch(restoreAuthState({
                    user: null,
                    session: null,
                    token: null,
                    isAuthenticated: false,
                }));
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                }
            }
        });

        // Cleanup listener on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [dispatch]);
}
