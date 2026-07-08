import { Routes, Route } from "react-router-dom";

/* Public */
import Home from "../auth/home";
import Login from "../auth/login";
import Signup from "../auth/signup";

/* Layouts */
import HospitalLayout from "../modules/hospital/component/Layout";
import DonorLayout from "../modules/donar/component/Layout";

/* Admin Pages */
import AdminDashboard from "../modules/admin/pages/AdminDashboard";
import ManageUsers from "../modules/admin/pages/ManageUsers"; 
import AnalyticsDashboard from "../modules/admin/pages/AnalyticsDashboard";
import BloodInventory from "../modules/admin/pages/BloodInventory"; // Ensure this path is correct!

/* Hospital Pages */
import HospitalDashboard from "../modules/hospital/pages/HospitalDashboard"; 
import RequestBlood from "../modules/hospital/pages/RequestBlood";
import RequestStatus from "../modules/hospital/pages/RequestStatus";
import DonorDatabase from "../modules/hospital/pages/DonorDatabase";

/* Donor Pages */
import DonorDashboard from "../modules/donar/pages/DonorDashboard"; 
import DonationHistory from "../modules/donar/pages/DonationHistory";
import ScheduleDonation from "../modules/donar/pages/ScheduleDonation";
// import Certificates from "../modules/donar/pages/Certificates";
import AdminSettings from "../modules/admin/pages/AdminSettings";
import DonorProfile from "../modules/donar/pages/profile";
import AddBlood from "../modules/hospital/pages/BloodAdd";
import HealthDetails from "../modules/donar/pages/HealthDetails";
import DirectRequests from "../modules/donar/pages/DirectRequests";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Hospital */}
      <Route path="/hospital" element={<HospitalLayout />}>
        <Route index element={<HospitalDashboard />} />
        <Route path="request" element={<RequestBlood />} />
        <Route path="status" element={<RequestStatus />} />
        <Route path="donors" element={<DonorDatabase />} />
        <Route path="AddBlood" element={<AddBlood />} />
      </Route>

      {/* Donor */}
      <Route path="/donor" element={<DonorLayout />}>
        <Route index element={<DonorDashboard />} />
        <Route path="history" element={<DonationHistory />} />
        <Route path="schedule" element={<ScheduleDonation />} />
        <Route path="certificates" element={<HealthDetails />} />
        <Route path="DirectRequests" element={<DirectRequests />} />
        <Route path="profile" element={<DonorProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="activity" element={<AnalyticsDashboard />} />
        {/* Make sure the file exists at ../modules/admin/pages/BloodInventory.jsx */}
        <Route path="inventory" element={<BloodInventory />} /> 
        <Route path="settings" element={<AdminSettings />} /> 
      </Route>
    </Routes>
  );
};

export default AppRouter;