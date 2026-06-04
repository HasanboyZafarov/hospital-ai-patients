import type { Patient, SurgeryType, Alert, CarePlan, CheckIn, User } from "../types";

export const mockDoctor: User = {
  id: "doc-1",
  fullName: "Dr. Amir Karimov",
  email: "amir@hospital.ai",
  phone: "+998901234567",
  role: "DOCTOR",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockSurgeryTypes: SurgeryType[] = [
  { id: "st-1", name: "Knee Replacement", nameRu: "Замена колена", nameUz: "Tizza almashtirish", category: "Orthopedic", avgRecoveryDays: 90 },
  { id: "st-2", name: "Appendectomy", nameRu: "Аппендэктомия", nameUz: "Appendektomiya", category: "General", avgRecoveryDays: 21 },
  { id: "st-3", name: "Rhinoplasty", nameRu: "Ринопластика", nameUz: "Rinoplastika", category: "Cosmetic", avgRecoveryDays: 30 },
  { id: "st-4", name: "Hip Replacement", nameRu: "Замена бедра", nameUz: "Son suyagi almashtirish", category: "Orthopedic", avgRecoveryDays: 60 },
];

export const mockPatients: Patient[] = [
  {
    id: "p-1",
    userId: "u-1",
    doctorId: "doc-1",
    surgeryTypeId: "st-1",
    surgeryDate: "2024-05-20",
    status: "RECOVERING",
    accessCode: "HOSP-1234",
    user: { id: "u-1", fullName: "Nodira Yusupova", email: "nodira@mail.ru", phone: "+998901111111", role: "PATIENT", createdAt: "2024-05-18T00:00:00Z" },
    surgeryType: mockSurgeryTypes[0],
    lastCheckIn: { id: "ci-1", patientId: "p-1", date: "2024-06-03", painLevel: 3, temperature: 36.7, symptoms: [], mood: "good", notes: "", riskLevel: "LOW" },
  },
  {
    id: "p-2",
    userId: "u-2",
    doctorId: "doc-1",
    surgeryTypeId: "st-2",
    surgeryDate: "2024-05-28",
    status: "AT_RISK",
    accessCode: "HOSP-5678",
    user: { id: "u-2", fullName: "Bobur Toshmatov", email: "bobur@mail.ru", phone: "+998902222222", role: "PATIENT", createdAt: "2024-05-26T00:00:00Z" },
    surgeryType: mockSurgeryTypes[1],
    lastCheckIn: { id: "ci-2", patientId: "p-2", date: "2024-06-02", painLevel: 7, temperature: 38.5, symptoms: ["fever", "pain"], mood: "bad", notes: "Feeling worse", riskLevel: "HIGH" },
  },
  {
    id: "p-3",
    userId: "u-3",
    doctorId: "doc-1",
    surgeryTypeId: "st-3",
    surgeryDate: "2024-05-15",
    status: "RECOVERING",
    accessCode: "HOSP-9012",
    user: { id: "u-3", fullName: "Zulfiya Rakhimova", email: "zulfiya@mail.ru", phone: "+998903333333", role: "PATIENT", createdAt: "2024-05-13T00:00:00Z" },
    surgeryType: mockSurgeryTypes[2],
    lastCheckIn: { id: "ci-3", patientId: "p-3", date: "2024-06-03", painLevel: 2, temperature: 36.6, symptoms: [], mood: "good", notes: "", riskLevel: "LOW" },
  },
  {
    id: "p-4",
    userId: "u-4",
    doctorId: "doc-1",
    surgeryTypeId: "st-4",
    surgeryDate: "2024-04-10",
    status: "RECOVERED",
    accessCode: "HOSP-3456",
    user: { id: "u-4", fullName: "Sardor Nazarov", email: "sardor@mail.ru", phone: "+998904444444", role: "PATIENT", createdAt: "2024-04-08T00:00:00Z" },
    surgeryType: mockSurgeryTypes[3],
    lastCheckIn: { id: "ci-4", patientId: "p-4", date: "2024-06-01", painLevel: 1, temperature: 36.6, symptoms: [], mood: "great", notes: "", riskLevel: "LOW" },
  },
];

export const mockAlerts: Alert[] = [
  { id: "a-1", patientId: "p-2", type: "HIGH_TEMPERATURE", severity: "CRITICAL", message: "Bobur Toshmatov reported temperature 38.5°C — possible infection risk", isRead: false, createdAt: "2024-06-02T14:30:00Z", patient: mockPatients[1] },
  { id: "a-2", patientId: "p-2", type: "HIGH_PAIN", severity: "WARNING", message: "Bobur Toshmatov pain level 7/10 for 2 consecutive days", isRead: false, createdAt: "2024-06-01T09:00:00Z", patient: mockPatients[1] },
  { id: "a-3", patientId: "p-1", type: "MISSED_MEDICATION", severity: "INFO", message: "Nodira Yusupova missed evening medication yesterday", isRead: true, createdAt: "2024-06-02T20:00:00Z", patient: mockPatients[0] },
];

export const mockCarePlan: CarePlan = {
  id: "cp-1",
  patientId: "p-1",
  generatedByAi: true,
  items: [
    { id: "item-1", carePlanId: "cp-1", type: "MEDICATION", title: "Ibuprofen 400mg", description: "Take with food to reduce inflammation", scheduleTime: "08:00", dayOffset: 0, isCompleted: true },
    { id: "item-2", carePlanId: "cp-1", type: "MEDICATION", title: "Ibuprofen 400mg", description: "Evening dose", scheduleTime: "20:00", dayOffset: 0, isCompleted: false },
    { id: "item-3", carePlanId: "cp-1", type: "ACTIVITY", title: "Ankle pumps", description: "10 repetitions every hour while awake to prevent blood clots", dayOffset: 0, isCompleted: false },
    { id: "item-4", carePlanId: "cp-1", type: "DIET", title: "High protein diet", description: "Aim for 1.2g protein per kg body weight to support tissue healing", dayOffset: 0, isCompleted: false },
    { id: "item-5", carePlanId: "cp-1", type: "RESTRICTION", title: "No weight bearing", description: "Use crutches for all movement — no direct weight on operated knee", dayOffset: 0, isCompleted: false },
    { id: "item-6", carePlanId: "cp-1", type: "CHECKUP", title: "Wound inspection", description: "Check incision for redness, swelling, or discharge", scheduleTime: "09:00", dayOffset: 1, isCompleted: false },
  ],
};

export const mockCheckIns: CheckIn[] = [
  { id: "ci-1", patientId: "p-1", date: "2024-06-03", painLevel: 3, temperature: 36.7, symptoms: [], mood: "good", notes: "Feeling better today", riskLevel: "LOW" },
  { id: "ci-1b", patientId: "p-1", date: "2024-06-02", painLevel: 4, temperature: 36.8, symptoms: ["mild swelling"], mood: "okay", notes: "", riskLevel: "LOW" },
  { id: "ci-1c", patientId: "p-1", date: "2024-06-01", painLevel: 5, temperature: 37.0, symptoms: ["swelling", "stiffness"], mood: "tired", notes: "Hard to sleep", riskLevel: "MEDIUM" },
];
