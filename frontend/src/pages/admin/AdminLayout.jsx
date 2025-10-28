// src/pages/admin/AdminLayout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* This is where child pages render */}
        <Outlet />
      </main>
    </div>
  );
}
