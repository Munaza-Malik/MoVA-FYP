import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaSearch, FaFileAlt } from "react-icons/fa";
import axios from "axios";

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vehicles/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/vehicles/${id}/status`,
        { status: action === "approve" ? "Approved" : "Rejected" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: res.data.status } : v))
      );
    } catch (err) {
      console.error("Error updating vehicle status:", err);
    }
  };

  const filteredVehicles = vehicles
    .filter(
      (v) =>
        v.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(search.toLowerCase())
    )
    .filter((v) => (statusFilter ? v.status === statusFilter : true));

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#1A2B49] text-xl">
        Loading vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10 flex flex-col items-center transition-all">
      <h1 className="text-4xl font-extrabold mb-10 text-[#1A2B49] text-center">
        Manage Vehicles
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-6xl items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute top-3 left-3 text-[#1A2B49]/50" />
          <input
            type="text"
            placeholder="Search by owner or plate..."
            className="w-full pl-10 p-3 rounded-lg bg-white border border-[#A6C76C]/30 text-[#1A2B49] placeholder-[#1A2B49]/50 focus:outline-none focus:ring-2 focus:ring-[#A6C76C] shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 rounded-lg bg-white border border-[#A6C76C]/30 text-[#1A2B49] focus:outline-none focus:ring-2 focus:ring-[#A6C76C] shadow-sm"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-x-auto w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 border border-[#A6C76C]/30">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#ECF3E8] text-[#1A2B49] border-b border-[#A6C76C]/40">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Plate</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Documents</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length ? (
              filteredVehicles.map((v, index) => (
                <tr
                  key={v._id}
                  className="border-b border-[#1A2B49]/10 hover:bg-[#A6C76C]/10 transition transform hover:scale-[1.01]"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{v.user?.name || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold">{v.plateNumber}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      v.status === "Approved"
                        ? "text-green-600"
                        : v.status === "Rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {v.status || "Pending"}
                  </td>
                  <td className="py-3 px-4 flex flex-wrap gap-2">
                    {v.documents?.length > 0 ? (
                      v.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={`http://localhost:5000/uploads/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#1A2B49] hover:text-[#A6C76C] underline transition"
                        >
                          <FaFileAlt />
                          Doc {i + 1}
                        </a>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No docs</span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex justify-center space-x-3">
                    <button
                      onClick={() => handleAction(v._id, "approve")}
                      className="text-green-600 hover:text-green-500 transition transform hover:scale-110"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleAction(v._id, "reject")}
                      className="text-red-500 hover:text-red-400 transition transform hover:scale-110"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-[#1A2B49]/70 py-4 italic">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-8 px-6 py-3 rounded-xl bg-white/80 text-[#1A2B49]/70 text-center max-w-md shadow border border-[#A6C76C]/20">
        Manage all registered vehicles efficiently with real-time approval tools.
      </div>
    </div>
  );
}