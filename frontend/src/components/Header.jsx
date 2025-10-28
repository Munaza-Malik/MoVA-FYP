import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Token remove
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // ✅ Redirect to Home.jsx
    navigate("/");   // make sure App.js me bhi path="/home" diya ho
  };

  return (
    <header className="flex items-center justify-between bg-blue-900 text-white px-8 py-6 shadow-md">
      {/* Logo + Title */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="MOVA Logo" className="w-14 h-14 object-contain" />
        <h1 className="text-2xl font-bold">MOVA Dashboard</h1>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 bg-white text-blue-900 font-semibold px-5 py-3 rounded-lg shadow hover:bg-gray-100 transition"
      >
        <FiLogOut size={22} />
        <span>Logout</span>
      </button>
    </header>
  );
}
