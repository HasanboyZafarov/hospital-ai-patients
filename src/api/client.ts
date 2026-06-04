import axios from "axios";

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const patientAuth = localStorage.getItem("patient-auth");
  if (patientAuth) {
    const { state } = JSON.parse(patientAuth);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});
