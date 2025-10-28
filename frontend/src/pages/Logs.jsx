import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Logs() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/vehicles/my-vehicles",
          {
            headers: { Authorization: `Bearer ${token} `},
          }
        );
        setVehicles(res.data.vehicles || []); // sets the array
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // 🔍 Filter vehicles
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

      {/* Full-width Search Bar */}
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
          {filteredVehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-[#A6C76C]
                         hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold text-[#1A2B49] mb-2">
                {v.plateNumber}
              </h2>
              <p>
                <span className="font-semibold text-[#A6C76C]">Type:</span>{" "}
                {v.vehicleType}
              </p>
              <p>
                <span className="font-semibold text-[#A6C76C]">Brand:</span>{" "}
                {v.brand || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-[#A6C76C]">Model:</span>{" "}
                {v.model || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-[#A6C76C]">Color:</span>{" "}
                {v.color || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-[#A6C76C]">Phone:</span>{" "}
                {v.phone}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Registered At: {new Date(v.createdAt).toLocaleString()}
              </p>

              {v.documents?.length > 0 && (
                <div className="mt-3">
                  <strong className="text-[#1A2B49]">Documents:</strong>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {v.documents.map((doc, i) => (
                      <li key={i}>
                        <a
                          href={`http://localhost:5000/${doc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A6C76C] hover:underline font-medium"
                        >
                          {doc.split("-").slice(1).join("-")}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No vehicles found.</p>
      )}
    </div>
  );
}