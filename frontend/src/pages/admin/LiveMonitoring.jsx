import React, { useEffect, useRef, useState } from "react";

export default function LiveMonitoring() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // back camera on mobile
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied or not supported on this device.");
      }
    }
    startCamera();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] flex flex-col items-center p-8">
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-10 text-[#1A2B49] drop-shadow-md text-center">
        Live Monitoring
      </h1>

      {/* Camera Feed Card */}
      <div className="relative w-full max-w-5xl h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#A6C76C]/40 bg-gradient-to-br from-[#A6C76C]/20 via-white/80 to-[#96B85C]/10 backdrop-blur-md group transition-all duration-500 hover:shadow-[#A6C76C]/30 hover:scale-[1.01]">
        {/* Animated gradient light overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A6C76C]/20 via-[#FFA500]/10 to-[#1A2B49]/10 animate-gradient-x opacity-80"></div>

        {/* Live Camera Video */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {error ? (
            <p className="text-red-600 text-lg">{error}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-3xl"
            ></video>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 absolute bottom-6">
            <button className="bg-[#A6C76C] hover:bg-[#96B85C] text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300">
              Zoom
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  const canvas = document.createElement("canvas");
                  canvas.width = videoRef.current.videoWidth;
                  canvas.height = videoRef.current.videoHeight;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(videoRef.current, 0, 0);
                  const link = document.createElement("a");
                  link.href = canvas.toDataURL("image/png");
                  link.download = "snapshot.png";
                  link.click();
                }
              }}
              className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              Snapshot
            </button>
            <button className="bg-[#1A2B49] hover:bg-[#23365C] text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300">
              Settings
            </button>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/30">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          <span className="text-sm font-semibold text-red-600">LIVE</span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-8 px-8 py-4 rounded-2xl bg-[#1A2B49]/90 text-white text-center max-w-3xl shadow-lg border border-[#A6C76C]/40">
        Real-time AI-powered vehicle monitoring with intelligent alerts and secure access.
      </div>

      {/* Gradient Animation */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
}
