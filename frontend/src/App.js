import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import UserDashboard from "./pages/UserDashboard";
import UserHome from "./pages/UserHome";
import VerifyOtp from "./pages/VerifyOtp";

// User pages
import VehicleRegistration from "./pages/VehicleRegistration";
import Logs from "./pages/Logs";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

// ✅ Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageVehicles from "./pages/admin/ManageVehicles";
import LogsReports from "./pages/admin/LogsReports";
import Alerts from "./pages/admin/Alerts";
import LiveMonitoring from "./pages/admin/LiveMonitoring";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLayout from "./pages/admin/AdminLayout";
import Profile from "./pages/Profile"; 


function App() {
  // const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/*  Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        {/*  User Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-home" element={<UserHome />} />

        {/*  User Sidebar Pages */}
        <Route path="/vehicle-registration" element={<VehicleRegistration />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/profile" element={<Profile />} />

        {/*  Forgot / Verify OTP */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/*  Admin Layout + Nested Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<LiveMonitoring />} /> {/* Default page */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-vehicles" element={<ManageVehicles />} />
          <Route path="logs-reports" element={<LogsReports />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
