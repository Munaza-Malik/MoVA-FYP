import React, { useEffect, useRef, useState } from "react";

export default function LiveMonitoring() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);

  // Enumerate devices (cameras)
  useEffect(() => {
    async function fetchDevices() {
      try {
        // Some browsers require getUserMedia called once before enumerateDevices to show labels
        // We'll try to get a small permission-less stream if needed
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const list = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = list.filter((d) => d.kind === "videoinput");
          setDevices(videoInputs);
          if (videoInputs.length && !selectedDeviceId) {
            // prefer environment/back camera when available
            const hasEnv = videoInputs.find((d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("environment")
            );
            setSelectedDeviceId((prev) => prev || (hasEnv ? hasEnv.deviceId : videoInputs[0].deviceId));
          }
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

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  // Start camera function
  async function startCamera(deviceId = null) {
    stopCamera(); // make sure previous stream stopped

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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // detect zoom support
      const [videoTrack] = stream.getVideoTracks();
      const capabilities = videoTrack.getCapabilities?.();
      if (capabilities && typeof capabilities.zoom !== "undefined") {
        setZoomSupported(true);
        // set slider initial to current setting or min
        const settings = videoTrack.getSettings?.();
        setZoom(settings?.zoom ?? capabilities.min ?? 1);
        setZoom((z) => z); // keep state in-sync
      } else {
        setZoomSupported(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access denied. Allow camera permission and reload.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Camera access denied or not supported on this device.");
      }
    }
  }

  // Stop camera: stop all tracks and clear srcObject
  function stopCamera() {
    try {
      const stream = mediaStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.warn("Error stopping camera", err);
    }
  }

  // Snapshot (keeps your existing implementation)
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

  // Zoom change handler (uses track.applyConstraints if supported)
  async function handleZoomChange(value) {
    setZoom(value);
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const [track] = stream.getVideoTracks();
    if (!track) return;
    const capabilities = track.getCapabilities?.();
    if (capabilities && typeof capabilities.zoom !== "undefined") {
      try {
        await track.applyConstraints({ advanced: [{ zoom: value }] });
      } catch (err) {
        console.warn("Zoom applyConstraints failed", err);
      }
    } else {
      // fallback: use CSS transform (not true optical zoom)
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${value})`;
      }
    }
  }

  // Start/stop recording
  function toggleRecording() {
    if (isRecording) {
      // stop
      mediaRecorderRef.current?.stop();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    const stream = mediaStreamRef.current;
    if (!stream) {
      setError("No camera stream to record.");
      return;
    }
    const options = { mimeType: "video/webm;codecs=vp9" };
    let recorded = [];
    try {
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recorded.push(ev.data);
        }
      };

      mr.onstop = () => {
        setIsRecording(false);
        setRecordedBlobs(recorded);
        // create download link
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
    } catch (err) {
      console.error("MediaRecorder error:", err);
      setError("Recording not supported in this browser.");
    }
  }

  // Handle device change from dropdown
  function handleDeviceSelect(e) {
    setSelectedDeviceId(e.target.value);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] flex flex-col items-center p-8">
      <h1 className="text-5xl font-extrabold mb-10 text-[#1A2B49] drop-shadow-md text-center">
        Live Monitoring
      </h1>

      <div className="w-full max-w-5xl">
        <div className="mb-4 flex items-center gap-3">
          {/* Device selector */}
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

          <button
            onClick={() => startCamera(selectedDeviceId)}
            className="bg-[#A6C76C] px-4 py-2 rounded-full text-white"
          >
            Restart Camera
          </button>

          <button
            onClick={stopCamera}
            className="bg-[#FFA500] px-4 py-2 rounded-full text-white"
          >
            Stop Camera
          </button>

          <button
            onClick={takeSnapshot}
            className="bg-[#1A2B49] px-4 py-2 rounded-full text-white"
          >
            Snapshot
          </button>

          <button
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-full text-white ${isRecording ? "bg-red-600" : "bg-[#A6C76C]"}`}
          >
            {isRecording ? "Stop Recording" : "Record"}
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
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/30">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold text-red-600">LIVE</span>
          </div>
        </div>

        {/* Zoom control if supported */}
        <div className="mt-4 flex items-center gap-4">
          <label className="font-medium">Zoom</label>
          <input
            type="range"
            min={zoomSupported ? 1 : 1}
            max={zoomSupported ?  (parseFloat(zoom) + 4) : 2}
            step="0.1"
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-64"
            disabled={!mediaStreamRef.current}
          />
          {!zoomSupported && <small className="text-xs text-gray-500">Zoom not supported by camera; CSS scale used as fallback.</small>}
        </div>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>

      <style>{`
        @keyframes gradient-x { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>
    </div>
  );
}
