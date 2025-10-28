import React from "react";
import { Link } from "react-router-dom";
import sideImage from "../assets/side-car.jpg";
import logo from "../assets/logo.png"; 

export default function Auth() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-900">
      {/* White Card */}
      <div className="flex w-[90%] md:w-[70%] lg:w-[60%] bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Left Side Image */}
        <div className="hidden md:block w-1/2">
          <img
            src={sideImage}
            alt="Auth Illustration"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Content */}
        <div className="flex w-full md:w-1/2 justify-center items-center p-10">
          <div className="w-full max-w-md text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              AI Multimodal Vehicle Access System
            </h1>
            <p className="text-gray-600 mb-6">
              Please log in or create a new account to continue
            </p>

            {/* Buttons */}
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                className="block w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
