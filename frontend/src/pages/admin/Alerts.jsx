import React, { useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";

export default function Alerts() {
  const [alerts, setAlerts] = useState([
    { id: 1, message: "Unauthorized vehicle detected!", time: "9:40 AM", type: "Critical" },
    { id: 2, message: "Suspicious entry attempt!", time: "12:15 PM", type: "Warning" },
  ]);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const typeColor = {
    Critical: "bg-red-100 text-red-700 border border-red-300",
    Warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Info: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] px-6 py-10 flex flex-col items-center transition-all">
      {/* Page Heading */}
      <h1 className="text-4xl font-extrabold mb-10 text-[#1A2B49] text-center">
        Alerts & Notifications
      </h1>

      {/* Alerts List */}
      <div className="space-y-6 w-full max-w-4xl">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between bg-white border border-[#A6C76C]/30 p-5 rounded-2xl shadow-md hover:shadow-lg transform transition duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#A6C76C]/10 rounded-full">
                <FaBell className="text-[#A6C76C]" size={22} />
              </div>
              <div>
                <p className="font-semibold text-[#1A2B49]">{a.message}</p>
                <p className="text-sm text-[#1A2B49]/60">{a.time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Type Badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${typeColor[a.type]}`}
              >
                {a.type}
              </span>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissAlert(a.id)}
                className="text-[#1A2B49]/50 hover:text-red-500 transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}

        {/* No Alerts Message */}
        {alerts.length === 0 && (
          <div className="text-center mt-6 bg-white border border-[#A6C76C]/30 rounded-2xl shadow p-6">
            <p className="text-[#1A2B49]/70 text-lg font-medium">
              No active alerts — all systems running smoothly 
            </p>
          </div>
        )}
      </div>

      {/* Subtle Footer Note */}
      <div className="mt-8 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-md text-[#1A2B49]/70 text-center max-w-md shadow-sm border border-[#A6C76C]/20">
        Stay informed with real-time security alerts.
      </div>
    </div>
  );
}