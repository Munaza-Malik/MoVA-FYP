import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");     
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Fetch user profile to autofill name/email
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
        }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError("");
  setSubmitSuccess("");

  if (!form.subject || !form.message) {
    setSubmitError("⚠ Please fill out all required fields.");
    return;
  }

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    setSubmitError("❌ You must be logged in to send a message.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ Include the token here
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setSubmitSuccess("✅ Message sent successfully!");
      setForm((prev) => ({ ...prev, subject: "", message: "" }));
      setTimeout(() => navigate("/user-dashboard"), 2000);
    } else {
      setSubmitError(data.error || "❌ Failed to send message");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    setSubmitError("❌ Server error. Please try again later.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-[#1A2B49] drop-shadow-sm border-b border-[#A6C76C]/40 pb-4 inline-block">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-[#1A2B49]/80 max-w-2xl mx-auto">
          We’re here to assist you with any inquiries, collaborations, or
          technical support related to MoVA. Feel free to reach out!
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#A6C76C]/30 rounded-3xl p-8 shadow-lg transition-all hover:shadow-[#A6C76C]/20">
          <h2 className="text-2xl font-bold mb-6 text-[#1A2B49] text-center border-b border-[#A6C76C]/30 pb-3">
            Send a Message
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              disabled
              className="w-full px-5 py-3 rounded-xl border border-[#A6C76C]/40 bg-gray-100 cursor-not-allowed text-gray-600 shadow-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              disabled
              className="w-full px-5 py-3 rounded-xl border border-[#A6C76C]/40 bg-gray-100 cursor-not-allowed text-gray-600 shadow-sm"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-[#A6C76C]/40 focus:outline-none focus:ring-2 focus:ring-[#A6C76C] shadow-sm text-[#1A2B49]"
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              className="w-full px-5 py-3 rounded-xl border border-[#A6C76C]/40 focus:outline-none focus:ring-2 focus:ring-[#A6C76C] shadow-sm text-[#1A2B49]"
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white bg-[#1A2B49] hover:bg-[#15305a] shadow-lg transform transition-all duration-300 ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-[#A6C76C] rounded-3xl p-8 shadow-lg border border-[#1A2B49]/10">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#1A2B49] border-b border-[#1A2B49]/20 pb-3">
            Contact Information
          </h2>

          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <FaEnvelope className="text-[#1A2B49] text-2xl" />
              <p className="font-semibold text-[#1A2B49]">mova.webservices@gmail.com</p>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <FaPhone className="text-[#1A2B49] text-2xl" />
              <p className="font-semibold text-[#1A2B49]">+92 305 8591160</p>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <FaMapMarkerAlt className="text-[#1A2B49] text-2xl" />
              <p className="font-semibold text-[#1A2B49]">
                Riphah International University, Islamabad
              </p>
            </div>
          </div>

          {/* Google Map */}
          <div className="mt-8">
            <iframe
              title="Riphah International University Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.7840489572446!2d73.04296257538997!3d33.64915798073054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df969eb3b8b3a7%3A0x5a0f2b8e3b77b8a0!2sRiphah%20International%20University!5e0!3m2!1sen!2s!4v1600000000000!5m2!1sen!2s"
              width="100%"
              height="250"
              className="rounded-2xl border border-[#1A2B49]/10"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}