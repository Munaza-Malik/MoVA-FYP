import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/side-car.jpg";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log("Attempting to send OTP to:", email); // Debug log

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      console.log("Server Response Success:", res.data);
      setMessage(res.data.message || "OTP sent to your email!");
      
      // Navigate to verify page after a short delay so user can see success message
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1500);

    } catch (error) {
      // --- DETAILED ERROR LOGGING ---
      if (error.response) {
        // The server responded with a status code (400, 404, 500)
        console.error("Backend Error Data:", error.response.data);
        console.error("Backend Status Code:", error.response.status);
        setMessage(error.response.data.message || "Error sending OTP");
      } else if (error.request) {
        // The request was made but no response was received (Server down)
        console.error("No response received from server:", error.request);
        setMessage("Server is not responding. Please check your connection.");
      } else {
        // Something happened in setting up the request
        console.error("Request Setup Error:", error.message);
        setMessage("Request failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <img
        src={sideImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-[40%_center]"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 flex justify-center items-center h-full">
        <div className="bg-white/95 shadow-2xl rounded-3xl px-10 py-8 w-[90%] max-w-md backdrop-blur-md">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="MoVA Logo" className="w-16 mb-2" />
            <h2 className="text-[#1A2B49] text-3xl font-bold">MoVA</h2>
            <p className="text-gray-600 text-sm mt-1 text-center">
              AI Multimodal Vehicle Access System
            </p>
          </div>

          <h1 className="text-2xl font-semibold text-center text-[#1A2B49] mb-2">
            Forgot Password?
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your registered email to receive an OTP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C76C]"
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

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("sent") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <p className="text-sm text-center mt-6 text-gray-600">
            Remembered your password?{" "}
            <a href="/login" className="text-[#2B4C7E] font-semibold hover:underline">
              LOGIN HERE
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}