import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaBell, FaTimes } from "react-icons/fa";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Improved Auth header with check
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) return null; // Don't send request if no token
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchAlerts = useCallback(async () => {
    const config = getAuthConfig();
    if (!config) {
      console.warn("No auth token found, skipping fetch.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/alerts", config);
      // Sort by newest first
      setAlerts(res.data.sort((a, b) => new Date(b.time) - new Date(a.time)));
      setLoading(false);
    } catch (err) {
      console.error("Failed to load alerts:", err.response?.status === 401 ? "Unauthorized" : err.message);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Poll every 5 seconds for new security alerts
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const dismissAlert = async (id) => {
    const config = getAuthConfig();
    try {
      await axios.delete(`http://localhost:5000/api/alerts/${id}`, config);
      // Optimistic UI update: remove from local state immediately
      setAlerts(prev => prev.filter(alert => alert._id !== id));
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
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800">Alerts & Notifications</h1>
        <p className="text-slate-500 mt-2">Real-time security monitoring system</p>
      </header>

      <div className="space-y-4 w-full max-w-4xl">
        {alerts.map((a) => (
          <div
            key={a._id}
            className="flex items-center justify-between bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${a.type === 'Critical' ? 'bg-red-50' : 'bg-indigo-50'}`}>
                <FaBell className={a.type === 'Critical' ? 'text-red-500' : 'text-indigo-500'} size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-700">{a.message}</p>
                <div className="flex gap-3 mt-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {new Date(a.time).toLocaleString()}
                  </span>
                  {a.vehicle && <span className="text-[10px] font-black text-indigo-500 uppercase">Vehicle: {a.vehicle}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typeColor[a.type] || typeColor.Info}`}>
                {a.type}
              </span>
              <button
                onClick={() => dismissAlert(a._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-slate-500 font-medium">No active security alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}