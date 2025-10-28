import React, { useState } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/side-car.jpg";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    let errorMsg = "";
    if (role === "user") {
      if (userType === "student" && !email.endsWith("@students.riphah.edu.pk")) {
        errorMsg =
          "Only student emails allowed (e.g., xyz@students.riphah.edu.pk)";
      } else if (userType === "faculty" && !email.endsWith("@riphah.edu.pk")) {
        errorMsg = "Only faculty emails allowed (e.g., abc@riphah.edu.pk)";
      }
    }
    setErrors((prev) => ({ ...prev, email: errorMsg }));
    return errorMsg === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!role) newErrors.role = "Please select your role.";
    if (role === "user" && !userType)
      newErrors.userType = "Please select a user type.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const valid = validateEmail();
    if (!valid) return;

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role,
        userType,
      });

      if (remember) localStorage.setItem("token", res.data.token);
      else sessionStorage.setItem("token", res.data.token);

      navigate(role === "admin" ? "/admin" : "/user-dashboard");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        password: error.response?.data?.message || "Login failed",
      }));
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <img
        src={sideImage}
        alt="Car Background"
        className="absolute inset-0 w-full h-full object-cover object-[40%_center]"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Centered Form */}
      <div className="relative z-10 flex justify-center items-center h-full">
        <div className="bg-white/95 shadow-2xl rounded-3xl px-10 py-8 w-[90%] max-w-md backdrop-blur-md">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="MOVA Logo" className="w-16 mb-2" />
            <h2 className="text-[#1A2B49] text-3xl font-bold">MoVA</h2>
            <p className="text-gray-600 text-sm mt-1 text-center">
              AI Multimodal Vehicle Access System
            </p>
          </div>

          {/* Role Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            {["admin", "user"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setUserType("");
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  role === r
                    ? "bg-[#A6C76C] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {r === "admin" ? "Admin" : "User"}
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="text-red-500 text-sm text-center mb-2">
              {errors.role}
            </p>
          )}

          {/* User Type Dropdown */}
          {role === "user" && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-center">
                Select User Type
              </label>
              <select
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value);
                  setErrors((prev) => ({ ...prev, userType: "" }));
                }}
                className="w-full border border-gray-300 rounded-none px-4 py-2 focus:ring-2 focus:ring-[#A6C76C] outline-none"
              >
                <option value="" disabled hidden>
                  -- Choose Type --
                </option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="guest">Guest</option>

              </select>
              {errors.userType && (
                <p className="text-red-500 text-sm text-center mt-1">
                  {errors.userType}
                </p>
              )}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={`w-full px-4 py-3 border rounded-none focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#A6C76C]"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full px-4 py-3 border rounded-none focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#A6C76C]"
              }`}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </span>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-green-700"
              />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-[#2B4C7E] hover:underline font-medium"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button — Rounded Edges */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-[#A6C76C] hover:bg-[#96b963] text-white py-3 rounded-full font-semibold transition-all duration-300"
          >
            LOGIN
          </button>

          {/* Signup */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-[#2B4C7E] font-semibold hover:underline"
            >
              SIGN UP
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
