import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: false,
    token: "",
    isLoading: false,
    user: null,
    user_id: null,
    email: "",
    error: false,
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = false;
        },
        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.user_id = action.payload.user_id;
            state.email = action.payload.email;
            state.isLoading = false;
        },
        loginFailure: (state) => {
            state.isLoading = false;
            state.error = true;
        },
        logout: (state) => {
            return initialState;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = slice.actions;
export default slice.reducer;
