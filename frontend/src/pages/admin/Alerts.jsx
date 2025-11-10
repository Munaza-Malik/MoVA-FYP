import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaBell, FaTimes } from "react-icons/fa";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  // ✅ Auth header
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  // ✅ Wrap fetchAlerts in useCallback to avoid eslint warning
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts", getAuthConfig());
      setAlerts(res.data.sort((a, b) => new Date(b.time) - new Date(a.time)));
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  }, []); // no dependencies needed

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]); // now safe

  const dismissAlert = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/alerts/${id}`, getAuthConfig());
      fetchAlerts();
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const typeColor = {
    Critical: "bg-red-100 text-red-700 border border-red-300",
    Warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Info: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] px-6 py-10 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-10 text-center">Alerts & Notifications</h1>

      <div className="space-y-6 w-full max-w-4xl">
        {alerts.map((a) => (
          <div
            key={a._id}
            className="flex items-center justify-between bg-white border border-[#A6C76C]/30 p-5 rounded-2xl shadow-md hover:shadow-lg transform transition duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#A6C76C]/10 rounded-full">
                <FaBell className="text-[#A6C76C]" size={22} />
              </div>
              <div>
                <p className="font-semibold">{a.message}</p>
                <p className="text-sm text-[#1A2B49]/60">
                  {new Date(a.time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${typeColor[a.type]}`}
              >
                {a.type}
              </span>
              <button
                onClick={() => dismissAlert(a._id)}
                className="text-[#1A2B49]/50 hover:text-red-500 transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center mt-6 bg-white border border-[#A6C76C]/30 rounded-2xl shadow p-6">
            <p className="text-[#1A2B49]/70 text-lg font-medium">
              No active alerts - all systems running smoothly
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
