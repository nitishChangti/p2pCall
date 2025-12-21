  import { createSlice } from "@reduxjs/toolkit";

  const initialState = {
    user: null,           // user profile data
    token: null,          // JWT or session token
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      authStart(state) {
        state.loading = true;
        state.error = null;
      },

      authSuccess(state, action) {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      },

    authFailure(state, action) {
    state.user = null;                // 🔴 REQUIRED
    state.isAuthenticated = false;    // 🔴 REQUIRED
    state.loading = false;
    state.error = action?.payload || null;
  },
      logout(state) {
        return initialState;
      },
    },
  });

  export const {
    authStart,
    authSuccess,
    authFailure,
    logout,
  } = authSlice.actions;

  export default authSlice.reducer;
