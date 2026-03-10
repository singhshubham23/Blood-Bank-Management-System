import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
}, (err) => Promise.reject(err));

// Response interceptor: can handle global errors
api.interceptors.response.use((res) => res, (err) => {
  // optionally handle 401 -> logout
  if (err?.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optionally redirect
  }
  return Promise.reject(err);
});

export default api;
