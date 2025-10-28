import React from "react";
import Header from "../components/Header";
import { FaUser, FaCar, FaChartBar, FaCog } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Blue Header */}
      <div className="bg-blue-900 text-white shadow-md">
        <Header />
      </div>

      {/* Dashboard Content */}
      <main className="flex-grow p-8">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Welcome to MOVA 
          </h2>
          <p >

          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-blue-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <FaUser className="text-blue-900 text-3xl mb-2 mx-auto" />
              <h3 className="text-lg font-semibold text-blue-900">Users</h3>
              <p className="text-gray-600">1,250</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <FaCar className="text-blue-900 text-3xl mb-2 mx-auto" />
              <h3 className="text-lg font-semibold text-blue-900">Vehicles</h3>
              <p className="text-gray-600">430</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <FaChartBar className="text-blue-900 text-3xl mb-2 mx-auto" />
              <h3 className="text-lg font-semibold text-blue-900">Reports</h3>
              <p className="text-gray-600">89</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <FaCog className="text-blue-900 text-3xl mb-2 mx-auto" />
              <h3 className="text-lg font-semibold text-blue-900">Settings</h3>
              <p className="text-gray-600">Manage</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
                Add Vehicle
              </button>
              <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
                Generate Report
              </button>
              <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
                Manage Users
              </button>
              <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
