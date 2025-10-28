import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCar,
  FaFileAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaVideo,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // ✅ MoVA Logo

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { icon: <FaVideo />, label: "Live Monitoring", link: "/admin" },
    { icon: <FaTachometerAlt />, label: "Dashboard", link: "/admin/dashboard" },
    { icon: <FaUsers />, label: "Manage Users", link: "/admin/manage-users" },
    { icon: <FaCar />, label: "Manage Vehicles", link: "/admin/manage-vehicles" },
    { icon: <FaFileAlt />, label: "Logs & Reports", link: "/admin/logs-reports" },
    { icon: <FaBell />, label: "Alerts", link: "/admin/alerts" },
    { icon: <FaCog />, label: "Settings", link: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-[#A6C76C] text-[#1A2B49] flex flex-col shadow-2xl">
      {/* ✅ Logo + Title Section */}
      <div className="p-6 text-center border-b border-white/30">
        <img
          src={logo}
          alt="MoVA Logo"
          className="w-16 h-auto mx-auto mb-3 drop-shadow-lg object-contain"
        />
        <h1 className="text-xl font-extrabold tracking-wide text-[#1A2B49]">
          Admin Panel
        </h1>
      </div>

      {/* ✅ Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="flex items-center gap-3 px-4 py-3 rounded-lg 
            hover:bg-[#FFA500]/20 hover:scale-[1.03] transition-all duration-300"
          >
            <span className="text-[#1A2B49] text-lg">{item.icon}</span>
            <span className="font-medium text-[#1A2B49]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ✅ Logout Button */}
      <div className="p-4 border-t border-white/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-[#1A2B49]
          hover:bg-[#FFA500] hover:text-white font-semibold px-4 py-2 rounded-full shadow-md 
          hover:shadow-lg transition-all"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}