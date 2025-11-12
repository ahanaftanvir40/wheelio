import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://192.168.31.187:3000/api",
  timeout: 10000,
});

export default api;
