import React from "react";

export default function AdminProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8 flex justify-center">
      <div className="bg-white/10 rounded-xl shadow-lg p-6 backdrop-blur-md max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-6 text-teal-400 text-center">
          Admin Profile
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              defaultValue="System Admin"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              defaultValue="admin@riphah.edu.pk"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 w-full py-3 rounded-lg font-semibold transition">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
