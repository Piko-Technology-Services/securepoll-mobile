// /src/api/auth.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
   headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);