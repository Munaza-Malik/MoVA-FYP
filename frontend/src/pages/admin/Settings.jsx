import React, { useState } from "react";
import { FaCamera, FaLock } from "react-icons/fa";

export default function Settings() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10 flex flex-col items-center">
      {/* Page Heading */}
      <h1 className="text-4xl font-extrabold mb-10 text-[#1A2B49] text-center">
        System Settings
      </h1>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#A6C76C]/30 max-w-xl w-full space-y-8 transition-all duration-300 hover:shadow-2xl">
        {/* Change Password */}
        <div className="relative">
          <label className="flex items-center text-sm font-semibold text-[#1A2B49]/80 mb-2">
            <FaLock className="mr-2 text-[#A6C76C]" />
            Change Password
          </label>
          <input
            type={passwordVisible ? "text" : "password"}
            className="w-full p-3 rounded-lg bg-white border border-[#A6C76C]/40 text-[#1A2B49] focus:ring-2 focus:ring-[#A6C76C] outline-none shadow-sm placeholder-[#1A2B49]/50 transition-all duration-200"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-[38px] text-[#A6C76C] hover:text-[#1A2B49] transition font-semibold text-sm"
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        </div>

        {/* Update Camera Endpoint */}
        <div className="relative">
          <label className="flex items-center text-sm font-semibold text-[#1A2B49]/80 mb-2">
            <FaCamera className="mr-2 text-[#A6C76C]" />
            Update Camera Endpoint
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white border border-[#A6C76C]/40 text-[#1A2B49] focus:ring-2 focus:ring-[#A6C76C] outline-none shadow-sm placeholder-[#1A2B49]/50 transition-all duration-200"
            placeholder="http://camera-api-url"
          />
        </div>

        {/* Save Button */}
        <button className="bg-[#A6C76C] hover:bg-[#96B85C] w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-xl text-[#1A2B49] text-lg">
          Save Settings
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[#1A2B49]/70 text-center max-w-md leading-relaxed">
        Manage your system configuration and security settings here. <br />
        All changes take effect immediately.
      </div>
    </div>
  );
}