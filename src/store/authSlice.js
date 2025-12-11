import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabaseClient";

// Async thunks for authentication
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            const accessToken = data.session?.access_token;
            if (accessToken && typeof window !== 'undefined') {
                try {
                    localStorage.setItem("accessToken", accessToken);
                } catch (_) { }
            }
            return {
                user: data.user,
                session: data.session,
            };

        } catch (err) {
            return rejectWithValue(err.message || "Login failed");
        }
    }
);

export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            const accessToken = data.session?.access_token;
            if (accessToken && typeof window !== 'undefined') {
                try {
                    localStorage.setItem("accessToken", accessToken);
                } catch (_) { }
            }

            return {
                user: data.user,
                session: data.session,
            };
        } catch (err) {
            return rejectWithValue(err.message || "Signup failed");
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear all localStorage items (client-side only)
            if (typeof window !== 'undefined') {
                try {
                    // Get all keys before clearing to identify user-specific data
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        // Remove access token and any user-specific data
                        if (key === 'accessToken' || key?.startsWith('userProfile_') || key?.startsWith('userStatus_') || key?.startsWith('profilePicture_')) {
                            keysToRemove.push(key);
                        }
                    }

                    // Remove identified keys
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                } catch (_) { }
            }
            return null;
        } catch (err) {
            return rejectWithValue(err.message || "Logout failed");
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) throw error;

            if (session?.user) {
                return {
                    user: session.user,
                    session: session,
                };
            }
            return null;
        } catch (err) {
            return rejectWithValue(err.message || "Auth check failed");
        }
    }
);

export const requestPasswordReset = createAsyncThunk(
    "auth/requestPasswordReset",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            return { email };
        } catch (err) {
            return rejectWithValue(err.message || "Failed to send reset email");
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ password }, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            return { success: true };
        } catch (err) {
            return rejectWithValue(err.message || "Failed to reset password");
        }
    }
);

const initialState = {
    user: null,
    session: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken(state, action) {
            state.token = action.payload;
        },
        restoreAuthState(state, action) {
            // Restore auth state from payload (used when app initializes)
            state.user = action.payload.user;
            state.session = action.payload.session;
            state.token = action.payload.token;
            state.isAuthenticated = action.payload.isAuthenticated;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.session = action.payload.session;
                state.isAuthenticated = true;
                state.token = action.payload.session?.access_token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });

        // Signup
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.session = action.payload.session;
                state.isAuthenticated = true;
                state.token = action.payload.session?.access_token;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.session = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Check Auth
        builder
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.user = action.payload.user;
                    state.session = action.payload.session;
                    state.token = action.payload.session?.access_token;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.session = null;
                    state.token = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.session = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setUser, setToken, restoreAuthState } = authSlice.actions;
export default authSlice.reducer;