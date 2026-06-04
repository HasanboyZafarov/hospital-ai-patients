import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PatientLayout } from "./layouts/PatientLayout";
import PatientLoginPage from "./pages/patient/PatientLoginPage";
import HomePage from "./pages/patient/HomePage";
import ChecklistPage from "./pages/patient/ChecklistPage";
import MedicationsPage from "./pages/patient/MedicationsPage";
import DietPage from "./pages/patient/DietPage";
import AIChatPage from "./pages/patient/AIChatPage";
import CheckInPage from "./pages/patient/CheckInPage";
import ProfilePage from "./pages/patient/ProfilePage";
import AnonymousReportPage from "./pages/patient/AnonymousReportPage";
import { usePatientAuth } from "./stores/patientAuth";

const qc = new QueryClient();

function PatientGuard({ children }: { children: React.ReactNode }) {
  const { token } = usePatientAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PatientLoginPage />} />
          <Route
            element={
              <PatientGuard>
                <PatientLayout />
              </PatientGuard>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="diet" element={<DietPage />} />
            <Route path="chat" element={<AIChatPage />} />
            <Route path="checkin" element={<CheckInPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="report" element={<AnonymousReportPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
