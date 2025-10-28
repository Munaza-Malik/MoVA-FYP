import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/side-car.jpg"; // same as signup/login
import logo from "../assets/logo.png"; // same logo

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message || "OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP");
      console.error("Forgot Password Error:", error);
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
            Forgot Password?
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your registered email to receive an OTP.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#A6C76C]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A6C76C] hover:bg-[#96b963] text-white py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
          )}

          {/* Login Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Remembered your password?{" "}
            <a
              href="/login"
              className="text-[#2B4C7E] font-semibold hover:underline"
            >
              LOGIN HERE
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
