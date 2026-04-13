import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { HospitalsPage } from "./pages/HospitalsPage.jsx";
import { DoctorsPage } from "./pages/DoctorsPage.jsx";
import { BookingPage } from "./pages/BookingPage.jsx";
import { BloodBankPage } from "./pages/BloodBankPage.jsx";
import { PharmacyPage } from "./pages/PharmacyPage.jsx";
import { TelemedicinePage } from "./pages/TelemedicinePage.jsx";
import { LabsPage } from "./pages/LabsPage.jsx";
import { PatientRecordsPage } from "./pages/PatientRecordsPage.jsx";
import { AuthProvider } from "./state/auth.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/blood-bank" element={<BloodBankPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/telemedicine" element={<TelemedicinePage />} />
          <Route path="/records" element={<PatientRecordsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
