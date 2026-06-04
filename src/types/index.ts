export type Role = "DOCTOR" | "PATIENT" | "ADMIN";
export type PatientStatus = "RECOVERING" | "RECOVERED" | "AT_RISK";
export type CareItemType = "MEDICATION" | "DIET" | "ACTIVITY" | "CHECKUP" | "RESTRICTION";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface SurgeryType {
  id: string;
  name: string;
  nameRu: string;
  nameUz: string;
  category: string;
  avgRecoveryDays: number;
}

export interface Patient {
  id: string;
  userId: string;
  doctorId: string;
  surgeryTypeId: string;
  surgeryDate: string;
  status: PatientStatus;
  accessCode: string;
  user: User;
  surgeryType: SurgeryType;
  lastCheckIn?: CheckIn;
}

export interface CarePlan {
  id: string;
  patientId: string;
  generatedByAi: boolean;
  items: CarePlanItem[];
}

export interface CarePlanItem {
  id: string;
  carePlanId: string;
  type: CareItemType;
  title: string;
  description: string;
  scheduleTime?: string;
  dayOffset: number;
  isCompleted: boolean;
}

export interface CheckIn {
  id: string;
  patientId: string;
  date: string;
  painLevel: number;
  temperature: number;
  symptoms: string[];
  mood: string;
  notes: string;
  riskLevel: RiskLevel;
}

export interface Alert {
  id: string;
  patientId: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  isRead: boolean;
  createdAt: string;
  patient?: Patient;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
