import React, { useState } from "react";
import { 
  Volume2, VolumeX, RotateCcw, X, Info, Sparkles, CheckCircle2, AlertCircle, Globe, Sliders 
} from "lucide-react";
import { useVoiceGuidance, VERNACULAR_VOICE_CONFIG } from "../context/VoiceGuidanceContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * GlobalVoiceControlBar — Global header control & active speech subtitle bar.
 * Ensures farmers always have visibility and control over spoken instructions.
 */
export function GlobalVoiceHeaderButton() {
  const { voiceEnabled, toggleVoiceGuidance, isSpeaking, stopSpeaking, hasNativeVoice, activeVoiceName } = useVoiceGuidance();
  const { language, setLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const langCfg = VERNACULAR_VOICE_CONFIG[language] || VERNACULAR_VOICE_CONFIG.EN;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setShowMenu(v => !v)}
        className="icon-button"
        aria-label="Voice Guidance settings"
        title={`Voice Guidance: ${voiceEnabled ? "Enabled" : "Disabled"} (${langCfg.nativeName})`}
        style={{
          position: "relative",
          background: isSpeaking ? "rgba(220, 38, 38, 0.12)" : (voiceEnabled ? "rgba(0, 105, 72, 0.1)" : "transparent"),
          color: isSpeaking ? "#dc2626" : (voiceEnabled ? "#006948" : "inherit"),
          border: isSpeaking ? "1.5px solid #dc2626" : "1px solid transparent"
        }}
      >
        {isSpeaking ? (
          <Volume2 size={19} style={{ animation: "pulse 1s infinite" }} />
        ) : (
          voiceEnabled ? <Volume2 size={19} /> : <VolumeX size={19} style={{ opacity: 0.5 }} />
        )}
        {voiceEnabled && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: isSpeaking ? "#dc2626" : "#16a34a",
              boxShadow: isSpeaking ? "0 0 6px #dc2626" : "none"
            }}
          />
        )}
      </button>

      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{ position: "fixed", inset: 0, zIndex: 998 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "290px",
              background: "var(--fk-card, #ffffff)",
              border: "1px solid var(--fk-border, #e2e8f0)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              padding: "16px",
              zIndex: 999,
              animation: "fadeIn 0.15s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Volume2 size={18} style={{ color: "#006948" }} />
                <strong style={{ fontSize: "14px", color: "var(--fk-text, #0f172a)" }}>
                  {t("voice_guidance", "Voice Guidance")}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Toggle switch */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                background: "var(--fk-bg, #f8fafc)",
                borderRadius: "8px",
                marginBottom: "12px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                {voiceEnabled ? t("Voice is ON", "Voice is ON") : t("Voice is OFF", "Voice is OFF")}
              </span>
              <button
                type="button"
                onClick={toggleVoiceGuidance}
                style={{
                  padding: "4px 10px",
                  borderRadius: "14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "none",
                  background: voiceEnabled ? "#006948" : "#94a3b8",
                  color: "#ffffff"
                }}
              >
                {voiceEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            {/* Voice Engine Diagnostics */}
            <div style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)", lineHeight: "1.4", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <Globe size={13} style={{ color: "#006948" }} />
                <span>Language: <strong>{langCfg.nativeName} ({langCfg.name})</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {hasNativeVoice ? (
                  <CheckCircle2 size={13} style={{ color: "#16a34a" }} />
                ) : (
                  <Info size={13} style={{ color: "#d97706" }} />
                )}
                <span>
                  {hasNativeVoice
                    ? `Native Voice Active (${activeVoiceName})`
                    : `Phonetic Guidance + On-Screen Text (Native voice not installed on OS)`}
                </span>
              </div>
            </div>

            {isSpeaking && (
              <button
                type="button"
                onClick={() => { stopSpeaking(); setShowMenu(false); }}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #ef4444",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <VolumeX size={15} />
                <span>Stop Current Voice</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function FloatingVoiceSubtitleBar() {
  const { 
    isSpeaking, speakingText, speakingTitle, stopSpeaking, replayLast, 
    voiceSupportNotice, hasNativeVoice 
  } = useVoiceGuidance();
  const { language } = useLanguage();

  if (!isSpeaking && !speakingText) return null;

  const langCfg = VERNACULAR_VOICE_CONFIG[language] || VERNACULAR_VOICE_CONFIG.EN;

  return (
    <aside
      aria-label="Spoken Voice Guidance Subtitles"
      className="floating-voice-bar"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(94vw, 760px)",
        background: "rgba(15, 23, 42, 0.94)",
        backdropFilter: "blur(12px)",
        color: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
        border: "1.5px solid rgba(0, 105, 72, 0.4)",
        padding: "12px 18px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        {/* Left: Speaker icon & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(0, 105, 72, 0.3)",
              border: "1px solid #10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Volume2 size={16} style={{ color: "#34d399", animation: "pulse 1s infinite" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#34d399" }}>
                {speakingTitle || "Voice Guidance"}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.15)",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}
              >
                {langCfg.nativeName}
              </span>
              {!hasNativeVoice && language !== "EN" && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#fbbf24",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}
                >
                  On-Screen Text
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Audio Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={replayLast}
            title="Replay Spoken Instructions"
            aria-label="Replay Spoken Instructions"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#ffffff",
              padding: "6px",
              borderRadius: "50%",
              cursor: "pointer"
            }}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={stopSpeaking}
            title="Stop Speech"
            aria-label="Stop Speech"
            style={{
              background: "#ef4444",
              border: "none",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <VolumeX size={14} />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Spoken subtitle text (accessible visible text alongside speech) */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "13px",
          lineHeight: "1.45",
          color: "#f1f5f9",
          maxHeight: "90px",
          overflowY: "auto"
        }}
      >
        {speakingText}
      </div>

      {voiceSupportNotice && (
        <div style={{ fontSize: "11px", color: "#fbbf24", opacity: 0.9 }}>
          ℹ️ {voiceSupportNotice.message}
        </div>
      )}
    </aside>
  );
}
