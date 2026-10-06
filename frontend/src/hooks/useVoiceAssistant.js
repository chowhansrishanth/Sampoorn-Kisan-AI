import { useState, useRef, useEffect, useCallback } from "react";

export const VERNACULAR_LOCALES = {
  EN: { code: "en-IN", names: ["en-in", "india", "english"], langPrefix: "en", name: "English (India)" },
  HI: { code: "hi-IN", names: ["hi-in", "hindi", "हिन्दी", "swara", "kalpana", "madhur", "hemant"], langPrefix: "hi", name: "हिन्दी (Hindi)" },
  TE: { code: "te-IN", names: ["te-in", "telugu", "తెలుగు", "mohan", "shruti", "chitra"], langPrefix: "te", name: "తెలుగు (Telugu)" },
  TA: { code: "ta-IN", names: ["ta-in", "tamil", "தமிழ்", "pallavi", "valluvar"], langPrefix: "ta", name: "தமிழ் (Tamil)" },
  KN: { code: "kn-IN", names: ["kn-in", "kannada", "ಕನ್ನಡ", "gagan", "sapna"], langPrefix: "kn", name: "ಕನ್ನಡ (Kannada)" },
  MR: { code: "mr-IN", names: ["mr-in", "marathi", "मराठी", "aarohi", "manohar"], langPrefix: "mr", name: "मराठी (Marathi)" },
  PA: { code: "pa-IN", names: ["pa-in", "punjabi", "ਪੰਜਾਬੀ", "raavi", "gurpreet"], langPrefix: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  BN: { code: "bn-IN", names: ["bn-in", "bengali", "বাংলা", "bashkar", "tanishaa"], langPrefix: "bn", name: "বাংলা (Bengali)" },
  GU: { code: "gu-IN", names: ["gu-in", "gujarati", "ગુજરાતી", "dhwani", "niranjan"], langPrefix: "gu", name: "ગુજરાતી (Gujarati)" },
};

/**
 * Universal Vernacular Voice Assistant Hook
 * Supports SpeechRecognition (STT) and SpeechSynthesis (TTS) across Indian Languages
 * with automatic Indic voice matching and phonetic vernacular fallback.
 */
export default function useVoiceAssistant(defaultLang = "EN", onTranscriptComplete) {
  const [lang, setLang] = useState(defaultLang);
  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);

  const isSttSupported = typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const isTtsSupported = typeof window !== "undefined" && Boolean(window.speechSynthesis);

  // Keep internal lang state strictly synced with defaultLang prop
  useEffect(() => {
    if (defaultLang && defaultLang !== lang) {
      setLang(defaultLang);
    }
  }, [defaultLang]);

  // Load available system & browser TTS voices (handling asynchronous onvoiceschanged in Chromium)
  useEffect(() => {
    if (!synthRef.current) return;

    const populateVoices = () => {
      try {
        const v = synthRef.current.getVoices();
        if (v && v.length > 0) {
          setVoices(v);
        }
      } catch (err) {
        console.warn("Could not retrieve synthesis voices:", err);
      }
    };

    populateVoices();
    synthRef.current.onvoiceschanged = populateVoices;

    return () => {
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize SpeechRecognition (STT)
  useEffect(() => {
    if (!isSttSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = VERNACULAR_LOCALES[lang]?.code || "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let currentInterim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(currentInterim);
      if (finalTranscript) {
        setTranscript(finalTranscript);
        if (typeof onTranscriptComplete === "function") {
          onTranscriptComplete(finalTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn("SpeechRecognition error:", event.error);
      if (event.error !== "no-speech") {
        setError(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch { /* Speech engine stopped */ }
    };
  }, [lang, isSttSupported, onTranscriptComplete]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    try {
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current.lang = VERNACULAR_LOCALES[lang]?.code || "en-IN";
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Error starting speech recognition:", e);
    }
  }, [lang]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch { /* Speech engine stopped */ }
  }, []);

  // Intelligent Voice Selector
  const getTargetVoice = useCallback((allVoices, targetLangCode) => {
    if (!allVoices || allVoices.length === 0) return { voice: null, isNativeIndic: false };

    const cfg = VERNACULAR_LOCALES[targetLangCode] || VERNACULAR_LOCALES.EN;

    // 1. Direct match on exact locale code (e.g. "te-IN", "hi-IN", "ta-IN")
    let matched = allVoices.find(v => v.lang && v.lang.toLowerCase() === cfg.code.toLowerCase());
    if (matched) return { voice: matched, isNativeIndic: true };

    // 2. Direct match on language prefix (e.g. starts with "te", "hi", "ta")
    matched = allVoices.find(v => v.lang && v.lang.toLowerCase().startsWith(cfg.langPrefix));
    if (matched) return { voice: matched, isNativeIndic: true };

    // 3. Match on voice name containing regional keywords (e.g., "Telugu", "Hindi", "Mohan", "Swara")
    matched = allVoices.find(v => {
      const vName = (v.name || "").toLowerCase();
      const vLang = (v.lang || "").toLowerCase();
      return (cfg.names || []).some(n => vName.includes(n) || vLang.includes(n));
    });
    if (matched) return { voice: matched, isNativeIndic: true };

    // If English was requested:
    if (targetLangCode === "EN") {
      const enIn = allVoices.find(v => v.lang && v.lang.toLowerCase() === "en-in" || (v.name || "").toLowerCase().includes("india"));
      if (enIn) return { voice: enIn, isNativeIndic: true };
      const en = allVoices.find(v => v.lang && v.lang.toLowerCase().startsWith("en"));
      if (en) return { voice: en, isNativeIndic: true };
      return { voice: allVoices[0], isNativeIndic: true };
    }

    // Target is non-English, but device lacks a native Indic voice for this language.
    // Pick an Indian English or default voice that can articulate the phonetic vernacular!
    const indianVoice = allVoices.find(v =>
      (v.lang && v.lang.toLowerCase() === "en-in") ||
      (v.name || "").toLowerCase().includes("india") ||
      (v.name || "").toLowerCase().includes("heera") ||
      (v.name || "").toLowerCase().includes("neerja") ||
      (v.name || "").toLowerCase().includes("prabhat")
    );
    if (indianVoice) return { voice: indianVoice, isNativeIndic: false };

    // Fallback to any English or primary voice
    const fallbackVoice = allVoices.find(v => v.lang && v.lang.toLowerCase().startsWith("en")) || allVoices[0];
    return { voice: fallbackVoice, isNativeIndic: false };
  }, []);

  // Text-to-Speech (TTS)
  const speak = useCallback(
    (text, targetLang = null, phoneticFallback = null) => {
      if (!synthRef.current || !text) return;

      const activeLang = targetLang || lang || "EN";

      try {
        synthRef.current.cancel(); // cancel any ongoing speech
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }

        const currentVoices = voices.length > 0 ? voices : (synthRef.current.getVoices() || []);
        const { voice: chosenVoice, isNativeIndic } = getTargetVoice(currentVoices, activeLang);

        // Decide text to vocalize:
        // - If client device has native Indic voice: speak pure native script (e.g. Telugu/Hindi/Tamil Unicode).
        // - If client device lacks native Indic voice (standard PC): speak phonetic vernacular so farmer understands every word clearly!
        let textToSpeak = text;
        if (!isNativeIndic && activeLang !== "EN" && phoneticFallback) {
          textToSpeak = phoneticFallback;
        }

        // Strip markdown asterisks, hashes, brackets, links, currency symbols
        const cleanText = textToSpeak
          .replace(/[*#_`>~]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/https?:\/\/\S+/g, "")
          .replace(/[₹]/g, "rupees ")
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang || (isNativeIndic ? (VERNACULAR_LOCALES[activeLang]?.code || "en-IN") : "en-IN");
        } else {
          utterance.lang = isNativeIndic ? (VERNACULAR_LOCALES[activeLang]?.code || "en-IN") : "en-IN";
        }

        utterance.rate = 0.92; // Slightly measured rate for crystal-clear agricultural comprehension
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeakingText(cleanText);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingText("");
        };

        utterance.onerror = (e) => {
          console.warn("Speech synthesis notice:", e);
          setIsSpeaking(false);
          setSpeakingText("");
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [lang, voices, getTargetVoice]
  );

  // Stop TTS
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingText("");
    }
  }, []);

  return {
    lang,
    setLang,
    voices,
    supportedLanguages: VERNACULAR_LOCALES,
    isSttSupported,
    isTtsSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speakingText,
    speak,
    stopSpeaking,
    error,
  };
}
