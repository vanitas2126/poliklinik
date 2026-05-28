import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Login from "./pages/Login";

// Dashboard Pages (Role-based)
import PendaftaranDashboard from "./pages/admin/PendaftaranDashboard";
import MasterDokter from "./pages/admin/MasterDokter";
import DokterUmumDashboard from "./pages/dokter-umum/DokterUmumDashboard";
import LabDashboard from "./pages/lab/LabDashboard";
import RadiologiDashboard from "./pages/radiologi/RadiologiDashboard";
import DokterSpesialisDashboard from "./pages/dokter-spesialis/DokterSpesialisDashboard";
import ApotekDashboard from "./pages/apotek/ApotekDashboard";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes wrapped in DashboardLayout with Role Guards placeholder */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="admin" element={<PendaftaranDashboard />} />
          <Route path="admin/dokter" element={<MasterDokter />} />
          <Route path="dokter-umum" element={<DokterUmumDashboard />} />
          <Route path="lab" element={<LabDashboard />} />
          <Route path="radiologi" element={<RadiologiDashboard />} />
          <Route path="dokter-spesialis" element={<DokterSpesialisDashboard />} />
          <Route path="apotek" element={<ApotekDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
