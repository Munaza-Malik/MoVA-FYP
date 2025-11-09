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
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const iconMap = {
    Users: Users,
    Car: Car,
    AlertTriangle: AlertTriangle,
  };

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch admin profile
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdmin(res.data))
      .catch((err) => console.error("Admin profile fetch error:", err));
  }, [token]);

  // Fetch stats, recent activity, and alerts
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        // Stats
        const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);

        // Recent Activity (only Entry logs)
        const logsRes = await axios.get("http://localhost:5000/api/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const entryLogs = logsRes.data
          .filter((log) => log.status === "Entry")
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(entryLogs);

        // Alerts (Critical & Warning)
        const alertsRes = await axios.get("http://localhost:5000/api/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const criticalWarnings = alertsRes.data.filter(
          (a) => a.type === "Critical" || a.type === "Warning"
        );
        setAlerts(criticalWarnings);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [token]);

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
            <p className="text-xs text-[#1A2B49]/70">{admin?.email || "Loading..."}</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {stats.map((card, i) => {
          const Icon = iconMap[card.icon] || Users;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-lg border border-white/10 flex items-center justify-between text-white hover:scale-[1.03] hover:shadow-2xl transform transition-all duration-300`}
            >
              <div>
                <h2 className="text-lg font-semibold tracking-wide opacity-90">{card.title}</h2>
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
          {recentActivity.map((log, i) => (
            <li
              key={log._id || i}
              className="py-3 flex justify-between items-center hover:bg-[#A6C76C]/10 px-4 rounded-lg transition-all duration-300"
            >
              <span className="text-[#1A2B49]/90">{`${log.user} - ${log.vehicle}`}</span>
              <span className="text-sm text-[#1A2B49]/60">
                {new Date(log.time).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </li>
          ))}
          {recentActivity.length === 0 && (
            <li className="py-3 text-center text-[#1A2B49]/50 italic">No recent activity</li>
          )}
        </ul>
      </div>

      {/* Alerts Section */}
      <div className="bg-[#1A2B49] p-8 rounded-3xl shadow-xl border border-[#A6C76C]/30 text-white">
        <h2 className="text-2xl font-bold text-[#A6C76C] mb-6 flex items-center gap-2 border-b border-[#A6C76C]/40 pb-3">
          <Bell className="w-6 h-6 text-[#FFA500]" />
          Active Alerts
        </h2>
        <div className="flex flex-col gap-3">
          {alerts.length > 0 ? (
            alerts.map((a) => (
              <div
                key={a._id}
                className={`flex justify-between items-center px-4 py-2 rounded-xl border ${
                  a.type === "Critical"
                    ? "border-red-400 bg-red-100 text-red-700"
                    : "border-yellow-400 bg-yellow-100 text-yellow-700"
                }`}
              >
                <span>{a.message}</span>
                <span className="text-sm">{new Date(a.time).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-white/90">No critical or warning alerts</p>
          )}
        </div>
      </div>
    </div>
  );
}
