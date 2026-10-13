/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { lookupTranslation, translateCompoundText } from "../data/multilingualDictionary";

const VoiceGuidanceContext = createContext();

const VOICE_PREF_KEY = "sampoorn_voice_guidance_enabled";
const AUTO_SPEAK_KEY = "sampoorn_voice_auto_speak";

// Vernacular language locale definitions with voice matching keywords
export const VERNACULAR_VOICE_CONFIG = {
  EN: {
    code: "en-IN",
    name: "English (India)",
    nativeName: "English",
    langPrefix: "en",
    keywords: ["en-in", "india", "english", "david", "zira", "george", "mark"]
  },
  HI: {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिंदी",
    langPrefix: "hi",
    keywords: ["hi-in", "hindi", "हिन्दी", "swara", "kalpana", "madhur", "hemant"]
  },
  TE: {
    code: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    langPrefix: "te",
    keywords: ["te-in", "telugu", "తెలుగు", "mohan", "shruti", "chitra"]
  },
  TA: {
    code: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    langPrefix: "ta",
    keywords: ["ta-in", "tamil", "தமிழ்", "pallavi", "valluvar"]
  },
  KN: {
    code: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    langPrefix: "kn",
    keywords: ["kn-in", "kannada", "ಕನ್ನಡ", "gagan", "sapna"]
  },
  MR: {
    code: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
    langPrefix: "mr",
    keywords: ["mr-in", "marathi", "मराठी", "aarohi", "manohar"]
  },
  PA: {
    code: "pa-IN",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    langPrefix: "pa",
    keywords: ["pa-in", "punjabi", "ਪੰਜਾਬੀ", "raavi", "gurpreet"]
  },
  BN: {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
    langPrefix: "bn",
    keywords: ["bn-in", "bengali", "বাংলা", "bashkar", "tanishaa"]
  },
  GU: {
    code: "gu-IN",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    langPrefix: "gu",
    keywords: ["gu-in", "gujarati", "ગુજરાતી", "dhwani", "niranjan"]
  }
};

export function VoiceGuidanceProvider({ children }) {
  const { language } = useLanguage();

  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(VOICE_PREF_KEY);
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [autoSpeak, setAutoSpeak] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_SPEAK_KEY);
      return saved === "true"; // default off per requirement 14
    } catch {
      return false;
    }
  });

  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const [speakingTitle, setSpeakingTitle] = useState("");
  const [speakingSectionId, setSpeakingSectionId] = useState(null);
  const [voiceSupportNotice, setVoiceSupportNotice] = useState(null);
  const [lastSpokenPayload, setLastSpokenPayload] = useState(null);

  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const activeUtteranceRef = useRef(null);

  // Load system speech synthesis voices
  useEffect(() => {
    if (!synthRef.current) return;

    const updateVoices = () => {
      try {
        const v = synthRef.current.getVoices();
        if (Array.isArray(v) && v.length > 0) {
          setAvailableVoices(v);
        }
      } catch (e) {
        console.warn("Could not query voices:", e);
      }
    };

    updateVoices();
    synthRef.current.onvoiceschanged = updateVoices;

    return () => {
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, []);

  // Inspect if current target language has native Indic voice installed in browser
  const inspectLanguageVoiceSupport = useCallback((targetLang = language) => {
    const norm = String(targetLang || "EN").toUpperCase();
    const cfg = VERNACULAR_VOICE_CONFIG[norm] || VERNACULAR_VOICE_CONFIG.EN;

    if (!availableVoices || availableVoices.length === 0) {
      return {
        hasNativeVoice: false,
        voice: null,
        voiceName: "System Default",
        isSupported: Boolean(synthRef.current),
        status: "pending_voices"
      };
    }

    // 1. Direct match on exact locale code (e.g. "te-IN", "hi-IN")
    let matched = availableVoices.find(v => v.lang && v.lang.toLowerCase() === cfg.code.toLowerCase());
    if (matched) {
      return { hasNativeVoice: true, voice: matched, voiceName: matched.name, status: "native_voice" };
    }

    // 2. Direct match on lang prefix (e.g. starts with "te", "hi")
    matched = availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith(cfg.langPrefix));
    if (matched) {
      return { hasNativeVoice: true, voice: matched, voiceName: matched.name, status: "native_prefix" };
    }

    // 3. Keyword match in voice name
    matched = availableVoices.find(v => {
      const vName = (v.name || "").toLowerCase();
      const vLang = (v.lang || "").toLowerCase();
      return (cfg.keywords || []).some(k => vName.includes(k) || vLang.includes(k));
    });
    if (matched) {
      return { hasNativeVoice: true, voice: matched, voiceName: matched.name, status: "native_keyword" };
    }

    if (norm === "EN") {
      const enVoice = availableVoices.find(v => v.lang && (v.lang.toLowerCase() === "en-in" || v.lang.toLowerCase().startsWith("en"))) || availableVoices[0];
      return { hasNativeVoice: true, voice: enVoice, voiceName: enVoice?.name || "English", status: "native_en" };
    }

    // For non-English when native voice is missing:
    // Fall back to Indian English voice for phonetic articulation, clearly flagged!
    const indianEnglish = availableVoices.find(v =>
      (v.lang && v.lang.toLowerCase() === "en-in") ||
      (v.name || "").toLowerCase().includes("india") ||
      (v.name || "").toLowerCase().includes("heera") ||
      (v.name || "").toLowerCase().includes("neerja")
    ) || availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith("en")) || availableVoices[0];

    return {
      hasNativeVoice: false,
      voice: indianEnglish,
      voiceName: indianEnglish?.name || "Fallback Voice",
      status: "phonetic_fallback"
    };
  }, [availableVoices, language]);

  // Stop any active speech immediately
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (_) {}
    }
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
    setSpeakingText("");
    setSpeakingTitle("");
    setSpeakingSectionId(null);
    setVoiceSupportNotice(null);
  }, []);

  // Global toggle
  const toggleVoiceGuidance = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_PREF_KEY, String(next));
      } catch (_) {}
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(prev => {
      const next = !prev;
      try {
        localStorage.setItem(AUTO_SPEAK_KEY, String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  /**
   * Speak a specific farmer-facing section.
   * 
   * @param {object} params
   *  - id: section identifier
   *  - title: section title
   *  - text: base English explanation
   *  - te, hi, ta, kn, mr, pa, bn, gu: vernacular translations
   *  - phonetic: phonetic representation when native voice is missing
   *  - data: dynamic values to interpolate
   */
  const speakSection = useCallback((payload) => {
    if (!synthRef.current) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    // Cancel any previous speech immediately so voices NEVER overlap
    stopSpeaking();

    if (!payload) return;
    setLastSpokenPayload(payload);

    const activeLang = String(language || "EN").toUpperCase();
    const voiceInspection = inspectLanguageVoiceSupport(activeLang);

    // Resolve the text to vocalize
    let vernacularText = payload[activeLang.toLowerCase()] || payload[activeLang];

    if (!vernacularText) {
      // Auto-lookup in multilingual agricultural dictionary
      const translated = lookupTranslation(payload.text, activeLang);
      if (translated && translated !== payload.text) {
        vernacularText = translated;
      } else {
        const compound = translateCompoundText(payload.text, activeLang);
        vernacularText = (compound && compound !== payload.text) ? compound : payload.text;
      }
    }

    // Determine vocalization string:
    // If native voice is installed: vocalize native script!
    // If native voice is missing: vocalize phonetic guide (if available) or English,
    // and display exact vernacular script on screen with clear fallback label.
    let audioStringToVocalize = vernacularText;

    if (!voiceInspection.hasNativeVoice && activeLang !== "EN") {
      if (payload.phonetic) {
        audioStringToVocalize = payload.phonetic;
      }
      setVoiceSupportNotice({
        lang: activeLang,
        langName: VERNACULAR_VOICE_CONFIG[activeLang]?.nativeName || activeLang,
        message: `Native ${VERNACULAR_VOICE_CONFIG[activeLang]?.name || activeLang} voice is not installed on this browser. On-screen text is displayed below for full accessibility.`
      });
    } else {
      setVoiceSupportNotice(null);
    }

    // Sanitize string for synthesis: remove asterisks, links, hash symbols
    const cleanSpoken = String(audioStringToVocalize || "")
      .replace(/[*#_`>~]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[₹]/g, "rupees ")
      .trim();

    if (!cleanSpoken) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanSpoken);

      if (voiceInspection.voice) {
        utterance.voice = voiceInspection.voice;
        utterance.lang = voiceInspection.hasNativeVoice
          ? (voiceInspection.voice.lang || VERNACULAR_VOICE_CONFIG[activeLang]?.code || "en-IN")
          : (voiceInspection.voice.lang || "en-IN");
      } else {
        utterance.lang = VERNACULAR_VOICE_CONFIG[activeLang]?.code || "en-IN";
      }

      utterance.rate = 0.92; // Slightly measured rate for crystal-clear comprehension
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingText(vernacularText || cleanSpoken);
        setSpeakingTitle(payload.title || "Voice Guidance");
        setSpeakingSectionId(payload.id || null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingText("");
        setSpeakingTitle("");
        setSpeakingSectionId(null);
        setVoiceSupportNotice(null);
        activeUtteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        setIsSpeaking(false);
        setSpeakingText("");
        setSpeakingTitle("");
        setSpeakingSectionId(null);
        setVoiceSupportNotice(null);
        activeUtteranceRef.current = null;
      };

      activeUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn("Failed to speak section:", err);
      setIsSpeaking(false);
    }
  }, [language, inspectLanguageVoiceSupport, stopSpeaking]);

  const replayLast = useCallback(() => {
    if (lastSpokenPayload) {
      speakSection(lastSpokenPayload);
    }
  }, [lastSpokenPayload, speakSection]);

  const voiceInspection = inspectLanguageVoiceSupport(language);

  return (
    <VoiceGuidanceContext.Provider
      value={{
        voiceEnabled,
        autoSpeak,
        toggleVoiceGuidance,
        toggleAutoSpeak,
        isSpeaking,
        speakingText,
        speakingTitle,
        speakingSectionId,
        voiceSupportNotice,
        hasNativeVoice: voiceInspection.hasNativeVoice,
        activeVoiceName: voiceInspection.voiceName,
        availableVoices,
        speakSection,
        stopSpeaking,
        replayLast,
        inspectLanguageVoiceSupport
      }}
    >
      {children}
    </VoiceGuidanceContext.Provider>
  );
}

export function useVoiceGuidance() {
  const context = useContext(VoiceGuidanceContext);
  if (!context) {
    throw new Error("useVoiceGuidance must be used within a VoiceGuidanceProvider");
  }
  return context;
}
