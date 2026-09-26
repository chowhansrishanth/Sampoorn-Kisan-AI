import { useState, useRef, useEffect, useCallback } from "react";

const VERNACULAR_LOCALES = {
  EN: { code: "en-IN", name: "English (India)" },
  HI: { code: "hi-IN", name: "हिन्दी (Hindi)" },
  TE: { code: "te-IN", name: "తెలుగు (Telugu)" },
  PA: { code: "pa-IN", name: "ਪੰਜਾਬੀ (Punjabi)" },
  TA: { code: "ta-IN", name: "தமிழ் (Tamil)" },
  KN: { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
  MR: { code: "mr-IN", name: "मराठी (Marathi)" },
};

/**
 * Universal Vernacular Voice Assistant Hook
 * Supports SpeechRecognition (STT) and SpeechSynthesis (TTS) across Indian Languages
 */
export default function useVoiceAssistant(defaultLang = "EN", onTranscriptComplete) {
  const [lang, setLang] = useState(defaultLang);
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

  // Initialize SpeechRecognition
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
      } catch { /* Speech engine may already be stopped. */ }
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
    } catch { /* Speech engine may already be stopped. */ }
  }, []);

  // Text-to-Speech (TTS)
  const speak = useCallback(
    (text, targetLang = lang) => {
      if (!synthRef.current || !text) return;

      try {
        synthRef.current.cancel(); // cancel any active speech

        // Strip markdown asterisks, hashes, and links for clean speech
        const cleanText = text
          .replace(/[*#_`>]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/https?:\/\/\S+/g, "")
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = VERNACULAR_LOCALES[targetLang]?.code || "en-IN";
        utterance.rate = 0.95; // Slightly slower for agricultural clarity
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeakingText(text);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingText("");
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeakingText("");
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [lang]
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
