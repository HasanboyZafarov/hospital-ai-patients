import axios from "axios";

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://api.hospital-ai.uz/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const patientAuth = localStorage.getItem("patient-auth");
  if (patientAuth) {
    try {
      const { state } = JSON.parse(patientAuth);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("patient-auth");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export function getPatientToken(): string {
  const raw = localStorage.getItem("patient-auth");
  if (!raw) return "";
  try {
    return JSON.parse(raw)?.state?.token ?? "";
  } catch {
    return "";
  }
}
