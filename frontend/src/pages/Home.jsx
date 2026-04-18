import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import heroCar from "../assets/side-car.jpg";
import aiIcon from "../assets/ai-icon.png"; 
import faceIcon from "../assets/face-icon.png"; 
import cameraIcon from "../assets/camera-icon.jpg";
import munazaPhoto from "../assets/munaza.png"; 
import areebaPhoto from "../assets/areeba.png"; 

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#A6C76C] text-[#1A2B49] shadow-md sticky top-0 z-50">
        <div className="max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            <span className="font-bold text-2xl tracking-wide">MoVA</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8 font-semibold">
            {[
              { name: "Home", link: "#home" },
              { name: "Architecture", link: "#services" },
              { name: "Features", link: "#features" },
              { name: "Contact", link: "#contact" },
              { name: "Team", link: "#about" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-[#F79F1F] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.name}
              </a>
            ))}
            <Link
              to="/login"
              className="bg-[#1A2B49] text-white px-4 py-1 rounded-full hover:bg-[#16213E] transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#F79F1F] text-white px-4 py-1 rounded-full hover:bg-[#e48d0c] transition"
            >
              Signup
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl font-bold text-[#1A2B49]"
            >
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden bg-[#A6C76C] flex flex-col items-center space-y-4 py-4 text-[#1A2B49] font-semibold">
            {[
              { name: "Home", link: "#home" },
              { name: "Architecture", link: "#services" },
              { name: "Features", link: "#features" },
              { name: "Contact", link: "#contact" },
              { name: "Team", link: "#about" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setMenuOpen(false)}
                className="relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-[#F79F1F] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        <img
          src={heroCar}
          alt="Hero"
          className="w-full h-full object-cover transform scale-110 hover:scale-[1.13] transition-transform duration-[2000ms] ease-in-out"
        />

        <div className="absolute inset-0 flex items-center px-8 md:px-20 lg:px-32">
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl max-w-2xl shadow-lg">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
              AI-Powered Multimodal Vehicle Access System
            </h1>
            <p className="text-white text-xl font-semibold mb-2">
              Smart Access, Smarter Roads
            </p>
            <p className="text-gray-200 text-lg leading-relaxed mb-4">
              A unified AI solution integrating Face Recognition (FR) and License Plate Recognition (LPR) 
              to enable intelligent, contactless, and secure vehicle entry management.
            </p>
            <Link
              to="/login"
              className="inline-block bg-[#F79F1F] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#e48d0c] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section id="services" className="py-16 px-6 text-center bg-[#F8FAF5]">
        <h2 className="text-3xl font-bold text-[#1A2B49] mb-12">
          System Architecture
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              img: cameraIcon,
              title: "Front-end Cameras",
              desc: "Cameras installed at the entry point capture both the driver’s face and vehicle license plate simultaneously.",
            },
            {
              img: aiIcon,
              title: "Backend AI Modules",
              desc: "Deep learning models process facial and plate data to verify identities and make access decisions in real-time.",
            },
            {
              img: faceIcon,
              title: "Database & Gate Control",
              desc: "Validated entries are logged into the database, and the gate barrier is automatically controlled based on access authorization.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition"
            >
              <img
                src={card.img}
                alt={card.title}
                className="w-14 h-14 mx-auto mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-[#1A2B49]">
                {card.title}
              </h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#EAF0E1] py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-[#1A2B49] mb-12">
          Powered by Artificial Intelligence
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              title: "AI License Plate Recognition",
              desc: "Automatically detects and extracts license numbers from vehicles with high accuracy under various lighting conditions.",
            },
            {
              title: "Face Recognition Verification",
              desc: "Authenticates registered drivers using advanced neural network-based facial recognition technology.",
            },
            {
              title: "Smart Decision System",
              desc: "Combines results from FR and LPR to ensure only authorized individuals gain access - eliminating manual verification delays.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-[#1A2B49] text-white p-6 rounded-2xl shadow"
            >
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

{/* Contact Section */}
<section id="contact" className="py-20 bg-gradient-to-r from-[#F8FAF5] to-[#EAF0E1]">
  <div className="max-w-6xl mx-auto text-center px-6">
    <h2 className="text-3xl font-bold text-[#1A2B49] mb-10">
      Contact Us
    </h2>

    <div className="bg-white shadow-xl rounded-2xl p-10 md:p-16">
      <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
        Have questions about our AI Vehicle Access System?  
        We're here to help you learn more about integrations, deployments, or collaborations.
      </p>

      <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-10 mt-6">
        {/* Email */}
        <div className="flex flex-col items-center bg-[#F5F7FA] rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="text-[#F79F1F] text-4xl mb-3">📧</div>
          <h3 className="font-bold text-lg text-[#1A2B49] mb-1">Email Us</h3>
          <p className="text-gray-600">mova.webservices@gmail.com</p>
        </div>

        {/* Phone */}
        <div className="flex flex-col items-center bg-[#F5F7FA] rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="text-[#F79F1F] text-4xl mb-3">📞</div>
          <h3 className="font-bold text-lg text-[#1A2B49] mb-1">Call Us</h3>
          <p className="text-gray-600">+92 305 8591160</p>
        </div>

        {/* Location */}
        <div className="flex flex-col items-center bg-[#F5F7FA] rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="text-[#F79F1F] text-4xl mb-3">📍</div>
          <h3 className="font-bold text-lg text-[#1A2B49] mb-1">Visit Us</h3>
          <p className="text-gray-600 text-center">
            Riphah International University,<br /> Islamabad
          </p>
        </div>
      </div>
    </div>

    {/* Developer Section */}
    <div id="about" className="mt-20 text-center">
      <h3 className="text-2xl font-bold text-[#1A2B49] mb-8">
        Meet the Developers
      </h3>
      <div className="flex flex-col md:flex-row justify-center items-center gap-10">
        <div>
          <img
            src={munazaPhoto}
            alt="Munaza Malik"
            className="w-56 h-56 object-cover rounded-full mx-auto shadow-lg mb-3"
          />
          <p className="font-semibold text-lg text-[#1A2B49]">
            Munaza Malik
          </p>
        </div>
        <div>
          <img
            src={areebaPhoto}
            alt="Areeba Sadaqat"
            className="w-56 h-56 object-cover rounded-full mx-auto shadow-lg mb-3"
          />
          <p className="font-semibold text-lg text-[#1A2B49]">
            Areeba Sadaqat
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


{/* Footer */}
<footer className="bg-[#1A2B49] text-white py-6 mt-auto">
  <div className="max-w-6xl mx-auto flex justify-center items-center px-6">
    <p className="text-sm text-center">© 2025 MoVA. All rights reserved.</p>
  </div>
</footer>

    </div>
  );
}
