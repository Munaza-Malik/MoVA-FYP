import React, { useEffect, useState } from "react";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-[#F9FAFB]">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-[#1A2B49] font-semibold">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#F9FAFB] text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#A6C76C] to-[#96B85C] text-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="MoVA" className="w-14 h-14" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">My Profile</h1>
              <p className="text-white/90">
                Manage your account details and view registration info
              </p>
            </div>
          </div>

          {/* Profile Image or Icon */}
          <div className="flex items-center space-x-4">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <FaUserCircle size={56} className="text-white/90" />
            )}
            <div className="text-right">
              <p className="font-semibold">{user?.name || "-"}</p>
              <p className="text-sm text-white/90">{user?.email || "-"}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1A2B49] mb-6">
            Account Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                readOnly
                value={user?.name || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                readOnly
                value={user?.email || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Role</label>
              <input
                readOnly
                value={user?.role || "Guest"}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="mt-1 relative">
                <input
                  readOnly
                  value={user?.password || "******"}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 pr-12"
                />
                <div
                  className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Faculty</label>
              <input
                readOnly
                value={user?.faculty || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Program Type</label>
              <input
                readOnly
                value={user?.programType || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Semester</label>
              <input
                readOnly
                value={user?.semester ?? ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Batch</label>
              <input
                readOnly
                value={user?.batch || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Year</label>
              <input
                readOnly
                value={user?.year || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input
                readOnly
                value={user?.phone || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">SAP ID</label>
              <input
                readOnly
                value={user?.sapId || user?.sap || ""}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => navigate("/user-dashboard")}
              className="px-5 py-2 rounded-full border border-[#A6C76C] text-[#1A2B49] font-medium hover:bg-[#A6C76C] hover:text-white transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
