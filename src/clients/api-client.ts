import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response?.data ?? response,
  (error) => Promise.reject(error),
);
