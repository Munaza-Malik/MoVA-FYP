import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Import icons
import sideImage from "../assets/side-car.jpg"; 
import logo from "../assets/logo.png";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for new password
  const [showConfirm, setShowConfirm] = useState(false);   // Toggle for confirm password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
        password,
      });
      setMessage(res.data.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <img
        src={sideImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-[40%_center]"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Centered Form */}
      <div className="relative z-10 flex justify-center items-center h-full">
        <div className="bg-white/95 shadow-2xl rounded-3xl px-10 py-8 w-[90%] max-w-md backdrop-blur-md">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="MoVA Logo" className="w-16 mb-2" />
            <h2 className="text-[#1A2B49] text-3xl font-bold">MoVA</h2>
            <p className="text-gray-600 text-sm mt-1 text-center">
              AI Multimodal Vehicle Access System
            </p>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-center text-[#1A2B49] mb-2">
            Verify OTP
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter the OTP sent to <span className="font-semibold text-[#1A2B49]">{email}</span> and set your new password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#A6C76C]"
              required
            />
            
            {/* New Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#A6C76C]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1A2B49]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#A6C76C]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1A2B49]"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A6C76C] hover:bg-[#96b963] text-white py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Reset Password"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className={`mt-4 text-sm text-center font-medium ${message.includes("successful") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          {/* Back to Login Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Back to{" "}
            <a
              href="/login"
              className="text-[#2B4C7E] font-semibold hover:underline"
            >
              LOGIN
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}