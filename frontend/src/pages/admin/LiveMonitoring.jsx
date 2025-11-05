import React, { useEffect, useRef, useState } from "react";

export default function LiveMonitoring() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [detectedPlates, setDetectedPlates] = useState([]);

  // =========================
  // Enumerate cameras
  // =========================
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

  // =========================
  // Camera functions
  // =========================
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

      // Start auto-detection (motion-based)
      startAutoDetection();
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

  function takeSnapshot() {
    if (!videoRef.current) return;
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

  function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    const stream = mediaStreamRef.current;
    if (!stream) return setError("No camera stream to record.");

    const options = { mimeType: "video/webm;codecs=vp9" };
    let recorded = [];

    const mr = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recorded.push(ev.data);
    };

    mr.onstop = () => {
      setIsRecording(false);
      setRecordedBlobs(recorded);
      const blob = new Blob(recorded, { type: "video/webm" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `recording_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    };

    mr.start();
    setIsRecording(true);
    setRecordedBlobs([]);
  }

  function handleDeviceSelect(e) {
    setSelectedDeviceId(e.target.value);
  }

  // =========================
  // PLATE DETECTION FUNCTIONS
  // =========================
  let prevFrameData = null;
  let isDetecting = false;
  let lastDetectionTime = 0;

  async function detectVehiclePresence() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (prevFrameData) {
      let diff = 0;
      for (let i = 0; i < frameData.data.length; i += 4) {
        diff += Math.abs(frameData.data[i] - prevFrameData.data[i]);       // R
        diff += Math.abs(frameData.data[i + 1] - prevFrameData.data[i + 1]); // G
        diff += Math.abs(frameData.data[i + 2] - prevFrameData.data[i + 2]); // B
      }
      diff = diff / (frameData.data.length / 4);

      const MOTION_THRESHOLD = 35;
      const COOLDOWN_MS = 5000;
      const now = Date.now();

      if (diff > MOTION_THRESHOLD && !isDetecting && now - lastDetectionTime > COOLDOWN_MS) {
        isDetecting = true;
        lastDetectionTime = now;
        await detectPlate(); // send snapshot to backend
        isDetecting = false;
      }
    }

    prevFrameData = frameData;
  }

async function detectPlate() {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  // Convert to base64 image
  const base64Image = canvas.toDataURL("image/jpeg");

  try {
    const response = await fetch("http://127.0.0.1:5000/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();
    if (result.text && result.text.length > 0) {
      setDetectedPlates(result.text);
    } else {
      setDetectedPlates([]);
    }
  } catch (error) {
    console.error("Error detecting plate:", error);
    setError("Failed to connect to backend.");
  }
}


  function startAutoDetection() {
    stopAutoDetection();
    detectionIntervalRef.current = setInterval(() => {
      detectVehiclePresence();
    }, 1000);
  }

  function stopAutoDetection() {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] flex flex-col items-center p-8">
      <h1 className="text-5xl font-extrabold mb-10 text-center drop-shadow-md">
        Live Monitoring
      </h1>

      <div className="w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={selectedDeviceId ?? ""}
            onChange={handleDeviceSelect}
            className="px-3 py-2 rounded-md border"
          >
            <option value="">Default Camera</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId}`}
              </option>
            ))}
          </select>

          <button onClick={() => startCamera(selectedDeviceId)} className="bg-[#A6C76C] px-4 py-2 rounded-full text-white">
            Restart Camera
          </button>
          <button onClick={stopCamera} className="bg-[#FFA500] px-4 py-2 rounded-full text-white">
            Stop Camera
          </button>
          <button onClick={takeSnapshot} className="bg-[#1A2B49] px-4 py-2 rounded-full text-white">
            Snapshot
          </button>
          <button
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-full text-white ${isRecording ? "bg-red-600" : "bg-[#A6C76C]"}`}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>
          <button
            onClick={detectPlate}
            className="bg-[#1A73E8] px-4 py-2 rounded-full text-white"
          >
            Detect Plate
          </button>
        </div>

        <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#A6C76C]/40 bg-gradient-to-br from-[#A6C76C]/20 via-white/80 to-[#96B85C]/10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-3xl"
          />
          {/* LIVE badge */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/30">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold text-red-600">LIVE</span>
          </div>

          {/* Detected plates overlay */}
          {detectedPlates.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-xl text-white font-bold text-lg">
              {detectedPlates.join(" | ")}
            </div>
          )}
        </div>

        {/* Zoom control */}
        <div className="mt-4 flex items-center gap-4">
          <label className="font-medium">Zoom</label>
          <input
            type="range"
            min={zoomSupported ? 1 : 1}
            max={zoomSupported ? zoom + 4 : 2}
            step="0.1"
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-64"
            disabled={!mediaStreamRef.current}
          />
          {!zoomSupported && (
            <small className="text-xs text-gray-500">
              Zoom not supported by camera; CSS scale used as fallback.
            </small>
          )}
        </div>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
