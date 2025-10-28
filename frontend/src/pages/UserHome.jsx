import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaShieldAlt,
  FaHandsHelping,
  // FaPlayCircle,
  FaCarSide,
  FaInfoCircle,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import carImage from "../assets/car1.png";

export default function UserHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-[#F9FAFB] text-gray-800">
      {/*  Hero Section */}
      <header className="relative bg-gradient-to-r from-[#A6C76C] to-[#96B85C] text-white px-6 md:px-20 py-10 md:py-12 shadow-md overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
          {/* Left: Glass Welcome Card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-10 shadow-2xl max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <img
                src={logo}
                alt="MoVA Logo"
                className="w-14 h-14 object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
              />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                Welcome to <span className="text-[#1A2B49]">MoVA</span>
              </h1>
            </div>

            <p className="text-white/90 text-lg leading-relaxed">
              Experience AI-powered Multimodal Vehicle Access — combining
              license plate recognition, face detection, and smart gate control
              for secure and seamless entry.
            </p>

            <button
              onClick={() => navigate("/user-dashboard")}
              className="mt-8 px-8 py-3 rounded-full bg-white text-[#1A2B49] font-semibold text-lg hover:bg-[#FFA500] hover:text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Go to My Dashboard
            </button>
          </div>

          {/*  Right: Car Image with enhanced blending */}
          <div className="relative mt-10 md:mt-0 md:ml-12 w-full md:w-[45%] flex justify-center">
            <div className="relative">
              {/* Subtle gradient floor to blend image */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#A6C76C]/60 via-transparent to-transparent blur-2xl"></div>

              <img
                src={carImage}
                alt="AI Vehicle"
                className="relative w-full h-auto object-contain opacity-95 mix-blend-overlay transition-all duration-700 ease-out transform hover:scale-[1.03] hover:opacity-100 animate-fade-in"
              />
            </div>
          </div>
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </header>

      {/*  Features Section */}
      <main className="flex-1 p-10">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1A2B49] mb-4">
            What Makes MoVA Special
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover how MoVA integrates Artificial Intelligence and automation
            to deliver the next generation of smart access control.
          </p>
        </section>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <FaCarSide size={60} className="text-[#1A2B49]" />,
              title: "Smart Vehicle Access",
              desc: "Easily register and manage vehicles with AI-driven automation and recognition technology.",
            },
            {
              icon: <FaBrain size={60} className="text-[#FFA500]" />,
              title: "AI Recognition",
              desc: "Facial and license plate recognition with deep learning models for fast, accurate results.",
            },
            {
              icon: <FaShieldAlt size={60} className="text-[#A6C76C]" />,
              title: "Secure & Reliable",
              desc: "End-to-end encryption and smart authentication ensure your data and access are safe.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/90 border border-gray-200 backdrop-blur-sm rounded-2xl p-10 shadow-md hover:shadow-2xl hover:border-[#A6C76C] transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#1A2B49] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/*  Quick Access Section */}
        <section className="mt-20 bg-gradient-to-br from-[#A6C76C]/15 to-white rounded-3xl p-12 max-w-6xl mx-auto shadow-lg border border-[#A6C76C]/30">
          <h2 className="text-3xl font-bold text-[#1A2B49] mb-8 text-center">
            Get Started with MoVA
          </h2>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              {
                icon: <FaInfoCircle size={45} className="text-[#FFA500] mb-4" />,
                label: "About Us",
                link: "/about",
              },
              {
                icon: <FaHandsHelping size={45} className="text-[#1A2B49] mb-4" />,
                label: "Contact Support",
                link: "/contact",
              },
              {
                icon: <FaCarSide size={45} className="text-[#A6C76C] mb-4" />,
                label: "Register Vehicle",
                link: "/vehicle-registration",
              },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.link)}
                className="bg-white border border-gray-200 px-10 py-8 rounded-2xl hover:border-[#A6C76C] hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 w-72"
              >
                <div className="flex flex-col items-center">
                  {item.icon}
                  <span className="font-semibold text-[#1A2B49] text-lg">
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/*  Footer */}
      <footer className="bg-[#1A2B49] text-center py-6 text-white shadow-inner mt-12">
        <p className="text-sm tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">MoVA System</span> - Designed for
          Intelligent Access & Security.
        </p>
      </footer>

      {/*  Fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}