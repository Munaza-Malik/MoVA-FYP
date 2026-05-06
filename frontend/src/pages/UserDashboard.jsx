import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import {
  FaUserCircle,
  FaHome,
  FaFileAlt,
  FaInfoCircle,
  FaEnvelope,
  FaCar,
  FaCog,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    registeredVehicles: 0,
    logsToday: 0,
    pendingApprovals: 0,
    reportsGenerated: 0,
  });

  // 1. Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [navigate]);

  // 2. Fetch Dashboard Stats (Filtering Logs by User's Vehicles)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Step A: Get only this user's vehicles
        const vehiclesRes = await axios.get(
          "http://localhost:5000/api/vehicles/my-vehicles",
          config
        );
        const myVehicles = vehiclesRes.data?.vehicles || [];
        const registeredVehicles = vehiclesRes.data?.count || 0;
        const pendingApprovals = myVehicles.filter(v => v.status === "Pending").length;

        // Step B: Create a clean list of the user's plate numbers
        const userPlateNumbers = myVehicles.map(v => v.plateNumber?.toUpperCase().trim());

        // Step C: Get all system logs and filter locally
        const logsRes = await axios.get("http://localhost:5000/api/logs", config);
        const allLogs = Array.isArray(logsRes.data) ? logsRes.data : [];
        
        // FILTER: Keep logs where the plate matches the user's vehicles
        const userSpecificLogs = allLogs.filter(log => {
          const logPlate = (log.vehicle || log.plateNumber)?.toUpperCase().trim();
          return userPlateNumbers.includes(logPlate);
        });

        // Step D: Calculate logs that occurred specifically today
        const todayStr = new Date().toDateString();
        const logsTodayCount = userSpecificLogs.filter(log => {
            const logDate = new Date(log.time || log.createdAt).toDateString();
            return logDate === todayStr;
        }).length;

        setStats({
          registeredVehicles,
          logsToday: logsTodayCount,
          pendingApprovals,
          reportsGenerated: userSpecificLogs.length, 
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { icon: <FaHome className="text-[#1A2B49]" />, label: "Home", link: "/user-home" },
    { icon: <FaCar className="text-[#1A2B49]" />, label: "Vehicle Registration", link: "/vehicle-registration" },
    { icon: <FaFileAlt className="text-[#1A2B49]" />, label: "Logs / Reports", link: "/logs" },
    { icon: <FaInfoCircle className="text-[#1A2B49]" />, label: "About Us", link: "/about" },
    { icon: <FaEnvelope className="text-[#1A2B49]" />, label: "Contact Us", link: "/contact" },
    { icon: <FaCog className="text-[#1A2B49]" />, label: "Profile", link: "/profile" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-gray-50 to-[#F9FAFB] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#A6C76C] text-white flex flex-col shadow-2xl">
        <div className="p-6 text-center border-b border-white/30">
          <img src={logo} alt="MoVA Logo" className="w-16 h-16 mx-auto mb-1 drop-shadow-lg" />
        </div>

        <nav className="flex-1 p-5 space-y-3">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.link)}
              className="flex items-center w-full space-x-3 px-4 py-3 rounded-xl hover:bg-[#FFA500]/20 hover:scale-[1.03] transition-all duration-300 text-left"
            >
              {item.icon}
              <span className="font-medium text-[#1A2B49]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white text-[#1A2B49] hover:bg-[#FFA500] hover:text-white font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-end bg-[#A6C76C]/20 backdrop-blur-md px-6 py-4 shadow-md border-b border-[#A6C76C]/30">
          <div className="flex items-center space-x-4">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-[#FFA500]" />
            ) : (
              <FaUserCircle size={36} className="text-[#FFA500]" />
            )}
            <div>
              <p className="font-semibold text-[#1A2B49]">{user?.name || "Loading..."}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-10 overflow-y-auto bg-white/80 backdrop-blur-lg">
          <div className="bg-gradient-to-r from-[#A6C76C] to-[#96B85C] rounded-3xl p-10 text-white shadow-lg mb-10 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-3 drop-shadow-md">
                Welcome back, <span className="text-[#1A2B49]">{user?.name || "User"}</span> 
              </h1>
              <p className="text-white/90 text-lg">
                Manage your vehicles, review reports, and explore MoVA’s intelligent access system.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md text-center hover:shadow-2xl transition-all border-b-4 border-teal-600">
              <h2 className="text-2xl font-bold text-teal-700">{stats.registeredVehicles}</h2>
              <p className="text-gray-600 font-medium">Registered Vehicles</p>
            </div>
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md text-center hover:shadow-2xl transition-all border-b-4 border-orange-400">
              <h2 className="text-2xl font-bold text-orange-500">{stats.logsToday}</h2>
              <p className="text-gray-600 font-medium">Logs Today</p>
            </div>
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md text-center hover:shadow-2xl transition-all border-b-4 border-blue-600">
              <h2 className="text-2xl font-bold text-blue-700">{stats.pendingApprovals}</h2>
              <p className="text-gray-600 font-medium">Pending Approvals</p>
            </div>
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md text-center hover:shadow-2xl transition-all border-b-4 border-green-600">
              <h2 className="text-2xl font-bold text-green-700">{stats.reportsGenerated}</h2>
              <p className="text-gray-600 font-medium">Total Logs</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}