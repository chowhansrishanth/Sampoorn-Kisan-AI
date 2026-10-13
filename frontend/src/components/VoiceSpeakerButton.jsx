import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useVoiceGuidance } from "../context/VoiceGuidanceContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * VoiceSpeakerButton — Accessible, mobile-friendly spoken explanation button.
 * Can be embedded into any farmer-facing section, card, form, header, or alert.
 */
export default function VoiceSpeakerButton({
  sectionId,
  title = "Section Guidance",
  text = "",
  te = "",
  hi = "",
  ta = "",
  kn = "",
  mr = "",
  pa = "",
  bn = "",
  gu = "",
  phonetic = "",
  data = null,
  size = "md", // "sm", "md", "lg"
  variant = "chip", // "chip", "icon", "ghost", "primary"
  showLabel = true,
  style = {},
  className = ""
}) {
  const { isSpeaking, speakingSectionId, speakSection, stopSpeaking, voiceEnabled } = useVoiceGuidance();
  const { language, t } = useLanguage();

  const isCurrentSpeaking = isSpeaking && speakingSectionId === sectionId;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentSpeaking) {
      stopSpeaking();
    } else {
      speakSection({
        id: sectionId,
        title,
        text,
        te,
        hi,
        ta,
        kn,
        mr,
        pa,
        bn,
        gu,
        phonetic,
        data
      });
    }
  };

  const getLabelText = () => {
    if (isCurrentSpeaking) {
      if (language === "TE") return "ఆపు";
      if (language === "HI") return "रोकें";
      return "Stop";
    }
    if (language === "TE") return "వినండి";
    if (language === "HI") return "सुनें";
    return t("voice_listen", "Listen");
  };

  // Sizing definitions
  const sizeMap = {
    sm: { padding: "4px 8px", fontSize: "11px", iconSize: 13, minHeight: "28px" },
    md: { padding: "6px 12px", fontSize: "12.5px", iconSize: 15, minHeight: "34px" },
    lg: { padding: "8px 16px", fontSize: "14px", iconSize: 18, minHeight: "42px" }
  };
  const currentSize = sizeMap[size] || sizeMap.md;

  // Base styling per variant
  const getVariantStyles = () => {
    if (isCurrentSpeaking) {
      return {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1.5px solid #ef4444",
        boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.25)"
      };
    }

    switch (variant) {
      case "primary":
        return {
          background: "#006948",
          color: "#ffffff",
          border: "1px solid #006948",
          boxShadow: "0 2px 6px rgba(0, 105, 72, 0.25)"
        };
      case "ghost":
        return {
          background: "transparent",
          color: "var(--fk-primary, #006948)",
          border: "1px solid transparent",
          boxShadow: "none"
        };
      case "icon":
        return {
          background: "rgba(0, 105, 72, 0.08)",
          color: "#006948",
          border: "1px solid rgba(0, 105, 72, 0.2)",
          borderRadius: "50%",
          padding: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        };
      case "chip":
      default:
        return {
          background: "rgba(0, 105, 72, 0.08)",
          color: "#006948",
          border: "1px solid rgba(0, 105, 72, 0.25)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        };
    }
  };

  const accessibleTitle = isCurrentSpeaking
    ? `Stop voice instructions for ${title}`
    : `Listen to voice explanation for ${title}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={accessibleTitle}
      title={accessibleTitle}
      className={`voice-speaker-btn ${isCurrentSpeaking ? "is-speaking" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        borderRadius: variant === "icon" ? "50%" : "20px",
        padding: variant === "icon" ? "7px" : currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        outline: "none",
        flexShrink: 0,
        minHeight: currentSize.minHeight,
        userSelect: "none",
        ...getVariantStyles(),
        ...style
      }}
    >
      {isCurrentSpeaking ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
          <VolumeX size={currentSize.iconSize} />
          <span style={{ fontSize: "10px", animation: "pulse 1s infinite" }}>●</span>
        </span>
      ) : (
        <Volume2 size={currentSize.iconSize} />
      )}
      {showLabel && variant !== "icon" && (
        <span style={{ whiteSpace: "nowrap" }}>{getLabelText()}</span>
      )}
    </button>
  );
}
