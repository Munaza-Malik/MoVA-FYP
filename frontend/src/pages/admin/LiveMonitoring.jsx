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
  const [previewImage, setPreviewImage] = useState(null);
  const [plateText, setPlateText] = useState("");
  const [accessMessage, setAccessMessage] = useState("");

  // Enumerate cameras
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

  // Start camera when selectedDeviceId changes
  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => stopCamera();
  }, [selectedDeviceId]);

  // Camera functions
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

      // Wait for video to load before auto detection
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

  // Plate detection
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
    } catch {
      return;
    }

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
        await detectPlate();
        isDetecting = false;
      }
    }

    prevFrameData = frameData;
  }

  async function detectPlate() {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");

    try {
      const response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const result = await response.json();

      if (!result.text || result.text.length === 0) {
        setDetectedPlates([]);
        setPlateText("");
        setPreviewImage(null);
        setError("No plate detected");
        setAccessMessage("");
        return;
      }

      setDetectedPlates(result.text);
      setPlateText(result.text.join(" | "));
      setPreviewImage(result.plate_images?.[0] || null);
      setError("");

      // Normalize plate
      let plateRaw = result.text[0].replace(/\s/g, "").toUpperCase().replace(/[^A-Z0-9-]/g, "");
      const plate = plateRaw.match(/^([A-Z]{3}-\d{2,3})/)?.[0] || plateRaw;

      console.log("Plate detected:", plate);

      try {
        const vehicleRes = await axios.get(`http://localhost:5000/api/vehicles/plate/${plate}`);

        if (vehicleRes.data) {
          let statusMessage = "";
          if (vehicleRes.data.status === "Approved") {
            setAccessMessage(`✅ Authenticated User: ${vehicleRes.data.user?.name || "Unknown"} — Access Allowed`);
            statusMessage = "Entry";
          } else {
            setAccessMessage(`❌ Vehicle ${plate} detected — Status: ${vehicleRes.data.status}`);
            statusMessage = "Denied";

            // Save alert for registered but not allowed
            await axios.post("http://localhost:5000/api/alerts", {
              vehicle: plate,
              message: `Vehicle ${plate} detected — Status: ${vehicleRes.data.status}`,
              type: "Warning",
              time: new Date().toISOString(),
            });
          }

          await axios.post("http://localhost:5000/api/logs", {
            user: vehicleRes.data.user?.name || "Unknown",
            vehicle: plate,
            status: statusMessage,
            time: new Date().toISOString(),
          });
        }
      } catch (err) {
        // Vehicle not found → unregistered
        console.log("Vehicle not found:", plate);
        setAccessMessage(`❌ Vehicle ${plate} not registered — Access Denied`);

        // Save alert for unregistered vehicle
        await axios.post("http://localhost:5000/api/alerts", {
          vehicle: plate,
          message: `Unregistered vehicle detected: ${plate}`,
          type: "Critical",
          time: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error detecting plate:", err);
      setError("Failed to detect plate or connect to backend.");
      setAccessMessage("");
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
        {/* Live Camera */}
        <div className="relative w-[70%] h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#A6C76C]/40 bg-gradient-to-br from-[#A6C76C]/20 via-white/80 to-[#96B85C]/10">
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

        {/* Plate Preview */}
        {(previewImage || plateText) && (
          <div className="w-[28%] bg-white/90 backdrop-blur-md border border-gray-300 shadow-xl rounded-xl p-4 text-center">
            <h3 className="text-sm font-bold text-[#1A2B49] mb-2">Detected Plate</h3>
            {previewImage && <img src={previewImage} alt="Detected Plate" className="w-full h-32 object-contain rounded-md border border-gray-400 mb-2" />}
            {plateText && <p className="font-mono text-lg text-[#1A2B49] tracking-wider">{plateText}</p>}
            {accessMessage && (
              <div className={`mt-4 p-3 rounded-lg font-semibold text-white text-center ${accessMessage.includes("Allowed") ? "bg-green-600" : "bg-red-600"}`}>
                {accessMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-5xl mt-8 flex flex-wrap gap-3 items-center">
        <select value={selectedDeviceId ?? ""} onChange={handleDeviceSelect} className="px-3 py-2 rounded-md border">
          <option value="">Default Camera</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>
          ))}
        </select>

        <button onClick={() => startCamera(selectedDeviceId)} className="bg-[#A6C76C] px-4 py-2 rounded-full text-white">Restart Camera</button>
        <button onClick={stopCamera} className="bg-[#FFA500] px-4 py-2 rounded-full text-white">Stop Camera</button>
        <button onClick={detectPlate} className="bg-[#1A73E8] px-4 py-2 rounded-full text-white">Detect Plate</button>

        {/* Zoom control */}
        <div className="flex items-center gap-4 mt-4">
          <label className="font-medium">Zoom</label>
          <input
            type="range"
            min={1}
            max={zoomSupported ? zoom + 4 : 2}
            step="0.1"
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-64"
            disabled={!mediaStreamRef.current}
          />
          {!zoomSupported && <small className="text-xs text-gray-500">Zoom not supported; CSS scale fallback used.</small>}
        </div>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
