import React from "react";
import { Volume2, VolumeX, Globe, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const VOICE_LANGUAGES = [
  { code: "EN", name: "English", native: "English" },
  { code: "HI", name: "Hindi", native: "हिन्दी" },
  { code: "TE", name: "Telugu", native: "తెలుగు" },
  { code: "TA", name: "Tamil", native: "தமிழ்" },
  { code: "KN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "MR", name: "Marathi", native: "मराठी" },
  { code: "PA", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "BN", name: "Bengali", native: "বাংলা" },
  { code: "GU", name: "Gujarati", native: "ગુજરાતી" }
];

export default function StepVoiceGuidanceBar({
  stepNumber,
  totalSteps = 9,
  stepTitle = "",
  guidanceMap,
  isSpeaking = false,
  onPlay,
  onStop,
  style = {}
}) {
  const { language, setLanguage, t } = useLanguage();

  const currentGuidance = guidanceMap?.[stepNumber]?.[language] || guidanceMap?.[stepNumber]?.EN;

  const handleToggleVoice = () => {
    if (isSpeaking) {
      if (typeof onStop === "function") onStop();
    } else {
      if (typeof onPlay === "function") {
        onPlay(language);
      }
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (isSpeaking) {
      if (typeof onStop === "function") onStop();
      setTimeout(() => {
        if (typeof onPlay === "function") onPlay(newLang);
      }, 120);
    }
  };

  return (
    <div
      className="step-voice-guidance-bar"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "linear-gradient(135deg, rgba(0, 105, 72, 0.08) 0%, rgba(13, 148, 136, 0.06) 50%, rgba(37, 99, 235, 0.05) 100%)",
        border: isSpeaking ? "1.5px solid rgba(0, 105, 72, 0.4)" : "1px solid rgba(0, 105, 72, 0.2)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: isSpeaking ? "0 4px 14px rgba(0, 105, 72, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.25s ease",
        marginBottom: "14px",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        {/* Left: Icon & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px", flex: "1 1 auto" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: isSpeaking ? "#fee2e2" : "rgba(0, 105, 72, 0.12)",
              color: isSpeaking ? "#dc2626" : "#006948",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: isSpeaking ? "0 0 0 3px rgba(220, 38, 38, 0.2)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {isSpeaking ? (
              <span style={{ fontSize: "15px", animation: "pulse 1s infinite" }}>🔊</span>
            ) : (
              <Volume2 size={17} />
            )}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "750", color: "#006948", lineHeight: "1.25" }}>
              {t("Listen to voice instructions for this step", "Listen to voice instructions for this step")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "500", marginTop: "2px" }}>
              {stepTitle ? `${t("Step")} ${stepNumber}: ${t(stepTitle, stepTitle)}` : `${t("Step")} ${stepNumber} ${t("of")} ${totalSteps}`}
            </div>
          </div>
        </div>

        {/* Right: Language Switcher & Play Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {/* Quick Voice Language Dropdown */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "#ffffff",
              border: "1px solid rgba(0, 105, 72, 0.3)",
              borderRadius: "16px",
              padding: "3px 8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
            title={t("Select voice language", "Select voice language")}
          >
            <Globe size={13} style={{ color: "#006948", flexShrink: 0 }} />
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label={t("Voice Language", "Voice Language")}
              style={{
                border: "none",
                background: "transparent",
                color: "#006948",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                outline: "none",
                padding: "2px 0"
              }}
            >
              {VOICE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Spoken Action Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isSpeaking ? t("Stop Voice Assistance", "Stop Voice Assistance") : t("Listen to Step Guidance", "Listen to Step Guidance")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "18px",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer",
              border: isSpeaking ? "1.5px solid #dc2626" : "1.5px solid #006948",
              background: isSpeaking ? "#fee2e2" : "#006948",
              color: isSpeaking ? "#b91c1c" : "#ffffff",
              boxShadow: isSpeaking ? "0 2px 8px rgba(220, 38, 38, 0.25)" : "0 2px 8px rgba(0, 105, 72, 0.25)",
              transition: "all 0.18s ease"
            }}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isSpeaking ? t("Stop", "Stop") : t("Listen to Voice", "Listen")}</span>
          </button>
        </div>
      </div>

      {/* When speaking: Subtitle strip showing the vocalized text and language */}
      {isSpeaking && currentGuidance && (
        <div
          style={{
            marginTop: "4px",
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(0, 105, 72, 0.25)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#0f5132",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease"
          }}
        >
          <Sparkles size={14} style={{ color: "#006948", flexShrink: 0 }} />
          <div style={{ flex: 1, lineHeight: "1.35" }}>
            <span style={{ fontWeight: "700", marginRight: "6px", color: "#006948" }}>
              [{VOICE_LANGUAGES.find(l => l.code === language)?.native || language}]:
            </span>
            <span>{currentGuidance.native}</span>
          </div>
        </div>
      )}
    </div>
  );
}
