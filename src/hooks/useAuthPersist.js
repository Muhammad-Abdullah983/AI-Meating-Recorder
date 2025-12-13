import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, restoreAuthState } from "@/store/authSlice";
import { supabase } from "@/lib/supabaseClient";

export function useAuthPersist() {
    const dispatch = useDispatch();

    useEffect(() => {
        // Check if access token exists in localStorage and restore state
        const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (accessToken) {
            // Assume authenticated based on token presence (no API call)
            dispatch(restoreAuthState({
                user: null, // We don't have user data without API call
                session: null,
                token: accessToken,
                isAuthenticated: true, // Assume true, listener will correct if invalid
            }));
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                dispatch(setUser(session.user));
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
