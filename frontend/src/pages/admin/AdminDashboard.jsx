import React, { useEffect, useState } from "react";
import {
  Users,
  Car,
  AlertTriangle,
  FileText,
  Bell,
  LayoutDashboard,
  CheckCircle,
} from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);

  // Fetch currently signed-in admin
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Admin profile fetch error:", err);
      }
    };
    fetchAdminProfile();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: 124,
      color: "from-[#1A2B49] to-[#2F3E64]",
      icon: Users,
    },
    {
      title: "Registered Vehicles",
      value: 87,
      color: "from-[#4BB543] to-[#2E8B57]",
      icon: Car,
    },
    {
      title: "Unauthorized Attempts",
      value: 4,
      color: "from-[#FF6B6B] to-[#C70039]",
      icon: AlertTriangle,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "User Ahmed registered a new vehicle (Honda Civic)",
      time: "2 mins ago",
    },
    {
      id: 2,
      action: "Unauthorized vehicle attempt detected at Gate 3",
      time: "10 mins ago",
    },
    { id: 3, action: "Camera #4 connection restored", time: "30 mins ago" },
    { id: 4, action: "Admin generated access report", time: "1 hour ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold flex items-center gap-2 text-[#1A2B49] drop-shadow-sm">
          <LayoutDashboard className="w-8 h-8 text-[#A6C76C]" />
          Admin Dashboard
        </h1>

        {/* Admin Info */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-[#A6C76C]/30 shadow-md hover:shadow-lg transition">
          <FaUserCircle className="w-8 h-8 text-[#A6C76C]" />
          <div className="text-right">
            <p className="font-semibold text-[#1A2B49] text-sm">
              {admin?.name || "Loading..."}
            </p>
            <p className="text-xs text-[#1A2B49]/70">
              {admin?.email || "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {stats.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-lg border border-white/10 flex items-center justify-between text-white hover:scale-[1.03] hover:shadow-2xl transform transition-all duration-300`}
            >
              <div>
                <h2 className="text-lg font-semibold tracking-wide opacity-90">
                  {card.title}
                </h2>
                <p className="text-4xl font-extrabold mt-2">{card.value}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full shadow-inner">
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#A6C76C]/30 rounded-3xl p-8 mb-10 shadow-lg transition-all hover:shadow-[#A6C76C]/20">
        <h2 className="text-2xl font-bold text-[#1A2B49] mb-6 flex items-center gap-2 border-b border-[#A6C76C]/30 pb-3">
          <FileText className="w-6 h-6 text-[#A6C76C]" />
          Recent Activity
        </h2>
        <ul className="divide-y divide-[#1A2B49]/10">
          {recentActivity.map((log) => (
            <li
              key={log.id}
              className="py-3 flex justify-between items-center hover:bg-[#A6C76C]/10 px-4 rounded-lg transition-all duration-300"
            >
              <span className="text-[#1A2B49]/90">{log.action}</span>
              <span className="text-sm text-[#1A2B49]/60">{log.time}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alerts Section */}
      <div className="bg-[#1A2B49] p-8 rounded-3xl shadow-xl border border-[#A6C76C]/30 text-white">
        <h2 className="text-2xl font-bold text-[#A6C76C] mb-6 flex items-center gap-2 border-b border-[#A6C76C]/40 pb-3">
          <Bell className="w-6 h-6 text-[#FFA500]" />
          Active Alerts
        </h2>

        <div className="flex justify-between items-center px-2">
          <p className="text-white/90">
            No new alerts. System is running smoothly.
          </p>
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
      </div>
    </div>
  );
}