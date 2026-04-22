import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
//* Function for this task
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));
//* Function for this task
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    const hasStoredToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const url: string = error.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/verify") || url.includes("/auth/reset");
    if (hasStoredToken && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/login";
      }
    }
  }
  return Promise.reject(error);
});