import React from "react";
import {
  FaBullseye,
  FaLightbulb,
  FaUsers,
  FaRobot,
  FaNetworkWired,
} from "react-icons/fa";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-[#A6C76C]/30">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-[#1A2B49] drop-shadow-sm border-b border-[#A6C76C]/40 pb-4">
          About Us
        </h1>

        {/* Intro Paragraph */}
        <p className="text-[#1A2B49]/80 leading-relaxed text-lg text-center max-w-3xl mx-auto mb-10">
          Welcome to the{" "}
          <span className="font-semibold text-[#A6C76C]">
            AI-Powered Multimodal Vehicle Access System (MoVA)
          </span>{" "}
          — a next-generation solution designed to enhance{" "}
          <span className="font-semibold">security</span>,{" "}
          <span className="font-semibold">reliability</span>, and{" "}
          <span className="font-semibold">efficiency</span> in vehicle access
          management. By integrating{" "}
          <span className="font-semibold text-[#A6C76C]">
            Face Recognition (FR)
          </span>{" "}
          and{" "}
          <span className="font-semibold text-[#A6C76C]">
            License Plate Recognition (LPR)
          </span>{" "}
          technologies into a unified framework, MoVA ensures intelligent and
          accurate verification for every vehicle entry and exit.
        </p>

        {/* System Overview Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all">
            <FaRobot className="text-4xl mb-3 mx-auto text-[#1A2B49]" />
            <h2 className="font-bold text-2xl mb-2 text-center text-[#1A2B49]">
              Our Technology
            </h2>
            <p className="text-[#1A2B49]/90 text-sm text-center">
              MoVA integrates cutting-edge AI modules for{" "}
              <span className="font-semibold">Face Recognition (FR)</span> and{" "}
              <span className="font-semibold">License Plate Recognition (LPR)</span>, 
              combining their results for secure multimodal verification.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all">
            <FaNetworkWired className="text-4xl mb-3 mx-auto text-[#1A2B49]" />
            <h2 className="font-bold text-2xl mb-2 text-center text-[#1A2B49]">
              System Architecture
            </h2>
            <p className="text-[#1A2B49]/90 text-sm text-center">
              The system seamlessly connects front-end cameras, AI recognition
              modules, backend verification, and database storage with a
              real-time dashboard for admins to monitor logs and manage access.
            </p>
          </div>
        </div>

        {/* Mission / Vision / Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] p-6 rounded-2xl text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <FaBullseye className="mx-auto mb-3 text-4xl text-[#1A2B49]" />
            <h2 className="font-bold text-xl mb-2 text-[#1A2B49]">
              Our Mission
            </h2>
            <p className="text-[#1A2B49]/90 text-sm">
              Deliver a robust, intelligent vehicle access system ensuring{" "}
              <span className="font-semibold">security</span> and{" "}
              <span className="font-semibold">efficiency</span>.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] p-6 rounded-2xl text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <FaLightbulb className="mx-auto mb-3 text-4xl text-[#1A2B49]" />
            <h2 className="font-bold text-xl mb-2 text-[#1A2B49]">
              Our Vision
            </h2>
            <p className="text-[#1A2B49]/90 text-sm">
              To be the{" "}
              <span className="font-semibold">
                leading AI-powered vehicle management solution
              </span>{" "}
              trusted for innovation and reliability.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] p-6 rounded-2xl text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <FaUsers className="mx-auto mb-3 text-4xl text-[#1A2B49]" />
            <h2 className="font-bold text-xl mb-2 text-[#1A2B49]">
              Our Values
            </h2>
            <p className="text-[#1A2B49]/90 text-sm">
              Professionalism,{" "}
              <span className="font-semibold">user-centric design</span>, and
              integrity in delivering top-notch solutions.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1A2B49] mb-6 border-b border-[#A6C76C]/40 pb-3">
            Meet the Team
          </h2>
          <p className="text-[#1A2B49]/80 mb-8 max-w-3xl mx-auto">
            Our talented developers are passionate about building a{" "}
            <span className="font-semibold text-[#A6C76C]">secure</span>,{" "}
            <span className="font-semibold text-[#A6C76C]">innovative</span>, and{" "}
            <span className="font-semibold text-[#A6C76C]">intelligent</span>{" "}
            vehicle access system for the future.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <div className="h-24 w-24 mx-auto mb-3 rounded-full bg-[#1A2B49] text-[#A6C76C] flex items-center justify-center text-3xl font-bold">
                M
              </div>
              <h3 className="font-bold text-xl text-[#1A2B49]">
                Munaza Malik
              </h3>
              <p className="text-[#1A2B49]/80 mt-1">
                Frontend & Backend Developer
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#A6C76C] to-[#CFE3B0] rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <div className="h-24 w-24 mx-auto mb-3 rounded-full bg-[#1A2B49] text-[#A6C76C] flex items-center justify-center text-3xl font-bold">
                A
              </div>
              <h3 className="font-bold text-xl text-[#1A2B49]">
                Areeba Sadaqat
              </h3>
              <p className="text-[#1A2B49]/80 mt-1">
                Frontend & Backend Developer
              </p>
            </div>
          </div>
        </div>

        {/* Closing Note */}
        <p className="text-center text-[#1A2B49]/80 text-lg max-w-4xl mx-auto">
          Designed with{" "}
          <span className="text-[#A6C76C] font-semibold">modern UI/UX</span> and{" "}
          <span className="font-semibold">robust backend integration</span>,
          MoVA delivers a{" "}
          <span className="text-[#A6C76C] font-semibold">
            future-ready and reliable platform
          </span>{" "}
          for all your vehicle management needs.
        </p>
      </div>
    </div>
  );
}