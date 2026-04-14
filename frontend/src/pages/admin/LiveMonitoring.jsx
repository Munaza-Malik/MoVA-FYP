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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [crops, setCrops] = useState({ face: null, plate: null }); 
  const [plateText, setPlateText] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [authStatus, setAuthStatus] = useState(""); 
  const [confidence, setConfidence] = useState(0);
  const [driverName, setDriverName] = useState("");

  useEffect(() => {
    async function getCams() {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (cams.length) setSelectedDeviceId(cams[0].deviceId);
      } catch (err) { setError("Device enumeration failed"); }
    }
    getCams();
  }, []);

  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => stopCamera();
  }, [selectedDeviceId]);

  async function startCamera(id) {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: id ? { exact: id } : undefined } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          if (!detectionIntervalRef.current) {
            detectionIntervalRef.current = setInterval(runScan, 3000);
          }
        };
      }
    } catch (err) { setError("Camera access denied"); }
  }

  function stopCamera() {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }

  async function runScan() {
    if (isProcessing || !videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    
    setIsProcessing(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/detect", { 
        image: canvas.toDataURL("image/jpeg") 
      });
      const data = res.data;
      setCrops(data.crops || { face: null, plate: null });
      setPlateText(data.plate);
      setAccessMessage(data.message);
      setAuthStatus(data.status);
      setConfidence(data.confidence);
      setDriverName(data.driver || "");

      if (data.plate !== "Unknown" || data.driver !== "Unknown") {
        const token = localStorage.getItem("token"); 
        await axios.post("http://localhost:5000/api/logs", {
          user: data.driver,
          vehicle: data.plate, 
          status: data.status === "SUCCESS" ? "Approved" : "Denied", 
          time: new Date().toISOString()
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) { console.error("Detection Error:", e); } 
    finally { setIsProcessing(false); }
  } 

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900 font-sans flex flex-col">
      {/* HEADER */}
      <header className="max-w-[1600px] w-full mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black tracking-tighter text-slate-800">
          SECURE<span className="text-indigo-600">GATE</span> MONITOR
        </h1>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM ONLINE
        </div>
      </header>

      <main className="max-w-[1600px] w-full mx-auto grid grid-cols-12 gap-8 flex-1">
        
        {/* LEFT: ENLARGED LIVE VIDEO FEED */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white">
            <video 
              ref={videoRef} 
              autoPlay playsInline muted 
              className="w-full h-full object-cover" 
              style={{ transform: `scale(${zoom})` }} 
            />
            
            {/* Subtle Overlay Indicators */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-400 animate-ping' : 'bg-indigo-400 shadow-[0_0_8px_#818cf8]'}`}></div>
                 <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                   {isProcessing ? 'Analyzing Frame...' : 'Live Feed Active'}
                 </span>
              </div>
            </div>
          </div>

          {/* CAMERA CONTROLS (Indigo/Slate Theme) */}
          <div className="flex flex-wrap gap-4 items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <select 
              value={selectedDeviceId || ""} 
              onChange={(e) => setSelectedDeviceId(e.target.value)} 
              className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none ring-1 ring-slate-200"
            >
              {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
            </select>
            
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Digital Zoom</span>
              <input 
                type="range" min="1" max="3" step="0.1" value={zoom} 
                onChange={(e) => setZoom(e.target.value)} 
                className="w-48 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>
          </div>
        </div>

        {/* RIGHT: RECOGNITION PANEL */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Intelligence</h2>
              {isProcessing && (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <div className="space-y-10 flex-1">
              {/* DRIVER SCAN */}
              <div>
                <label className="text-[9px] font-black text-indigo-500 uppercase block mb-3 tracking-wider">Driver Scan</label>
                <div className="h-44 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                  {crops.face ? (
                    <img src={crops.face} className="w-full h-full object-cover" alt="face" />
                  ) : (
                    <div className="text-center">
                      <div className="text-slate-300 text-xl mb-1">👤</div>
                      <span className="text-slate-300 text-[10px] font-bold">AWAITING SUBJECT</span>
                    </div>
                  )}
                </div>
                {/* DRIVER NAME AS PLAIN TEXT */}
                <div className="text-center mt-4">
                    <span className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        {driverName || "UNKNOWN"}
                    </span>
                </div>
              </div>

              {/* VEHICLE ID */}
              <div>
                <label className="text-[9px] font-black text-indigo-500 uppercase block mb-3 tracking-wider">Vehicle ID</label>
                <div className="h-28 bg-slate-900 rounded-3xl flex items-center justify-center p-4 shadow-inner">
                  {crops.plate ? (
                    <img src={crops.plate} className="max-h-full object-contain" alt="plate" />
                  ) : (
                    <span className="text-slate-700 text-[10px] font-black tracking-widest italic uppercase">Scanning...</span>
                  )}
                </div>
                {/* PLATE NUMBER AS PLAIN TEXT */}
                <div className="text-center mt-6">
                    <span className="text-3xl font-bold text-[#3E4095] tracking-tight">
                        {plateText && plateText !== "Unknown" ? plateText : "No Plate Found"}
                    </span>
                </div>
              </div>

              {/* AUTH MESSAGE (Soft Rose/Emerald Theme) */}
              <div className="pt-4 mt-auto">
                {accessMessage ? (
                    <div className={`p-5 rounded-2xl text-center font-black text-xs shadow-lg transform transition-all animate-pulse ${
                    authStatus === "SUCCESS" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    }`}>
                    {accessMessage.toUpperCase()}
                    </div>
                ) : (
                    <div className="p-5 rounded-2xl text-center font-black text-xs bg-slate-100 text-slate-400 border border-slate-200">
                        WAITING FOR DETECTION
                    </div>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[10px] font-bold text-center border border-rose-100">
              ⚠️ {error.toUpperCase()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}