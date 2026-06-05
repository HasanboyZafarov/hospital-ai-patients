import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getPatientToken } from "./client";

export type CareItemType = "MEDICATION" | "EXERCISE" | "ACTIVITY" | "DIET" | "RESTRICTION" | "CHECKUP";

export interface ScheduleItem {
  itemId: string;
  type: CareItemType;
  title: string;
  description: string;
  scheduleTime?: string;
  dosage?: string;
  frequency?: string;
  completed: boolean;
}

export interface Dashboard {
  patient: { id: string; fullName: string; status: string; recoveryScore: number };
  recovery: { postOpDay: number; totalDays: number; progressPct: number };
  todaySchedule: ScheduleItem[];
  weeklyVitality: { latestPain: number | null; painTrend: { date: string; pain: number }[] };
}

export interface Checklist {
  date: string;
  completed: number;
  total: number;
  items: ScheduleItem[];
}

export interface Medications {
  date: string;
  completed: number;
  total: number;
  medications: ScheduleItem[];
}

export interface Diet {
  prescribed: { title: string; description: string }[];
  tips: { icon: string; title: string; text: string }[];
}

export interface PatientProfile {
  id: string;
  publicId: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  status: string;
  accessCode: string;
  surgery: { type: string; date: string; postOpDay: number; totalDays: number; progressPct: number };
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface CheckInBody {
  painLevel: number;
  temperature?: number;
  symptoms?: string[];
  mood?: string;
  bpm?: number;
  spo2?: number;
  notes?: string;
}

export interface CheckInResult {
  checkIn: { id: string; date: string; painLevel: number };
  risk: {
    riskLevel: RiskLevel;
    advice: string;
    confidence: number;
    recoveryScore: number;
    alertCreated: boolean;
    modelUsed: string;
    fallbackUsed: boolean;
  };
}

export interface LoginUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  hospitalId: string;
}

export interface LoginPatient {
  id: string;
  publicId: string;
  status: string;
  accessCode: string;
  [k: string]: unknown;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUser;
  patient: LoginPatient;
}

export interface ChatHistoryEntry {
  input: string;
  output: string;
  createdAt: string;
}

export const useDashboard = () =>
  useQuery<Dashboard>({
    queryKey: ["me", "dashboard"],
    queryFn: () => apiClient.get("/me/dashboard").then((r) => r.data),
  });

export const useChecklist = (date?: string) =>
  useQuery<Checklist>({
    queryKey: ["me", "checklist", date ?? "today"],
    queryFn: () =>
      apiClient.get("/me/checklist", { params: date ? { date } : undefined }).then((r) => r.data),
  });

export const useCompleteChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { itemId: string; scheduleTime: string; completed: boolean }) =>
      apiClient
        .patch(`/me/checklist/items/${v.itemId}/complete`, {
          scheduleTime: v.scheduleTime,
          completed: v.completed,
        })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "checklist"] });
      qc.invalidateQueries({ queryKey: ["me", "dashboard"] });
    },
  });
};

export const useMedications = (date?: string) =>
  useQuery<Medications>({
    queryKey: ["me", "medications", date ?? "today"],
    queryFn: () =>
      apiClient.get("/me/medications", { params: date ? { date } : undefined }).then((r) => r.data),
  });

export const useMarkMedicationTaken = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { itemId: string; scheduleTime: string; completed: boolean }) =>
      apiClient
        .patch(`/me/medications/${v.itemId}/taken`, {
          scheduleTime: v.scheduleTime,
          completed: v.completed,
        })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "medications"] });
      qc.invalidateQueries({ queryKey: ["me", "checklist"] });
      qc.invalidateQueries({ queryKey: ["me", "dashboard"] });
    },
  });
};

export const useDiet = () =>
  useQuery<Diet>({
    queryKey: ["me", "diet"],
    queryFn: () => apiClient.get("/me/diet").then((r) => r.data),
  });

export const usePatientProfile = () =>
  useQuery<PatientProfile>({
    queryKey: ["me", "profile"],
    queryFn: () => apiClient.get("/me/profile").then((r) => r.data),
  });

export const useCheckInMutation = () => {
  const qc = useQueryClient();
  return useMutation<CheckInResult, Error, CheckInBody>({
    mutationFn: (body) => apiClient.post("/me/check-in", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
};

export const useChatHistory = () =>
  useQuery<ChatHistoryEntry[]>({
    queryKey: ["me", "chat", "history"],
    queryFn: () => apiClient.get("/me/chat/history").then((r) => r.data),
  });

export type ComplaintCategory = "DOCTOR" | "NURSE" | "SERVICE" | "FACILITY" | "MEDICATION" | "OTHER";
export type ComplaintUrgency = "LOW" | "MEDIUM" | "HIGH";

export interface ComplaintBody {
  category: ComplaintCategory;
  description: string;
  urgency: ComplaintUrgency;
}

export const useSubmitComplaint = () =>
  useMutation<unknown, Error, ComplaintBody>({
    mutationFn: (body) => apiClient.post("/me/complaints", body).then((r) => r.data),
  });

export const usePatientLogin = () =>
  useMutation<LoginResponse, Error, string>({
    mutationFn: (accessCode) =>
      apiClient.post("/auth/patient-login", { accessCode }).then((r) => r.data),
  });

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  onDelta: (t: string) => void,
  signal?: AbortSignal
): Promise<{ modelUsed?: string }> {
  const baseURL = apiClient.defaults.baseURL ?? "";
  const res = await fetch(`${baseURL}/me/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPatientToken()}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Chat failed: ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.replace(/^data: /, "").trim();
      if (!line) continue;
      try {
        const j = JSON.parse(line);
        if (j.delta) onDelta(j.delta);
        if (j.done) return { modelUsed: j.modelUsed };
      } catch {
        /* skip malformed frame */
      }
    }
  }
  return {};
}
