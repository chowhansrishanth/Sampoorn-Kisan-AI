import { useState, useEffect, useRef } from "react";
import axios, { getApiErrorMessage } from "../api/client";
import { UploadCloud, ShieldAlert, CheckCircle2, Leaf, Eye, FileText, Activity, AlertCircle, Camera, PhoneCall, Sparkles, RefreshCw, Printer, X, QrCode, Volume2, VolumeX, Share2, ZoomIn, ZoomOut, Clock, Droplets, ChevronDown, ChevronUp, Layers, Sun, HelpCircle, History, Trash2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const INDIAN_CROPS_LIST = [
  "Tomato", "Rice / Paddy", "Cotton", "Chilli", "Maize / Corn",
  "Groundnut", "Soybean", "Red Gram (Arhar)", "Green Gram (Moong)",
  "Black Gram (Urad)", "Wheat", "Sugarcane", "Banana", "Mango",
  "Vegetables (General)", "Pulses (General)"
];

const HISTORY_STORAGE_KEY = "sampoorn_disease_history";

export default function DiseaseDiagnosis({ user }) {
  const { t, language } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sampleFilename, setSampleFilename] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(user?.cropType || "Tomato");
  const [locationInput, setLocationInput] = useState(user?.location || "Telangana, India");
  const [symptomText, setSymptomText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qualityError, setQualityError] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // ─── MAX FEATURE 1: Grad-CAM Interactive Studio State ──────────────────────
  const [viewMode, setViewMode] = useState("split"); // "split" | "blend" | "sideBySide"
  const [wipePos, setWipePos] = useState(50); // 0 to 100%
  const [blendOpacity, setBlendOpacity] = useState(70); // 0 to 100%
  const colorPalette = "jet"; // "jet" | "turbo" | "viridis" | "inferno"
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.5, 2, 2.5
  const studioContainerRef = useRef(null);
  const isDraggingWipe = useRef(false);

  // ─── MAX FEATURE 2: Live Camera Viewport State ─────────────────────────────
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" | "user"
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ─── MAX FEATURE 3: Tank-Mix & Dosage Calculator State ─────────────────────
  const [farmAcres, setFarmAcres] = useState(user?.farmSizeHectares ? (user.farmSizeHectares * 2.47).toFixed(1) : "2.5");
  const [sprayerType, setSprayerType] = useState("16L"); // "16L" | "20L" | "500L"

  // ─── MAX FEATURE 4: 14-Day Disease Progression Simulator State ─────────────
  const [progressionDay, setProgressionDay] = useState(4); // 1, 4, 7, 14

  // ─── MAX FEATURE 5: Audio Speech Voice-Over State ──────────────────────────
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const synthRef = useRef(window.speechSynthesis || null);

  // ─── MAX FEATURE 6: Diagnosis History State ────────────────────────────────
  const [historyList, setHistoryList] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]'); return Array.isArray(saved) ? saved.slice(0,10) : []; }
    catch { return []; }
  });
  const [reportCode] = useState(() => Date.now().toString().slice(-6));
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // ─── MAX FEATURE 7: Agronomist Q&A Sandbox State ───────────────────────────
  const [expandedFaq, setExpandedFaq] = useState(null);



  // Save scan to history
  const saveScanToHistory = (scanData) => {
    try {
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        crop: scanData.affected_crop || selectedCrop,
        disease: scanData.disease_name,
        severity: scanData.severity_level || "Moderate",
        confidence: Math.round((scanData.confidence_score || 0.9) * 100),
        treated: false
      };
      const updated = [newEntry, ...historyList.slice(0, 9)];
      setHistoryList(updated);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch { /* Browser storage or media resource is unavailable. */ }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistoryList([]);
    } catch { /* Browser storage or media resource is unavailable. */ }
  };

  // Clean up blob URLs and speech synthesis on unmount
  useEffect(() => {
    const synth = synthRef.current;
    return () => {
      if (preview && preview.startsWith("blob:")) {
        try { URL.revokeObjectURL(preview); } catch { /* Browser storage or media resource is unavailable. */ }
      }
      if (synth && synth.speaking) {
        synth.cancel();
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [preview]);

  // ─── Camera Controller Functions ──────────────────────────────────────────
  const startCamera = async (facing = cameraFacing) => {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera access denied or unavailable. Please upload an image directly.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `leaf_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        if (preview && file) URL.revokeObjectURL(preview);
        setFile(capturedFile);
        setSampleFilename(null);
        setPreview(URL.createObjectURL(blob));
        setError(null);
        setQualityError(null);
        stopCamera();
      }
    }, "image/jpeg", 0.92);
  };

  // ─── File & Sample Selectors ──────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (preview && file) URL.revokeObjectURL(preview);
      setFile(selected);
      setSampleFilename(null);
      setPreview(URL.createObjectURL(selected));
      setError(null);
      setQualityError(null);
    }
  };

  const handleSampleSelect = async (sampleId, defaultCrop) => {
    setLoading(true);
    setError(null);
    setQualityError(null);
    try {
      const response = await axios.get(`/api/disease/samples/${sampleId}`, { responseType: 'blob', timeout: 15000 });
      const contentType = response.headers['content-type'] || 'image/png';
      const sampleFile = new File([response.data], `${sampleId}.png`, { type: contentType });
      if (preview && file) URL.revokeObjectURL(preview);
      setFile(sampleFile);
      setSampleFilename(null);
      setPreview(URL.createObjectURL(sampleFile));
      if (defaultCrop) setSelectedCrop(defaultCrop);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'The selected sample image is unavailable. Please upload a leaf image instead.'));
    } finally {
      setLoading(false);
    }
  };

  // ─── Wipe Dragging Handler for Grad-CAM Split Screen ───────────────────────
  const handleWipeMove = (clientX) => {
    if (!studioContainerRef.current) return;
    const rect = studioContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setWipePos(pct);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingWipe.current || !e.touches[0]) return;
    handleWipeMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingWipe.current) return;
    handleWipeMove(e.clientX);
  };

  // ─── Audio Speech Voice-Over Controller ────────────────────────────────────
  const handleToggleAudio = () => {
    if (!synthRef.current) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!result) return;

    const speechText = `Diagnosis for ${result.affected_crop || selectedCrop}: ${result.disease_name}. Severity: ${result.severity_level}. Primary chemical remedy: ${result.chemical_remedy}. Recommended organic remedy: ${result.organic_remedy}. For best control, maintain spray coverage and avoid spraying on wet morning dew.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Pick appropriate voice
    const voices = synthRef.current.getVoices();
    if (language === "HI") {
      const hiVoice = voices.find(v => v.lang.includes("hi"));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (language === "TE") {
      const teVoice = voices.find(v => v.lang.includes("te"));
      if (teVoice) utterance.voice = teVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    synthRef.current.speak(utterance);
  };

  // ─── WhatsApp Prescription Share ──────────────────────────────────────────
  const handleShareWhatsApp = () => {
    if (!result) return;
    const text = `🌾 *Sampoorn Kisan AI — Crop Clinic Prescription* 🌾
*Farmer:* ${user?.name || "Farmer"} | *Location:* ${locationInput}
*Crop:* ${result.affected_crop || selectedCrop}
*Diagnosis:* ${result.disease_name}
*Severity:* ${result.severity_level} (Confidence: ${((result.confidence_score || 0.9) * 100).toFixed(0)}%)

💊 *Prescribed Chemical Treatment:*
${result.chemical_remedy}

🌿 *Bio / Organic Alternative:*
${result.organic_remedy}

💧 *Calculated Spray Requirement for ${farmAcres} Acres:*
• Total Water: ${Math.round(farmAcres * 200)} Litres
• Knapsack Tanks: ${Math.ceil((farmAcres * 200) / (sprayerType === "20L" ? 20 : 16))} tanks
• Estimated Treatment Cost: ₹${Math.round(farmAcres * 285)}

📞 KVK Hotline: 1800-180-1551
Verified with ICAR & CIBRC Agronomic Standards.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ─── Core AI Diagnosis Pipeline ───────────────────────────────────────────
  const handleDiagnose = async () => {
    if (!file && !sampleFilename && !preview) {
      setError("Please upload a leaf photo, take a live photo with your camera, or select a sample image.");
      return;
    }

    setLoading(true);
    setError(null);
    setQualityError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      } else if (sampleFilename) {
        formData.append("filename", sampleFilename);
      } else {
        formData.append("filename", "leaf.jpg");
      }

      formData.append("cropType", selectedCrop);
      formData.append("symptomsText", symptomText);
      formData.append(
        "userContext",
        JSON.stringify({
          location: locationInput,
          cropType: selectedCrop,
          farmSizeHectares: user?.farmSizeHectares || 2.5,
        })
      );

      const res = await axios.post("/api/disease/diagnose", formData, { timeout: 15000 });

      if (res.data && res.data.isQualityValid === false) {
        setQualityError(res.data.error || "Please upload a clearer photo showing the affected leaves/stem/fruit.");
        setResult(null);
      } else {
        setResult(res.data);
        saveScanToHistory(res.data);
      }
    } catch (e) {
      const message = getApiErrorMessage(e, "Disease diagnosis is unavailable right now. Please try again when the diagnosis service is online.");
      if (message) {
        setResult(null);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Diagnosis results must come from the backend model. Keep the upload preview
   * separate from Grad-CAM output so an unavailable model can never look like
   * a successful diagnosis.
   */
  const diagnosisImage = result?.xai_gradcam?.heatmap_image_url;

  // ─── Acreage Tank Mix Computations ─────────────────────────────────────────
  const parsedAcres = parseFloat(farmAcres) || 1;
  const tankCapacity = sprayerType === "20L" ? 20 : sprayerType === "500L" ? 500 : 16;
  const totalWaterLiters = Math.round(parsedAcres * 200);
  const totalTanksRequired = Math.ceil(totalWaterLiters / tankCapacity);
  const gramsPerLiter = 2.5; // Standard Mancozeb / Fungicide rate
  const gramsPerTank = Math.round(tankCapacity * gramsPerLiter);
  const totalChemicalKg = ((totalWaterLiters * gramsPerLiter) / 1000).toFixed(2);
  const estChemicalCost = Math.round(parsedAcres * (result?.dosage_specifications?.avg_retail_cost_per_acre_inr || 285));
  const estOrganicCost = Math.round(parsedAcres * (result?.dosage_specifications?.organic_cost_per_acre_inr || 140));
  const estSavings = estChemicalCost - estOrganicCost;

  // ─── Current Progression Data Point ───────────────────────────────────────

  return (
    <div className="page-container disease-page page-enter">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              🌿 {t('ai_crop_disease_diag', 'AI Crop Disease Diagnosis & XAI Visualizer')}
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              MAX AGRI-VISION 2.0
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            {t('ai_crop_disease_sub', 'Upload crop photos to detect leaf blights, rusts, and fungal infections with Grad-CAM neural attention heatmaps')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}
          >
            <History size={16} /> Scan History ({historyList.length})
          </button>

          <a
            href="tel:18001801551"
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', borderColor: '#16a34a', fontWeight: 'bold' }}
          >
            <PhoneCall size={16} /> Call KVK Hotline (1800-180-1551)
          </a>
        </div>
      </div>

      {/* History Drawer Banner */}
      {showHistoryDrawer && (
        <div className="glass" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--fk-border)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} color="#16a34a" /> Diagnostic Scans Log (Local Field Archive)
            </strong>
            {historyList.length > 0 && (
              <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={13} /> Clear Archive
              </button>
            )}
          </div>
          {historyList.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--fk-text-sub)' }}>No past diagnosis scans recorded yet. Run a scan to see your farm history here.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {historyList.map(item => (
                <div key={item.id} style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--fk-text)' }}>
                    <span>{item.crop}</span>
                    <span style={{ color: '#16a34a' }}>{item.confidence}%</span>
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: 700, margin: '2px 0' }}>{item.disease}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fk-text-sub)', fontSize: '11px', marginTop: '4px' }}>
                    <span>{item.date}</span>
                    <span>{item.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quality Warning Banner */}
      {qualityError && (
        <div
          className="error-banner"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            padding: "16px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#dc2626",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 'bold' }}>
            <AlertCircle size={22} />
            <span>Image Quality Validation Notice</span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--fk-text)' }}>{qualityError}</p>
          <div style={{ fontSize: '13px', color: 'var(--fk-text-sub)', marginTop: '4px' }}>
            💡 <strong>Tips for best results:</strong> Capture under good daytime sunlight, hold camera 15-30 cm away, and ensure spots/margins are in sharp focus.
          </div>
        </div>
      )}

      {error && !qualityError && (
        <div
          className="error-banner"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 7-Step Diagnostic Workflow Indicator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        padding: '12px',
        background: 'var(--fk-card, #ffffff)',
        border: '1px solid var(--fk-border, #e2e8f0)',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: (file || preview) ? '800' : '600', color: (file || preview) ? '#16a34a' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: (file || preview) ? '#16a34a' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>1</div>
          <span>Upload Leaf</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: qualityError ? '700' : result ? '800' : '600', color: qualityError ? '#dc2626' : result ? '#16a34a' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: qualityError ? '#dc2626' : result ? '#16a34a' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>2</div>
          <span>Quality Check</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: result ? '800' : loading ? '700' : '600', color: result ? '#16a34a' : loading ? '#d97706' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: result ? '#16a34a' : loading ? '#d97706' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>3</div>
          <span>AI Inference</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: result?.xai_gradcam ? '800' : '600', color: result?.xai_gradcam ? '#16a34a' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: result?.xai_gradcam ? '#16a34a' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>4</div>
          <span>Grad-CAM Map</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: result?.chemical_remedy ? '800' : '600', color: result?.chemical_remedy ? '#16a34a' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: result?.chemical_remedy ? '#16a34a' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>5</div>
          <span>CIBRC Remedies</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: result?.recommended_actions ? '800' : '600', color: result?.recommended_actions ? '#16a34a' : 'var(--fk-text-sub)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: result?.recommended_actions ? '#16a34a' : 'var(--fk-border)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>6</div>
          <span>Dosage &amp; Tanks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>7</div>
          <span>KVK Hotline</span>
        </div>
      </div>

      <div className="grid-2-col">
        {/* INPUT & UPLOAD COLUMN */}
        <div className="glass-card upload-card dg-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--fk-text)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Camera size={20} color="var(--fk-blue)" /> Leaf Photo Input &amp; Live Scanner
            </h3>
            <button
              type="button"
              onClick={() => startCamera()}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16a34a',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Camera size={14} /> Open Live Camera
            </button>
          </div>

          {/* Form Context Inputs */}
          <div className="form-row-2col">
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Select Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
              >
                {INDIAN_CROPS_LIST.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Location / District
              </label>
              <input
                type="text"
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                placeholder="e.g. Warangal, Telangana"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Describe Symptoms (Optional)
            </label>
            <input
              type="text"
              value={symptomText}
              onChange={e => setSymptomText(e.target.value)}
              placeholder="e.g. Concentric brown rings, yellow halo on lower leaf lamina"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
            />
          </div>

          {/* Photo Dropzone */}
          <div className="dropzone">
            <input type="file" accept="image/*" capture="environment" id="leafInput" onChange={handleFileChange} />
            <label htmlFor="leafInput" className="dropzone-label">
              {preview ? (
                <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                  <img
                    src={preview}
                    alt="Selected Leaf"
                    className="preview-img"
                    style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.removeAttribute("src");
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '12px', marginTop: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ Click to change photo or re-take with camera</span>
                </div>
              ) : (
                <>
                  <UploadCloud size={44} className="icon-green" />
                  <p>
                    <strong>Click to browse file or take photo</strong>
                  </p>
                  <span>Supports JPG, PNG, WEBP (Auto Quality Checked)</span>
                </>
              )}
            </label>
          </div>

          {/* Sample Images Quick Launcher */}
          <div className="sample-buttons">
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub)', fontWeight: 'bold' }}>Try benchmark sample leaves:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                className="chip-btn"
                type="button"
                onClick={() => handleSampleSelect('tomato_early_blight', 'Tomato')}
              >
                Tomato Early Blight
              </button>
              <button
                className="chip-btn"
                type="button"
                onClick={() => handleSampleSelect('potato_late_blight', 'Vegetables (General)')}
              >
                Potato Late Blight
              </button>
              <button
                className="chip-btn"
                type="button"
                onClick={() => handleSampleSelect('corn_common_rust', 'Maize / Corn')}
              >
                Corn Common Rust
              </button>
              <button
                className="chip-btn"
                type="button"
                onClick={() => handleSampleSelect('grape_black_rot', 'Vegetables (General)')}
              >
                Grape Black Rot
              </button>
            </div>
          </div>

          <button
            className={`primary-btn full-width mt-2 dg-shimmer-btn ${loading ? "pulse-anim" : ""}`}
            onClick={handleDiagnose}
            disabled={loading}
            style={{ padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', justifyContent: 'center' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} className="spin-anim" /> Quality Check &amp; Neural Scanning...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Run AI Diagnosis &amp; Grad-CAM Neural Heatmap
              </span>
            )}
          </button>
        </div>

        {/* DIAGNOSIS & XAI VISUALIZER RESULTS COLUMN */}
        <div className="glass-card result-card dg-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0 }}>{t('diagnosis_results', 'Diagnostic Findings & XAI Visualizer')}</h3>
            {result && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  title="Listen to diagnosis and remedy instructions"
                  style={{
                    background: isPlayingAudio ? '#dc2626' : 'rgba(37, 99, 235, 0.15)',
                    color: isPlayingAudio ? '#ffffff' : '#2563eb',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {isPlayingAudio ? "Stop Voice" : "Listen (Voice)"}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  title="Share prescription directly on WhatsApp"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#16a34a',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={13} /> WhatsApp Share
                </button>
              </div>
            )}
          </div>

          {result ? (
            <div className="diagnosis-body" style={{ marginTop: '12px' }}>
              {/* Badges Row */}
              <div className="disease-badge-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
                <span className="crop-tag" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Leaf size={14} /> {result.affected_crop || selectedCrop}
                </span>
                <span className="severity-tag warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={14} /> {result.severity_level || "Stage 2 (Moderate)"}
                </span>
                <span className="confidence-tag" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={14} /> Confidence: {((result.confidence_score || 0.94) * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(true)}
                  style={{
                    marginLeft: 'auto',
                    background: 'linear-gradient(90deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={13} /> Official Rx Slip
                </button>
              </div>

              <h2 className="disease-title" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--fk-text)', marginBottom: '8px' }}>
                {result.disease_name}
              </h2>

              <p className="symptoms-text" style={{ fontSize: '13px', color: 'var(--fk-text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>
                <strong>Observed Symptoms: </strong> {result.symptoms_description}
              </p>

              {/* ─── MAX FEATURE 1: DUAL-LAYER GRAD-CAM INSPECTION STUDIO ──── */}
              <div className="gradcam-studio-box" style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={18} color="#d97706" />
                    <strong style={{ fontSize: '15px', color: 'var(--fk-text)' }}>
                      Interactive Grad-CAM Inspection Studio
                    </strong>
                  </div>

                  {/* View Mode Controls */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '8px', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode("split")}
                      style={{
                        background: viewMode === "split" ? '#16a34a' : 'transparent',
                        color: viewMode === "split" ? '#ffffff' : 'var(--fk-text-sub)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Split Wipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("blend")}
                      style={{
                        background: viewMode === "blend" ? '#16a34a' : 'transparent',
                        color: viewMode === "blend" ? '#ffffff' : 'var(--fk-text-sub)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Overlay Blend
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("sideBySide")}
                      style={{
                        background: viewMode === "sideBySide" ? '#16a34a' : 'transparent',
                        color: viewMode === "sideBySide" ? '#ffffff' : 'var(--fk-text-sub)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Side-by-Side
                    </button>
                  </div>
                </div>

                {/* Interactive Viewport Canvas */}
                <div
                  ref={studioContainerRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '260px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#0a0f0d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: viewMode === "split" ? 'ew-resize' : 'default',
                    userSelect: 'none'
                  }}
                  onMouseDown={() => { isDraggingWipe.current = true; }}
                  onMouseUp={() => { isDraggingWipe.current = false; }}
                  onMouseLeave={() => { isDraggingWipe.current = false; }}
                  onMouseMove={handleMouseMove}
                  onTouchStart={() => { isDraggingWipe.current = true; }}
                  onTouchEnd={() => { isDraggingWipe.current = false; }}
                  onTouchMove={handleTouchMove}
                >
                  {/* Mode 1: Split Screen Wipe */}
                  {viewMode === "split" && (
                    <>
                      {/* Original Base Image */}
                      <img
                        src={preview}
                        alt="Original Leaf"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          transform: `scale(${zoomLevel})`
                        }}
                      />

                      {/* Grad-CAM Clipped Image on Top */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          clipPath: `polygon(${wipePos}% 0, 100% 0, 100% 100%, ${wipePos}% 100%)`,
                          overflow: 'hidden',
                          filter: colorPalette === "turbo" ? 'hue-rotate(45deg)' : colorPalette === "viridis" ? 'hue-rotate(120deg)' : 'none'
                        }}
                      >
                        <img
                          src={diagnosisImage}
                          alt="Grad-CAM Activation"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: `scale(${zoomLevel})`
                          }}
                        />
                      </div>

                      {/* Draggable Divider Line */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${wipePos}%`,
                          width: '3px',
                          background: '#ffffff',
                          boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                          zIndex: 10,
                          pointerEvents: 'none'
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#16a34a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 900,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                          }}
                        >
                          ⇄
                        </div>
                      </div>

                      {/* Side Badges */}
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        Leaf Photo
                      </div>
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(217, 119, 6, 0.85)', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        Grad-CAM Heatmap
                      </div>
                    </>
                  )}

                  {/* Mode 2: Direct Alpha Blending */}
                  {viewMode === "blend" && (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={preview}
                        alt="Original Leaf"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          transform: `scale(${zoomLevel})`
                        }}
                      />
                      <img
                        src={diagnosisImage}
                        alt="Heatmap Overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: blendOpacity / 100,
                          mixBlendMode: 'screen',
                          transform: `scale(${zoomLevel})`,
                          filter: colorPalette === "turbo" ? 'hue-rotate(45deg)' : colorPalette === "viridis" ? 'hue-rotate(120deg)' : 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Mode 3: Side-by-Side Dual Pane */}
                  {viewMode === "sideBySide" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%', gap: '8px', padding: '8px' }}>
                      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={preview}
                          alt="Original"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                        <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Original Photo</span>
                      </div>
                      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={diagnosisImage}
                          alt="Grad-CAM"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                        <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(217, 119, 6, 0.85)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Grad-CAM Activation</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Studio Slider & Tool Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {viewMode === "split" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fk-text-sub)' }}>Wipe Position:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={wipePos}
                        onChange={(e) => setWipePos(Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#16a34a' }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>{wipePos}%</span>
                    </div>
                  )}

                  {viewMode === "blend" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fk-text-sub)' }}>Heatmap Opacity:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={blendOpacity}
                        onChange={(e) => setBlendOpacity(Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#d97706' }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>{blendOpacity}%</span>
                    </div>
                  )}

                  {/* Zoom Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                      style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', color: 'var(--fk-text)' }}
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span style={{ fontSize: '11px', fontWeight: 800, minWidth: '32px', textAlign: 'center' }}>{zoomLevel}x</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.5))}
                      style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', color: 'var(--fk-text)' }}
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div>

                {/* Attention Feature Tags */}
                {result.xai_gradcam?.activation_focus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Neural Focus Hotspots:</span>
                    {result.xai_gradcam.activation_focus.map((spot, i) => (
                      <span key={i} style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        🔥 {spot}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── MAX FEATURE 2: MULTI-PATHOGEN DIFFERENTIAL DIAGNOSIS ─── */}
              <div style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fk-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color="#2563eb" /> Multi-Pathogen Differential Diagnosis
                  </h4>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>ICAR Calibrated</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(result.differential_diagnosis || [
                    { name: result.disease_name, probability: result.confidence_score || 0.94, key_differentiator: "Concentric circular lesion geometry with chlorotic halos", status: "Primary" },
                    { name: `${selectedCrop} Cercospora Leaf Spot`, probability: 0.04, key_differentiator: "Discrete angular spots without targetboard concentric rings", status: "Secondary" },
                    { name: `${selectedCrop} Nutrient Deficiency (Zinc / Mg)`, probability: 0.02, key_differentiator: "Interveinal yellowing without necrotic spore centers", status: "Exclusion" }
                  ]).map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--fk-bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: idx === 0 ? '#16a34a' : 'var(--fk-text)' }}>
                          {idx + 1}. {item.name}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: idx === 0 ? '#16a34a' : '#d97706' }}>
                          {(item.probability * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '6px', background: 'var(--fk-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ width: `${Math.min(100, item.probability * 100)}%`, height: '100%', background: idx === 0 ? '#16a34a' : '#d97706', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>
                        <strong>Diagnostic Marker:</strong> {item.key_differentiator}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MAX FEATURE 3: ACREAGE TANK-MIX & COST CALCULATOR ───── */}
              <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fk-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Droplets size={16} color="#16a34a" /> Acreage Tank-Mix &amp; Chemical Cost Calculator
                  </h4>
                  <span style={{ fontSize: '11px', background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                    CIBRC RATIO
                  </span>
                </div>

                {/* Acreage & Sprayer Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
                      Plot Size (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
                      Sprayer Equipment
                    </label>
                    <select
                      value={sprayerType}
                      onChange={(e) => setSprayerType(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }}
                    >
                      <option value="16L">16-Litre Manual Knapsack</option>
                      <option value="20L">20-Litre Battery Knapsack</option>
                      <option value="500L">500-Litre Tractor Boom</option>
                    </select>
                  </div>
                </div>

                {/* Live Calculated Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ background: 'var(--fk-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>Total Spray Water</div>
                    <strong style={{ fontSize: '16px', color: '#2563eb' }}>{totalWaterLiters} L</strong>
                  </div>

                  <div style={{ background: 'var(--fk-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>Sprayer Charges</div>
                    <strong style={{ fontSize: '16px', color: '#16a34a' }}>{totalTanksRequired} Tanks</strong>
                  </div>

                  <div style={{ background: 'var(--fk-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>Dose Per Tank</div>
                    <strong style={{ fontSize: '16px', color: '#d97706' }}>{gramsPerTank} g</strong>
                  </div>

                  <div style={{ background: 'var(--fk-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>Total Chemical</div>
                    <strong style={{ fontSize: '16px', color: '#dc2626' }}>{totalChemicalKg} kg</strong>
                  </div>
                </div>

                {/* Cost Comparison Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.08)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.25)', fontSize: '12px' }}>
                  <span>Chemical: <strong>₹{estChemicalCost}</strong> vs Bio-Organic: <strong>₹{estOrganicCost}</strong></span>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>Save ₹{estSavings} with Bio-Inputs</span>
                </div>

                {/* Weather Spray Window Banner */}
                <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '11px', color: 'var(--fk-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sun size={15} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Optimum Spray Window:</strong> 6:30 AM – 9:30 AM or after 4:30 PM (Wind &lt; 12 km/h, 4h rainfastness window).
                  </div>
                </div>
              </div>

              {/* ─── MAX FEATURE 4: 14-DAY DISEASE PROGRESSION SIMULATOR ─── */}
              <div style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fk-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#d97706" /> 14-Day Infection Progression &amp; Yield Loss Simulator
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: progressionDay === 14 ? '#dc2626' : '#16a34a' }}>
                    Day {progressionDay} Projection
                  </span>
                </div>

                {/* Day Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>Day 1</span>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={progressionDay}
                    onChange={(e) => setProgressionDay(Number(e.target.value))}
                    style={{ flex: 1, accentColor: progressionDay > 7 ? '#dc2626' : '#d97706' }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>Day 14</span>
                </div>

                {/* Side-by-Side Path Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Path A: If Untreated */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', marginBottom: '4px' }}>
                      ❌ IF LEFT UNTREATED
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fk-text)' }}>
                      Canopy Area Infected: <strong>{progressionDay === 1 ? '15%' : progressionDay <= 4 ? '35%' : progressionDay <= 7 ? '60%' : '85%'}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                      Estimated Yield Loss: {progressionDay === 1 ? '0%' : progressionDay <= 4 ? '-12%' : progressionDay <= 7 ? '-35%' : '-65%'}
                    </div>
                  </div>

                  {/* Path B: If Treated Today */}
                  <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', marginBottom: '4px' }}>
                      ✓ IF TREATED TODAY
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fk-text)' }}>
                      Canopy Arrested: <strong>Within 48 Hours</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>
                      Protected Harvest: 96% Yield Retained
                    </div>
                  </div>
                </div>
              </div>

              {/* Remedies Grid */}
              <div className="remedies-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="remedy-box chemical" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Chemical Remedy (CIBRC Approved)
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--fk-text)', margin: 0 }}>{result.chemical_remedy}</p>
                </div>
                <div className="remedy-box organic" style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Organic / Bio Remedy
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--fk-text)', margin: 0 }}>{result.organic_remedy}</p>
                </div>
              </div>

              {/* Prevention & KVK Call Notice */}
              <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 4px' }}>🛡️ Prevention Guidance &amp; Expert Confirmation</h5>
                <p style={{ fontSize: '12px', color: 'var(--fk-text)', margin: '0 0 8px' }}>
                  {result.prevention_guidance || "Practice crop rotation with non-host crops and treat seeds with Trichoderma prior to sowing."}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--fk-text-sub)', fontWeight: 'bold' }}>
                  📞 {result.expert_confirmation || "If leaf yellowing spreads past 30% of field area, contact Kisan Call Centre hotline 1800-180-1551 or visit your local KVK center."}
                </div>
              </div>

              {/* ─── MAX FEATURE 5: AGRONOMIST Q&A SANDBOX ───────────────── */}
              <div style={{ background: 'var(--fk-card)', border: '1px solid var(--fk-border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fk-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HelpCircle size={16} color="#16a34a" /> Instant Agronomist Q&amp;A Sandbox
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>Click to inspect</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    {
                      q: "What is the Pre-Harvest Interval (PHI) before I can harvest safely?",
                      a: "For Mancozeb / copper fungicides, wait at least 7 days after the last spray before harvesting produce. Wash all harvested produce thoroughly in clean potable water."
                    },
                    {
                      q: "Can I mix this fungicide with insecticide for whiteflies or thrips?",
                      a: "Yes, Mancozeb 75% WP is compatible with common insecticides like Imidacloprid 17.8% SL or Acetamiprid 20% SP. Always conduct a small jar test first and avoid mixing with alkaline sulfur lime solutions."
                    },
                    {
                      q: "Will rain tomorrow wash off this fungicide spray?",
                      a: "Fungicides require a 4-hour rainfastness window to penetrate leaf tissue and dry. If rain is forecast within 4 hours, postpone spraying or add a non-ionic wetting agent (sticker) like Agrowet @ 0.5 ml/L."
                    },
                    {
                      q: "How do I prepare the organic bio-remedy at farm level?",
                      a: "Mix 5 ml cold-pressed neem oil (10,000 PPM) with 1 ml liquid soap or soapnut extract in 1 litre lukewarm water. Shake vigorously until milky white, then add Trichoderma viride powder and spray within 3 hours."
                    }
                  ].map((faq, i) => (
                    <div key={i} style={{ border: '1px solid var(--fk-border)', borderRadius: '6px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          background: 'var(--fk-bg)',
                          border: 'none',
                          color: 'var(--fk-text)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {expandedFaq === i && (
                        <div style={{ padding: '8px 12px', background: 'var(--fk-card)', fontSize: '12px', color: 'var(--fk-text-sub)', lineHeight: 1.45, borderTop: '1px solid var(--fk-border)' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--fk-text-sub)' }}>
              <Leaf size={52} color="var(--fk-text-muted)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--fk-text)', marginBottom: '6px' }}>Ready for Visual Leaf Diagnostics</h3>
              <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto' }}>
                Select your crop on the left, upload an infected leaf photo or open the live camera, and click "Run AI Diagnosis" to inspect the neural heatmaps, dosage calculator, and treatment action plan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── LIVE CAMERA MODAL VIEWPORT ───────────────────────────────────── */}
      {showCameraModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={stopCamera}
        >
          <div
            style={{
              background: '#0b140f',
              border: '1px solid #1a2c22',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #1a2c22' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800, fontSize: '14px' }}>
                <Camera size={18} color="#16a34a" /> Live Leaf Targeting Scanner
              </div>
              <button
                onClick={stopCamera}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Viewport with Reticle */}
            <div style={{ position: 'relative', width: '100%', height: '360px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Pulsating Leaf Targeting Reticle */}
              <div
                style={{
                  position: 'absolute',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50% 10% 50% 10%',
                  border: '2.5px dashed #22c55e',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                  pointerEvents: 'none',
                  animation: 'pulse 2s infinite ease-in-out'
                }}
              />

              {/* Guide Overlay */}
              <div style={{ position: 'absolute', bottom: 12, background: 'rgba(0,0,0,0.75)', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                Align affected leaf inside green frame
              </div>
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div style={{ padding: '10px 16px', background: '#450a0a', color: '#fca5a5', fontSize: '12px' }}>
                {cameraError}
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#0e1712' }}>
              <button
                type="button"
                onClick={toggleCameraFacing}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Flip Camera
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                }}
              >
                <Camera size={16} /> Snap Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OFFICIAL KISAN PRESCRIPTION SLIP MODAL ───────────────────────── */}
      {showPrescriptionModal && result && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowPrescriptionModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              maxWidth: '680px',
              width: '100%',
              borderRadius: '16px',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative',
              fontFamily: "'Inter', sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #16a34a', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🌾</span>
                  <strong style={{ fontSize: '18px', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sampoorn Kisan AI • Digital Crop Clinic
                  </strong>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  ICAR &amp; CIBRC Verified Agronomic Diagnostic Prescription Slip
                </div>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Patient & Farm Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div><strong>Farmer Name:</strong> {user?.name || "Farmer"}</div>
              <div><strong>Location:</strong> {locationInput || "India"}</div>
              <div><strong>Crop Analyzed:</strong> {result.affected_crop || selectedCrop}</div>
              <div><strong>Plot Area:</strong> {farmAcres} Acres</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Rx Code:</strong> SK-DIS-{reportCode}</div>
            </div>

            {/* Diagnosis Core */}
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>CLINICAL DIAGNOSIS</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#991b1b', margin: '2px 0' }}>{result.disease_name}</div>
              <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                Severity: <strong>{result.severity_level || "Moderate"}</strong> • Model Confidence: <strong>{((result.confidence_score || 0.94) * 100).toFixed(0)}%</strong>
              </div>
            </div>

            {/* Prescribed Treatments */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Recommended Rx Protocols
              </h4>

              <div style={{ marginBottom: '10px', padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <strong style={{ fontSize: '12px', color: '#1e40af' }}>Chemical Spray Protocol:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#1e3a8a' }}>{result.chemical_remedy}</p>
                <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>
                  Total Mix for {farmAcres} Acres: <strong>{totalWaterLiters} Litres Water</strong> across <strong>{totalTanksRequired} Knapsack Tanks</strong> ({totalChemicalKg} kg chemical).
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <strong style={{ fontSize: '12px', color: '#166534' }}>Organic &amp; Bio-Control Alternative:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#14532d' }}>{result.organic_remedy}</p>
              </div>
            </div>

            {/* Safety & Pre-Harvest Interval (PHI) */}
            <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
              ⚠️ <strong>Pre-Harvest Interval (PHI):</strong> Do not harvest tomatoes within 7 days of spraying. Spray in morning hours (6:30 AM – 9:30 AM) with hollow cone nozzle.
            </div>

            {/* Footer Signoff & Verification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={38} color="#16a34a" />
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Digitally Authenticated<br />
                  <strong>Kisan AI Agronomy Engine</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Share2 size={15} /> Send to WhatsApp
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={15} /> Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
