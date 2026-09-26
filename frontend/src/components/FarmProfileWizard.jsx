import { useState } from "react";
import { X, MapPin, Compass, ArrowRight, ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Sprout, Check, HelpCircle } from "lucide-react";
import SearchableCropSelector from "./ui/SearchableCropSelector";
import { LAND_SIZE_OPTIONS, FARM_TYPES, IRRIGATION_SOURCES, SOIL_TYPES, FARMING_SEASONS, FARM_GOALS, convertToAcres } from "../data/cropsData";
import { detectGPSLocation, parseManualLocation } from "../utils/locationHelper";

export default function FarmProfileWizard({ user, onClose, onSaveProfile }) {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Initial State from existing user or defaults
  const initialLocObj = user?.locationObj || {
    formattedAddress: typeof user?.location === "string" ? user.location : "Hyderabad, Telangana, India",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    accuracy: null
  };

  const [farmerName, setFarmerName] = useState(user?.name || "");
  const [locationInput, setLocationInput] = useState(initialLocObj.formattedAddress || "Hyderabad, Telangana, India");
  const [locationObj, setLocationObj] = useState(initialLocObj);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [accuracyMsg, setAccuracyMsg] = useState("");

  // Land & Farm Type
  const [landPreset, setLandPreset] = useState(user?.farmProfile?.landPreset || "3 to 5 Acres");
  const [customLandSize, setCustomLandSize] = useState(user?.farmProfile?.customLandSize || "4.5");
  const [landUnit, setLandUnit] = useState(user?.farmProfile?.landUnit || "Acres");
  const [farmType, setFarmType] = useState(user?.farmProfile?.farmType || "Medium Holding");

  // Crops
  const [crops, setCrops] = useState(user?.farmProfile?.crops || [
    { id: "rice", name: "Rice / Paddy", icon: "🌾", isPrimary: true, area: 3, stage: "Vegetative Growth" },
    { id: "cotton", name: "Cotton", icon: "🌿", isPrimary: false, area: 1.5, stage: "Flowering / Booting" }
  ]);

  // Irrigation & Soil
  const [irrigation, setIrrigation] = useState(user?.farmProfile?.irrigation || ["borewell", "drip"]);
  const [soilType, setSoilType] = useState(user?.farmProfile?.soilType || "black");
  const [showSoilHelp, setShowSoilHelp] = useState(false);

  // Season & Stage
  const [season, setSeason] = useState(user?.farmProfile?.season || "kharif");

  // Goals, Method & Livestock
  const [goals, setGoals] = useState(user?.farmProfile?.goals || ["increase_profit", "market_prices", "detect_disease"]);
  const [farmingMethod, setFarmingMethod] = useState(user?.farmProfile?.farmingMethod || "Conventional");
  const [hasLivestock, setHasLivestock] = useState(user?.farmProfile?.hasLivestock || false);
  const [livestockTypes, setLivestockTypes] = useState(user?.farmProfile?.livestockTypes || ["Cattle"]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  // Calculate Numeric Land Size in Acres
  const numericLandSizeAcres = () => {
    if (landPreset === "Custom Size") {
      return convertToAcres(parseFloat(customLandSize) || 0, landUnit);
    }
    if (landPreset === "Terrace / Urban Farming") return 0.25;
    if (landPreset === "Below 0.5 acre") return 0.4;
    if (landPreset === "0.5–1 acre") return 0.75;
    if (landPreset === "1–2 acres") return 1.5;
    if (landPreset === "2–3 acres") return 2.5;
    if (landPreset === "3–5 acres") return 4.0;
    if (landPreset === "5–10 acres") return 7.5;
    if (landPreset === "10–25 acres") return 17.5;
    if (landPreset === "25+ acres") return 30.0;
    return 3.0;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDetectGPS = async () => {
    setError("");
    setAccuracyMsg("");
    setDetectingGps(true);
    setGpsStatus("📍 Requesting GPS location permission...");

    try {
      setTimeout(() => setGpsStatus("🔄 Reverse-geocoding area & district..."), 1000);
      const res = await detectGPSLocation();

      if (res.success) {
        setLocationObj(res);
        setLocationInput(res.formattedAddress);
        if (res.accuracyWarning) {
          setAccuracyMsg(res.accuracyWarning);
        } else if (res.accuracy) {
          setAccuracyMsg(`GPS Accuracy: ±${Math.round(res.accuracy)} m`);
        }
      } else {
        setError(res.error || "📍 Unable to detect location.");
      }
    } catch {
      setError("📍 Failed to detect GPS location. Please enter manually.");
    } finally {
      setDetectingGps(false);
      setGpsStatus("");
    }
  };

  const toggleIrrigation = (id) => {
    if (irrigation.includes(id)) {
      setIrrigation(irrigation.filter(item => item !== id));
    } else {
      setIrrigation([...irrigation, id]);
    }
  };

  const toggleGoal = (id) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(item => item !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const toggleLivestock = (type) => {
    if (livestockTypes.includes(type)) {
      setLivestockTypes(livestockTypes.filter(t => t !== type));
    } else {
      setLivestockTypes([...livestockTypes, type]);
    }
  };

  const handleNextStep = async () => {
    setError("");
    if (step === 1) {
      if (!locationObj || locationObj.formattedAddress !== locationInput) {
        const parsed = await parseManualLocation(locationInput);
        if (parsed.success) {
          setLocationObj(parsed);
        } else {
          setError(parsed.error || "📍 Please enter a valid location in India.");
          return;
        }
      }
    }
    if (step < totalSteps) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleFinalSave = async () => {
    setError("");
    setSaving(true);

    let finalLoc = locationObj;
    if (!locationObj || locationObj.formattedAddress !== locationInput) {
      const parsed = await parseManualLocation(locationInput);
      if (parsed.success) {
        finalLoc = parsed;
      }
    }

    const calculatedAcres = numericLandSizeAcres();
    const primaryCropObj = crops.find(c => c.isPrimary) || crops[0] || { name: "Wheat & Rice" };

    const farmProfileObj = {
      location: {
        formattedAddress: finalLoc.formattedAddress || locationInput,
        district: finalLoc.district || "Hyderabad",
        state: finalLoc.state || "Telangana",
        country: "India",
        accuracy: finalLoc.accuracy || null
      },
      land: {
        preset: landPreset,
        customSize: customLandSize,
        unit: landUnit,
        sizeAcres: calculatedAcres,
        farmType
      },
      crops,
      primaryCrop: primaryCropObj.name,
      irrigation,
      soilType,
      season,
      farmingMethod,
      goals,
      hasLivestock,
      livestockTypes
    };

    const updatedUser = {
      ...user,
      name: farmerName.trim() || user?.name || "Farmer",
      location: finalLoc.formattedAddress || locationInput,
      locationObj: finalLoc,
      cropType: primaryCropObj.name,
      landSize: `${calculatedAcres} ${landUnit}`,
      farmProfile: farmProfileObj
    };

    try {
      if (onSaveProfile) {
        await onSaveProfile(updatedUser);
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch {
      setError("Failed to save farm profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progressPct = (step / totalSteps) * 100;

  return (
    <div className="modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", padding: "16px"
    }}>
      <div className="modal-card" style={{
        background: "var(--fk-card)", border: "1px solid var(--fk-border)",
        borderRadius: "8px", width: "100%", maxWidth: "640px",
        padding: "24px", boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
        position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(40, 116, 240, 0.15)", color: "#2874f0", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Sprout size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)" }}>🌾 My Farm Profile</h2>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>Step {step} of {totalSteps} — {
                step === 1 ? "Farm Location" :
                step === 2 ? "Land & Farm Type" :
                step === 3 ? "Select Crops & Growth Stages" :
                step === 4 ? "Water & Irrigation Availability" :
                step === 5 ? "Soil Type Identification" :
                step === 6 ? "Farming Season & Crop Stage" :
                step === 7 ? "Farm Goals & Method" : "Review Farm Summary"
              }</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--fk-text-sub)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "4px", background: "rgba(0,0,0,0.1)", borderRadius: "2px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "#2874f0", transition: "width 0.3s ease" }} />
        </div>

        {error && (
          <div style={{ background: "rgba(211, 47, 47, 0.12)", border: "1px solid #d32f2f", color: "#d32f2f", padding: "8px 12px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {savedSuccess && (
          <div style={{ background: "rgba(56, 142, 60, 0.15)", border: "1px solid #388e3c", color: "#388e3c", padding: "8px 12px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <CheckCircle2 size={16} /> Farm profile saved successfully! Context updated for Sahayak AI.
          </div>
        )}

        {/* Step Body Container */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px", marginBottom: "16px" }}>

          {/* STEP 1: FARM LOCATION */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "rgba(40, 116, 240, 0.04)", border: "1px solid rgba(40, 116, 240, 0.15)", borderRadius: "6px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#2874f0", textTransform: "uppercase" }}>
                    📍 Detect GPS Location
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={detectingGps}
                    style={{ background: "#2874f0", border: "none", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {detectingGps ? <Loader2 size={14} className="spin" /> : <Compass size={14} />}
                    {detectingGps ? "Detecting..." : "Detect Device Location"}
                  </button>
                </div>
                {detectingGps && gpsStatus && (
                  <div style={{ fontSize: "12px", color: "#2874f0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={12} className="spin" /> {gpsStatus}
                  </div>
                )}
                {accuracyMsg && (
                  <div style={{ fontSize: "11px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
                    📍 {accuracyMsg}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Farmer Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Farm Location (Village / Mandal, District, State, India)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", border: "1px solid var(--fk-border)", borderRadius: "4px", background: "var(--fk-card)" }}>
                  <MapPin size={18} color="#2874f0" />
                  <input
                    type="text"
                    placeholder="e.g. Kukatpally, Hyderabad, Telangana, India"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", background: "transparent", color: "var(--fk-text)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LAND & FARM TYPE */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Total Land Size
                </label>
                <select
                  value={landPreset}
                  onChange={e => setLandPreset(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  {LAND_SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {landPreset === "Custom Size" && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                      Exact Size Number
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={customLandSize}
                      onChange={e => setCustomLandSize(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                      Land Unit
                    </label>
                    <select
                      value={landUnit}
                      onChange={e => setLandUnit(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                    >
                      <option value="Acres">Acres</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Cents">Cents</option>
                      <option value="Guntas">Guntas</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Farm Holding Type
                </label>
                <select
                  value={farmType}
                  onChange={e => setFarmType(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  {FARM_TYPES.map(ft => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: CROPS SELECTION */}
          {step === 3 && (
            <div>
              <SearchableCropSelector
                selectedCrops={crops}
                onChange={setCrops}
                totalFarmArea={numericLandSizeAcres()}
                landUnit={landUnit}
              />
            </div>
          )}

          {/* STEP 4: WATER & IRRIGATION */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                Select All Irrigation & Water Sources
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {IRRIGATION_SOURCES.map(src => {
                  const isSelected = irrigation.includes(src.id);
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleIrrigation(src.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(40, 116, 240, 0.12)" : "var(--fk-card)",
                        color: "var(--fk-text)",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{src.icon}</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>{src.label}</span>
                      {isSelected && <Check size={16} color="#2874f0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: SOIL TYPE */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                  Select Soil Type
                </label>
                <button
                  type="button"
                  className="lg-text-btn"
                  style={{ fontSize: "12px" }}
                  onClick={() => setShowSoilHelp(!showSoilHelp)}
                >
                  <HelpCircle size={14} /> Help me identify my soil
                </button>
              </div>

              {showSoilHelp && (
                <div style={{ background: "rgba(40, 116, 240, 0.08)", border: "1px solid rgba(40, 116, 240, 0.25)", borderRadius: "6px", padding: "12px", fontSize: "12px", color: "var(--fk-text)" }}>
                  💡 <strong>Soil Identification Quick Guide:</strong>
                  <ul style={{ paddingLeft: "16px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li><strong>Black Soil:</strong> Sticky when wet, develops deep cracks in summer. High cotton suitability.</li>
                    <li><strong>Red Soil:</strong> Porous, reddish color due to iron content. Fast draining.</li>
                    <li><strong>Alluvial Soil:</strong> Found in river basins (Punjab, UP, AP). Soft, fertile silt.</li>
                    <li><strong>Sandy Soil:</strong> Loose grains, cannot hold water long. Warm.</li>
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {SOIL_TYPES.map(soil => {
                  const isSelected = soilType === soil.id;
                  return (
                    <button
                      key={soil.id}
                      type="button"
                      onClick={() => setSoilType(soil.id)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid #388e3c" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(56, 142, 60, 0.12)" : "var(--fk-card)",
                        color: "var(--fk-text)",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "14px" }}>{soil.label}</strong>
                        {isSelected && <Check size={16} color="#388e3c" />}
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>{soil.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: SEASON & CROP STAGE */}
          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Current Farming Season
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                  {FARMING_SEASONS.map(s => {
                    const isSelected = season === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeason(s.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: isSelected ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                          background: isSelected ? "rgba(40, 116, 240, 0.12)" : "var(--fk-card)",
                          color: "var(--fk-text)",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{s.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>{s.label}</span>
                        {isSelected && <Check size={16} color="#2874f0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crop Growth Summary */}
              {crops.length > 0 && (
                <div style={{ marginTop: "10px", background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "6px", padding: "12px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--fk-text)", display: "block", marginBottom: "8px" }}>
                    Selected Crops & Current Stages:
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {crops.map(c => (
                      <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span>{c.icon} <strong>{c.name}</strong></span>
                        <span style={{ color: "#2874f0", fontWeight: "600" }}>{c.stage || "Vegetative Growth"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: FARM GOALS & METHOD */}
          {step === 7 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  What do you want help with? (Select Goals)
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" }}>
                  {FARM_GOALS.map(g => {
                    const isSelected = goals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: isSelected ? "1px solid #388e3c" : "1px solid var(--fk-border)",
                          background: isSelected ? "rgba(56, 142, 60, 0.12)" : "var(--fk-card)",
                          color: "var(--fk-text)",
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        <span>{g.icon}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", flex: 1 }}>{g.label}</span>
                        {isSelected && <Check size={14} color="#388e3c" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Primary Farming Method
                </label>
                <select
                  value={farmingMethod}
                  onChange={e => setFarmingMethod(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", fontSize: "14px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  <option value="Conventional">Conventional Farming (Synthetic Fertilizers & Pesticides)</option>
                  <option value="Organic">Organic Farming (Bio-fertilizers & Natural Neem)</option>
                  <option value="Natural Farming">Zero Budget Natural Farming (ZBNF / Jeevamrut)</option>
                  <option value="Integrated Farming">Integrated Farming System (IFS)</option>
                  <option value="Precision Farming">Precision & High-Tech Hydroponics</option>
                  <option value="Mixed">Mixed / Traditional</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "var(--fk-text)" }}>
                  <input
                    type="checkbox"
                    checked={hasLivestock}
                    onChange={e => setHasLivestock(e.target.checked)}
                  />
                  <span>Do you also keep livestock on your farm?</span>
                </label>

                {hasLivestock && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                    {["Cattle", "Buffalo", "Goat", "Sheep", "Poultry", "Fish"].map(animal => {
                      const isSelected = livestockTypes.includes(animal);
                      return (
                        <button
                          key={animal}
                          type="button"
                          onClick={() => toggleLivestock(animal)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "16px",
                            border: isSelected ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                            background: isSelected ? "rgba(40, 116, 240, 0.12)" : "var(--fk-card)",
                            color: isSelected ? "#2874f0" : "var(--fk-text-sub)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {isSelected ? `✓ ${animal}` : animal}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW & SAVE SUMMARY */}
          {step === 8 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "var(--fk-card)",
                border: "1px solid var(--fk-border)",
                borderRadius: "8px",
                padding: "16px"
              }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sprout size={18} color="#2874f0" /> Farm Profile Summary
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "var(--fk-text)" }}>
                  <div>📍 <strong>Location:</strong> {locationInput}</div>
                  <div>📐 <strong>Land Size:</strong> {numericLandSizeAcres()} Acres ({landPreset})</div>
                  <div>🌾 <strong>Farm Type:</strong> {farmType}</div>
                  <div>💧 <strong>Irrigation:</strong> {irrigation.join(", ") || "Rainfed"}</div>
                  <div>🌍 <strong>Soil Type:</strong> {soilType.toUpperCase()}</div>
                  <div>📅 <strong>Season:</strong> {season.toUpperCase()}</div>
                  <div>🌿 <strong>Method:</strong> {farmingMethod}</div>
                  <div>🎯 <strong>Goals:</strong> {goals.length} Selected</div>
                </div>

                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--fk-border)" }}>
                  <strong style={{ fontSize: "13px", color: "var(--fk-text)", display: "block", marginBottom: "6px" }}>
                    Cultivated Crops ({crops.length}):
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {crops.map(c => (
                      <span
                        key={c.name}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          background: c.isPrimary ? "rgba(40, 116, 240, 0.15)" : "rgba(0,0,0,0.05)",
                          border: c.isPrimary ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                          color: "var(--fk-text)"
                        }}
                      >
                        {c.icon} {c.name} {c.isPrimary && "⭐ PRIMARY"} ({c.area || 0} {landUnit})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--fk-border)" }}>
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            style={{
              padding: "10px 16px",
              borderRadius: "4px",
              border: "1px solid var(--fk-border)",
              background: "var(--fk-card)",
              color: step === 1 ? "var(--fk-text-sub)" : "var(--fk-text)",
              fontWeight: "700",
              fontSize: "13px",
              cursor: step === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: step === 1 ? 0.5 : 1
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                padding: "10px 20px",
                borderRadius: "4px",
                border: "none",
                background: "#2874f0",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: "4px",
                border: "none",
                background: "#fb641b",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? "Saving Profile..." : "Save Farm Profile & Sync AI"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
