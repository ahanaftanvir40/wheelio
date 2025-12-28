import axios from "axios";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.31.187:3000/api";

// Extract base server URL (without /api) for image paths
export const SERVER_URL = BACKEND_URL.replace("/api", "");

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

export default api;
