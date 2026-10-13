import React, { useState } from "react";
import { 
  X, Calendar, Sprout, AlertCircle, CheckCircle2, Loader2, Sparkles, HelpCircle, Layers, Check 
} from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import VoiceSpeakerButton from "./VoiceSpeakerButton";

const POPULAR_CROPS = [
  { id: "cotton", name: "Bt Hybrid Cotton", key: "cotton", icon: "🌿", defaultDays: 155 },
  { id: "wheat", name: "Wheat (Gehun)", key: "wheat", icon: "🌾", defaultDays: 120 },
  { id: "paddy", name: "Paddy / Rice (Dhan)", key: "paddy", icon: "🌾", defaultDays: 130 },
  { id: "maize", name: "Hybrid Grain Maize (Makka)", key: "maize", icon: "🌽", defaultDays: 105 },
  { id: "groundnut", name: "Groundnut / Peanut (Moongphali)", key: "groundnut", icon: "🥜", defaultDays: 110 },
  { id: "chilli", name: "Hot Chilli (Mirchi)", key: "chilli", icon: "🌶️", defaultDays: 150 },
  { id: "tomato", name: "Tomato (Tamatar)", key: "tomato", icon: "🍅", defaultDays: 120 },
  { id: "soybean", name: "Soybean", key: "soybean", icon: "🫘", defaultDays: 100 },
  { id: "sugarcane", name: "Sugarcane (Ganna)", key: "sugarcane", icon: "🎋", defaultDays: 330 },
  { id: "potato", name: "Potato (Aloo)", key: "potato", icon: "🥔", defaultDays: 95 }
];

export default function NewCropCycleModal({ isOpen, onClose, onCycleCreated, initialCrop = null }) {
  const { language, t } = useLanguage();

  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedCrop, setSelectedCrop] = useState(initialCrop || POPULAR_CROPS[0]);
  const [plantingMode, setPlantingMode] = useState("today"); // "today", "past", "planned"
  const [customPlantingDate, setCustomPlantingDate] = useState(todayStr);
  const [landAcres, setLandAcres] = useState("2.5");
  const [variety, setVariety] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Resolve actual planting date string to send
  const resolvePlantingDate = () => {
    if (plantingMode === "today") return todayStr;
    return customPlantingDate || todayStr;
  };

  const isPlanned = plantingMode === "planned";

  const calculatePreviewDay = () => {
    const pDate = new Date(resolvePlantingDate());
    const today = new Date();
    const pUtc = Date.UTC(pDate.getUTCFullYear(), pDate.getUTCMonth(), pDate.getUTCDate());
    const rUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const diff = Math.round((rUtc - pUtc) / (1000 * 60 * 60 * 24));

    if (diff < 0 || isPlanned) {
      const daysUntil = Math.max(0, -diff);
      return {
        day: 0,
        badge: "Planned (Not Started)",
        desc: `Cycle has not started in real life. Starts at Day 0 on ${resolvePlantingDate()} (${daysUntil} day(s) from now).`
      };
    }
    if (diff === 0) {
      return {
        day: 0,
        badge: "Day 0 (Sowing Day)",
        desc: "Crop cycle initializes today at Day 0! Sowing and basal fertilization begin today."
      };
    }
    return {
      day: diff,
      badge: `Day ${diff} of Cycle`,
      desc: `Crop was planted ${diff} days ago. Progress continues from Day ${diff}.`
    };
  };

  const preview = calculatePreviewDay();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const dateToSend = resolvePlantingDate();
    if (!dateToSend) {
      setError("Please select a valid planting date.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cropName: selectedCrop.name,
        cropKey: selectedCrop.key,
        plantingDate: dateToSend,
        isPlanned,
        landAcres: parseFloat(landAcres) || 2.0,
        variety: variety.trim(),
        durationDays: selectedCrop.defaultDays,
        notes: notes.trim()
      };

      const res = await api.post("/api/crop-cycles", payload);

      if (res.data?.success && res.data?.cropCycle) {
        setSuccess(true);
        setTimeout(() => {
          if (onCycleCreated) onCycleCreated(res.data.cropCycle);
          onClose();
        }, 1000);
      } else {
        setError(res.data?.error || "Failed to create crop cycle.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to create crop cycle.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const spokenModalGuidance = {
    title: "Start New Crop Cycle Modal",
    text: "Select your crop and choose your planting date. If you are planting today, your cycle starts at Day 0. If you planted earlier, enter your actual planting date. If you plan to plant in the future, select a planned date and your cycle will start at Day 0 when that date arrives.",
    te: "మీ పంటను ఎంచుకోండి మరియు నాటిన తేదీని నమోదు చేయండి. మీరు ఈరోజు నాటితే, మీ పంట చక్రం డే 0 నుండి ప్రారంభమవుతుంది. మీరు ఇప్పటికే నాటి ఉంటే, అసలు తేదీని ఎంచుకోండి. భవిష్యత్తులో నాటాలని అనుకుంటే, ప్లాన్ చేసిన తేదీని ఎంచుకోండి, ఆ రోజున డే 0 ప్రారంభమవుతుంది.",
    hi: "अपनी फसल चुनें और बुवाई की तारीख दर्ज करें। यदि आप आज बुवाई कर रहे हैं, तो आपका फसल चक्र डे 0 से शुरू होगा। यदि आप पहले बुवाई कर चुके हैं, तो वास्तविक तारीख चुनें। यदि भविष्य में बुवाई की योजना है, तो नियोजित तारीख चुनें और उस तारीख को डे 0 शुरू होगा।"
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-labelledby="modal-crop-cycle-title"
        style={{
          background: "var(--fk-card, #ffffff)",
          borderRadius: "16px",
          width: "min(96vw, 580px)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          border: "1px solid var(--fk-border, #e2e8f0)",
          padding: "24px",
          position: "relative",
          animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(0, 105, 72, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px"
                }}
              >
                🌱
              </div>
              <h2 id="modal-crop-cycle-title" style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>
                {t("Start New Crop Cycle (Day 0)", "Start New Crop Cycle (Day 0)")}
              </h2>
            </div>
            <p style={{ margin: "4px 0 0 44px", fontSize: "12.5px", color: "var(--fk-text-sub, #64748b)" }}>
              {t("Every new crop cycle begins independently from Day 0.", "Every new crop cycle begins independently from Day 0.")}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <VoiceSpeakerButton
              sectionId="new_cycle_modal"
              title="New Crop Cycle Voice Guidance"
              text={spokenModalGuidance.text}
              te={spokenModalGuidance.te}
              hi={spokenModalGuidance.hi}
              size="sm"
              variant="chip"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "50%",
                color: "#64748b"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              background: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              padding: "12px 14px",
              background: "#dcfce7",
              border: "1px solid #22c55e",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "14px",
              fontWeight: "700",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <CheckCircle2 size={18} />
            <span>{t("Crop cycle initialized successfully from Day 0! 🌱", "Crop cycle initialized successfully from Day 0! 🌱")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 1. Crop Selection */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "8px", color: "var(--fk-text, #0f172a)" }}>
              {t("1. Select Crop", "1. Select Crop")} <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "8px",
                maxHeight: "150px",
                overflowY: "auto",
                padding: "4px"
              }}
            >
              {POPULAR_CROPS.map((c) => {
                const isSel = selectedCrop.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: isSel ? "2px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                      background: isSel ? "rgba(0, 105, 72, 0.08)" : "var(--fk-bg, #f8fafc)",
                      color: isSel ? "#006948" : "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "12.5px",
                      fontWeight: isSel ? "750" : "500"
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{c.icon}</span>
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                    {isSel && <Check size={14} style={{ color: "#006948" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Planting Timing / Mode */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "8px", color: "var(--fk-text, #0f172a)" }}>
              {t("2. Planting Status & Sowing Date", "2. Planting Status & Sowing Date")} <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => setPlantingMode("today")}
                style={{
                  padding: "10px 8px",
                  borderRadius: "8px",
                  border: plantingMode === "today" ? "2px solid #006948" : "1px solid var(--fk-border)",
                  background: plantingMode === "today" ? "rgba(0, 105, 72, 0.1)" : "transparent",
                  color: plantingMode === "today" ? "#006948" : "inherit",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <span>🌱 Planted Today</span>
                <small style={{ fontWeight: "400", opacity: 0.8 }}>Start at Day 0</small>
              </button>

              <button
                type="button"
                onClick={() => setPlantingMode("past")}
                style={{
                  padding: "10px 8px",
                  borderRadius: "8px",
                  border: plantingMode === "past" ? "2px solid #006948" : "1px solid var(--fk-border)",
                  background: plantingMode === "past" ? "rgba(0, 105, 72, 0.1)" : "transparent",
                  color: plantingMode === "past" ? "#006948" : "inherit",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <span>📅 Planted Earlier</span>
                <small style={{ fontWeight: "400", opacity: 0.8 }}>Actual Sowing Date</small>
              </button>

              <button
                type="button"
                onClick={() => setPlantingMode("planned")}
                style={{
                  padding: "10px 8px",
                  borderRadius: "8px",
                  border: plantingMode === "planned" ? "2px solid #006948" : "1px solid var(--fk-border)",
                  background: plantingMode === "planned" ? "rgba(0, 105, 72, 0.1)" : "transparent",
                  color: plantingMode === "planned" ? "#006948" : "inherit",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <span>⏳ Planning to Plant</span>
                <small style={{ fontWeight: "400", opacity: 0.8 }}>Planned Future Date</small>
              </button>
            </div>

            {/* Date Input if past or planned */}
            {plantingMode !== "today" && (
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                  {plantingMode === "past" ? "Select Actual Planting Date:" : "Select Planned Planting Date:"}
                </label>
                <input
                  type="date"
                  value={customPlantingDate}
                  max={plantingMode === "past" ? todayStr : undefined}
                  min={plantingMode === "planned" ? todayStr : undefined}
                  onChange={(e) => setCustomPlantingDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--fk-border)",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                />
              </div>
            )}

            {/* Live Day Preview Card */}
            <div
              style={{
                marginTop: "10px",
                padding: "10px 14px",
                background: isPlanned ? "rgba(245, 158, 11, 0.08)" : "rgba(0, 105, 72, 0.08)",
                border: isPlanned ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(0, 105, 72, 0.25)",
                borderRadius: "10px",
                fontSize: "12.5px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <Sparkles size={14} style={{ color: isPlanned ? "#d97706" : "#006948" }} />
                <strong style={{ color: isPlanned ? "#b45309" : "#006948" }}>{preview.badge}</strong>
              </div>
              <div style={{ color: "var(--fk-text-sub, #475569)", lineHeight: "1.4" }}>
                {preview.desc}
              </div>
            </div>
          </div>

          {/* 3. Field Size & Variety */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                {t("Land Area (Acres)", "Land Area (Acres)")}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={landAcres}
                onChange={(e) => setLandAcres(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--fk-border)",
                  fontSize: "14px"
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                {t("Seed Variety (Optional)", "Seed Variety (Optional)")}
              </label>
              <input
                type="text"
                placeholder="e.g. RCH 659, HD-2967"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--fk-border)",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid var(--fk-border)",
                background: "transparent",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {t("Cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#006948",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: "750",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0, 105, 72, 0.3)"
              }}
            >
              {submitting ? <Loader2 size={16} className="spinner" /> : <Sprout size={16} />}
              <span>{t("Initialize Crop Cycle (Day 0)", "Initialize Crop Cycle (Day 0)")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
