import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function LiveMonitoring() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [detectedPlates, setDetectedPlates] = useState([]);
  
  // ✅ Nayi States Face + Plate recognition ke liye
  const [detectionCrops, setDetectionCrops] = useState([]); 
  const [plateText, setPlateText] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [authStatus, setAuthStatus] = useState(""); 

  // Camera Devices fetch karna (Aapka original logic)
  useEffect(() => {
    async function fetchDevices() {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = list.filter((d) => d.kind === "videoinput");
        setDevices(videoInputs);

        if (videoInputs.length && !selectedDeviceId) {
          const hasEnv = videoInputs.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment")
          );
          setSelectedDeviceId(
            selectedDeviceId || (hasEnv ? hasEnv.deviceId : videoInputs[0].deviceId)
          );
        }
      } catch (err) {
        console.warn("Device enumeration failed:", err);
      }
    }
    fetchDevices();
  }, [selectedDeviceId]);

  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => stopCamera();
  }, [selectedDeviceId]);

  async function startCamera(deviceId = null) {
    stopCamera();
    setError("");

    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: "environment" } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) videoRef.current.srcObject = stream;

      const [videoTrack] = stream.getVideoTracks();
      const capabilities = videoTrack.getCapabilities?.();
      if (capabilities && capabilities.zoom !== undefined) {
        setZoomSupported(true);
        const settings = videoTrack.getSettings?.();
        setZoom(settings?.zoom ?? capabilities.min ?? 1);
      } else {
        setZoomSupported(false);
      }

      videoRef.current.onloadeddata = () => {
        console.log("🎥 Video ready — starting auto detection");
        startAutoDetection();
      };
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not supported on this device.");
    }
  }

  function stopCamera() {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    stopAutoDetection();
  }

  // Zoom Logic (Aapka original logic)
  async function handleZoomChange(value) {
    setZoom(value);
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const [track] = stream.getVideoTracks();
    if (!track) return;
    const capabilities = track.getCapabilities?.();
    if (capabilities && capabilities.zoom !== undefined) {
      try {
        await track.applyConstraints({ advanced: [{ zoom: value }] });
      } catch (err) {
        console.warn("Zoom applyConstraints failed", err);
      }
    } else if (videoRef.current) {
      videoRef.current.style.transform = `scale(${value})`;
    }
  }

  function handleDeviceSelect(e) {
    setSelectedDeviceId(e.target.value);
  }

  // Motion Detection Logic (Aapka original logic)
  let prevFrameData = null;
  let isDetecting = false;
  let lastDetectionTime = 0;

  async function detectVehiclePresence() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    let frameData;
    try {
      frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch { return; }

    if (prevFrameData) {
      let diff = 0;
      for (let i = 0; i < frameData.data.length; i += 4) {
        diff += Math.abs(frameData.data[i] - prevFrameData.data[i]);
        diff += Math.abs(frameData.data[i + 1] - prevFrameData.data[i + 1]);
        diff += Math.abs(frameData.data[i + 2] - prevFrameData.data[i + 2]);
      }
      diff = diff / (frameData.data.length / 4);

      const MOTION_THRESHOLD = 35;
      const COOLDOWN_MS = 5000;
      const now = Date.now();

      if (diff > MOTION_THRESHOLD && !isDetecting && now - lastDetectionTime > COOLDOWN_MS) {
        isDetecting = true;
        lastDetectionTime = now;
        await detectEverything(); // Updated Function Name
        isDetecting = false;
      }
    }
    prevFrameData = frameData;
  }

  // ✅ MAIN DETECTION: Ab isme Face aur Plate dono handle honge
  async function detectEverything() {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");

    try {
      // 1. Python AI Server ko image bhejna
      const response = await fetch("http://127.0.0.1:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const result = await response.json();

      // UI update karna
      setDetectionCrops(result.plate_images || []); // Isme Face aur Plate crops hain
      setDetectedPlates(result.plates || []);
      setPlateText(result.plate || "Unknown");
      setAccessMessage(result.message);
      setAuthStatus(result.status);
      setError("");

      // 2. Node.js Database (Port 5000) mein log entry karna
      // Backend (Python) ne jo 'result' diya hai ussi ko use karke log save karein
      if (result.status === "SUCCESS" || result.plate !== "Unknown") {
        try {
          await axios.post("http://localhost:5000/api/logs", {
            user: result.driver || "Unknown", // Python backend driver name dega
            vehicle: result.plate,
            status: result.status === "SUCCESS" ? "Entry" : "Denied",
            time: new Date().toISOString(),
          });
          
          // Agar access denied hai toh alert bhi bhej dein
          if (result.status !== "SUCCESS") {
            await axios.post("http://localhost:5000/api/alerts", {
                vehicle: result.plate,
                message: result.message,
                type: "Critical",
                time: new Date().toISOString(),
            });
          }
        } catch (dbErr) {
          console.error("Database Logging Error:", dbErr);
        }
      }

    } catch (err) {
      console.error("Error during detection:", err);
      setError("Connection Error: Check if Python server is running on Port 8000");
    }
  }

  function startAutoDetection() {
    stopAutoDetection();
    detectionIntervalRef.current = setInterval(() => detectVehiclePresence(), 1000);
  }

  function stopAutoDetection() {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] flex flex-col items-center p-8 relative">
      <h1 className="text-5xl font-extrabold mb-10 text-center drop-shadow-md">Live Monitoring</h1>

      <div className="flex justify-center items-start gap-6 w-full max-w-6xl">
        {/* VIDEO FEED BOX */}
        <div className="relative w-[70%] h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#A6C76C]/40 bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-3xl" />
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/30">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold text-red-600">LIVE</span>
          </div>

          {detectedPlates.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-xl text-white font-bold text-lg">
              {detectedPlates.join(" | ")}
            </div>
          )}
        </div>

        {/* SIDE PANEL: Ab isme Face aur Plate dono dikhenge */}
        {(detectionCrops.length > 0 || plateText) && (
          <div className="w-[28%] bg-white/90 backdrop-blur-md border border-gray-300 shadow-xl rounded-xl p-4 text-center">
            <h3 className="text-sm font-bold text-[#1A2B49] mb-4">Live Detections</h3>
            
            <div className="flex flex-col gap-4">
                {detectionCrops.map((crop, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <img src={crop} alt={`Detection ${index}`} className="w-full h-32 object-contain bg-gray-50" />
                        <p className="text-[10px] bg-gray-100 py-1 font-bold uppercase">
                            {index === 0 ? "Driver Face" : "Vehicle Plate"}
                        </p>
                    </div>
                ))}
            </div>

            {plateText && <p className="font-mono text-xl mt-4 text-[#1A2B49] tracking-widest border-t pt-2">{plateText}</p>}
            
            {accessMessage && (
              <div className={`mt-4 p-3 rounded-lg font-semibold text-white text-center shadow-md transition-all ${
                authStatus === "SUCCESS" ? "bg-green-600" : "bg-red-600"
              }`}>
                {accessMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTROLS AREA */}
      <div className="w-full max-w-5xl mt-8 flex flex-wrap gap-4 items-center justify-center bg-white/50 p-6 rounded-2xl backdrop-blur-sm">
        <select value={selectedDeviceId ?? ""} onChange={handleDeviceSelect} className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-[#A6C76C] outline-none">
          <option value="">Default Camera</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>
          ))}
        </select>

        <button onClick={() => startCamera(selectedDeviceId)} className="bg-[#A6C76C] hover:bg-[#96B85C] px-6 py-2 rounded-full text-white font-bold transition-all shadow-md">Restart Camera</button>
        <button onClick={stopCamera} className="bg-[#FFA500] hover:bg-[#e69500] px-6 py-2 rounded-full text-white font-bold transition-all shadow-md">Stop Camera</button>

        <div className="flex items-center gap-4">
          <label className="font-bold text-sm text-gray-600">ZOOM</label>
          <input
            type="range"
            min={1}
            max={zoomSupported ? 5 : 2}
            step="0.1"
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-48 accent-[#A6C76C]"
            disabled={!mediaStreamRef.current}
          />
        </div>

        {error && <p className="w-full text-center text-red-600 mt-3 font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
      </div>
    </div>
  );
}