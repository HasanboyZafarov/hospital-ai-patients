import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatientAuthState {
  token: string | null;
  fullName: string | null;
  patientId: string | null;
  setAuth: (token: string, fullName: string, patientId: string) => void;
  logout: () => void;
}

export const usePatientAuth = create<PatientAuthState>()(
  persist(
    (set) => ({
      token: null,
      fullName: null,
      patientId: null,
      setAuth: (token, fullName, patientId) => set({ token, fullName, patientId }),
      logout: () => set({ token: null, fullName: null, patientId: null }),
    }),
    { name: "patient-auth" }
  )
);
