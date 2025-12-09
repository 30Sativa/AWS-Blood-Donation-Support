import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bloodconnect.cloud/api",
});

api.interceptors.request.use((config) => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const { token } = JSON.parse(userData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  return config;
});

export default api;
