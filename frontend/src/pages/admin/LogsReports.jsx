import React, { useState, useEffect } from "react";
import { FaSignInAlt, FaSignOutAlt, FaDownload, FaTrash } from "react-icons/fa";
import axios from "axios";

export default function LogsReports() {
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logs, setLogs] = useState([]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch logs from backend (protected route)
  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = localStorage.getItem("token"); // ✅ get token

        const response = await axios.get("http://localhost:5000/api/logs", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token
          },
        });

        const validLogs = response.data.filter(
          (log) => log.user && log.vehicle && log.status
        );
        setLogs(validLogs);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      log.status.toLowerCase().includes(search.toLowerCase())
  );

  // Export logs to CSV
  const exportCSV = () => {
    const header = ["#", "User", "Vehicle", "Time", "Status"];
    const rows = filteredLogs.map((log, index) => [
      index + 1,
      log.user,
      log.vehicle,
      log.time,
      log.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "logs_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete a single log (protected + admin)
  const deleteLog = async (id) => {
    try {
      const token = localStorage.getItem("token"); // ✅ get token

      await axios.delete(`http://localhost:5000/api/logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });

      setLogs(logs.filter((log) => log._id !== id));
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  // Delete all logs (protected + admin)
  const deleteAllLogs = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ get token

      await axios.delete("http://localhost:5000/api/logs", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });

      setLogs([]);
    } catch (err) {
      console.error("Failed to delete all logs:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10 flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mb-8">
        <h1 className="text-4xl font-extrabold text-[#1A2B49]">Logs & Reports</h1>
        <span className="text-[#1A2B49]/60 mt-2 md:mt-0 text-sm md:text-base">
          {currentTime.toLocaleString()}
        </span>
      </div>

      {/* Search + Export + Delete All */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mb-8 gap-4">
        <input
          type="text"
          placeholder="Search by user, vehicle, or status..."
          className="w-full md:w-1/2 p-3 rounded-xl bg-white border border-[#A6C76C]/40 text-[#1A2B49] placeholder-[#1A2B49]/40 focus:outline-none focus:ring-2 focus:ring-[#A6C76C] shadow-sm transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 bg-[#A6C76C] hover:bg-[#96B85C] text-[#1A2B49] font-semibold py-3 px-6 rounded-xl shadow-md transition"
          >
            <FaDownload /> Export CSV
          </button>
          <button
            onClick={deleteAllLogs}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition"
          >
            <FaTrash /> Delete All
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto w-full max-w-5xl bg-white/80 backdrop-blur-md border border-[#A6C76C]/30 rounded-3xl shadow-xl p-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1A2B49] text-white rounded-t-3xl">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length ? (
              filteredLogs.map((log, index) => (
                <tr
                  key={log._id || index}
                  className="border-b border-[#A6C76C]/20 hover:bg-[#A6C76C]/10 transition-all"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{log.user}</td>
                  <td className="py-3 px-4">{log.vehicle}</td>
                  <td className="py-3 px-4">
                    {new Date(log.time).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2 font-semibold">
                    {log.status === "Entry" ? (
                      <>
                        <FaSignInAlt className="text-green-500" />
                        <span className="text-green-600">{log.status}</span>
                      </>
                    ) : (
                      <>
                        <FaSignOutAlt className="text-red-500" />
                        <span className="text-red-600">{log.status}</span>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteLog(log._id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete log"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-[#1A2B49]/50 italic"
                >
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
