import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Patient } from "../types";

interface PatientAuthState {
  token: string | null;
  user: User | null;
  patient: Patient | null;
  setAuth: (token: string, user: User, patient: Patient) => void;
  logout: () => void;
}

export const usePatientAuth = create<PatientAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      patient: null,
      setAuth: (token, user, patient) => set({ token, user, patient }),
      logout: () => set({ token: null, user: null, patient: null }),
    }),
    { name: "patient-auth" }
  )
);
