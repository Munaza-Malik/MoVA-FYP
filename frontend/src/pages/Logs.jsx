import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSignInAlt } from "react-icons/fa"; // Removed FaSignOutAlt

export default function Logs() {
  const [vehicles, setVehicles] = useState([]);
  const [gateLogs, setGateLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Registered Vehicles
        const resVehicles = await axios.get("http://localhost:5000/api/vehicles/my-vehicles", { headers });
        setVehicles(resVehicles.data.vehicles || []);

        // 2. Fetch Gate Activity Logs (Entries)
        const resLogs = await axios.get("http://localhost:5000/api/logs", { headers });
        setGateLogs(resLogs.data || []);

      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  //  Filter vehicles
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAF6] via-[#EEF3E8] to-[#F8FAF6] p-8 text-[#1A2B49]">
      <h1 className="text-4xl font-extrabold mb-6 tracking-wide text-center text-[#1A2B49]">
        My Vehicle Logs
      </h1>

      {/* 🔍 Search Bar */}
      <div className="mb-6 w-full">
        <input
          type="text"
          placeholder="Search by Plate, Brand, or Model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-full border border-gray-300 text-gray-800 font-medium 
                     placeholder-gray-500 focus:ring-2 focus:ring-[#A6C76C] outline-none shadow-sm"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => {
            // ⭐ Match logs with vehicle plate
            const vehicleActivity = gateLogs.filter(log => log.vehicle === v.plateNumber);

            return (
              <div
                key={v._id}
                className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-[#A6C76C]
                           hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                {/* 🚗 Vehicle Info */}
                <h2 className="text-2xl font-bold text-[#1A2B49] mb-2">
                  {v.plateNumber}
                </h2>
                <p><span className="font-semibold text-[#A6C76C]">Type:</span> {v.vehicleType}</p>
                <p><span className="font-semibold text-[#A6C76C]">Brand:</span> {v.brand || "N/A"}</p>
                <p><span className="font-semibold text-[#A6C76C]">Model:</span> {v.model || "N/A"}</p>
                <p><span className="font-semibold text-[#A6C76C]">Color:</span> {v.color || "N/A"}</p>
                <p><span className="font-semibold text-[#A6C76C]">Phone:</span> {v.phone}</p>

                {/* 🟢 GATE ACTIVITY SECTION: Focuses on Entry Status (Approved/Denied) */}
                <div className="mt-4 bg-[#F0F4E8] p-3 rounded-xl border border-[#A6C76C]/30">
                  <h3 className="text-sm font-bold text-[#1A2B49] mb-2 uppercase tracking-wider">
                    Recent Gate Activity
                  </h3>
                  {vehicleActivity.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {vehicleActivity.map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-[11px] bg-white p-2 rounded shadow-sm border-l-2 border-[#A6C76C]">
                          <div className="flex items-center gap-2">
                            <FaSignInAlt className={log.status === "Approved" ? "text-green-500" : "text-red-500"} />
                            <span className={`font-bold ${log.status === "Approved" ? "text-green-600" : "text-red-600"}`}>
                              {log.status}
                            </span>
                          </div>
                          <span className="text-gray-500">{new Date(log.time).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">No gate entry activity recorded.</p>
                  )}
                </div>

                {/* 👨‍✈️ Drivers Section */}
                {v.drivers && v.drivers.length > 0 && (
                  <div className="mt-4 bg-[#F9FAF9] p-3 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-2">Driver Details</h3>
                    {v.drivers.map((driver, index) => (
                      <div key={index} className="border-b border-gray-200 pb-2 mb-2 last:border-none">
                        <p><strong className="text-[#A6C76C]">Name:</strong> {driver.name || "N/A"}</p>
                        <p><strong className="text-[#A6C76C]">CNIC:</strong> {driver.cnic || "N/A"}</p>
                        <p><strong className="text-[#A6C76C]">Phone:</strong> {driver.phone || "N/A"}</p>
                        {driver.driverImages?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {driver.driverImages.map((img, i) => (
                              <img key={i} src={`http://localhost:5000/${img}`} alt="Driver" className="w-16 h-16 rounded-lg border object-cover" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 📂 Documents & Vehicle Images */}
                {v.documents?.length > 0 && (
                  <div className="mt-3 text-sm">
                    <strong>Documents:</strong>
                    <ul className="list-disc ml-5 text-gray-700">
                      {v.documents.map((doc, i) => (
                        <li key={i}><a href={`http://localhost:5000/${doc}`} target="_blank" rel="noreferrer" className="text-[#A6C76C] hover:underline">{doc.split("-").slice(1).join("-")}</a></li>
                      ))}
                    </ul>
                  </div>
                )}

                {v.profileImages?.length > 0 && (
                  <div className="mt-4">
                    <strong>Vehicle Images:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {v.profileImages.map((img, i) => (
                        <img key={i} src={`http://localhost:5000/${img}`} alt="Vehicle" className="w-16 h-16 rounded-md border object-cover" />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-500 mt-2">Registered At: {new Date(v.createdAt).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No vehicles found.</p>
      )}
    </div>
  );
}