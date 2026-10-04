/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TRANSLATIONS } from "../translations";
import { domTranslator } from "../utils/domTranslator";
import { SUPPORTED_LANGUAGES, lookupTranslation, translateCompoundText } from "../data/multilingualDictionary";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "sampoorn_kisan_lang";

export function LanguageProvider({ children, initialUser }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const norm = String(saved).trim().toUpperCase();
        if (TRANSLATIONS[norm] || SUPPORTED_LANGUAGES[norm]) return norm;
      }
    } catch { void 0; }
    if (initialUser && initialUser.preferredLanguage) {
      const codeMap = {
        English: "EN",
        Telugu: "TE",
        Hindi: "HI",
        Tamil: "TA",
        Kannada: "KN",
        Marathi: "MR",
        Punjabi: "PA",
        Bengali: "BN",
        Gujarati: "GU"
      };
      if (codeMap[initialUser.preferredLanguage]) return codeMap[initialUser.preferredLanguage];
    }
    return "EN";
  });

  // Initialize DOM translator and sync with active language
  useEffect(() => {
    domTranslator.init(language);
    domTranslator.setLanguage(language);
  }, [language]);

  const setLanguage = useCallback((langCode) => {
    if (!langCode) return;
    const normalized = String(langCode).trim().toUpperCase();
    if (TRANSLATIONS[normalized] || SUPPORTED_LANGUAGES[normalized]) {
      setLanguageState(normalized);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, normalized);
      } catch { void 0; }
      domTranslator.setLanguage(normalized);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kisan-language-changed", { detail: { language: normalized } }));
      }
    }
  }, []);

  const t = useCallback((key, fallback = "") => {
    if (!key) return fallback || "";

    // 1. Direct match in TRANSLATIONS dictionary
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }

    // 2. Multilingual dictionary lookup on key
    const transByKey = lookupTranslation(key, language);
    if (transByKey) {
      return transByKey;
    }

    // 3. Multilingual dictionary lookup on fallback string
    if (fallback && fallback !== key) {
      const transByFallback = lookupTranslation(fallback, language);
      if (transByFallback) {
        return transByFallback;
      }
      const compoundFallback = translateCompoundText(fallback, language);
      if (compoundFallback && compoundFallback !== fallback) {
        return compoundFallback;
      }
    }

    // 4. Compound translation on key
    const compoundKey = translateCompoundText(key, language);
    if (compoundKey && compoundKey !== key) {
      return compoundKey;
    }

    // 5. English fallback in TRANSLATIONS
    if (TRANSLATIONS["EN"] && TRANSLATIONS["EN"][key]) {
      return TRANSLATIONS["EN"][key];
    }

    return fallback || key;
  }, [language]);

  const translate = useCallback((text) => {
    if (!text || language === "EN") return text;
    return lookupTranslation(text, language) || translateCompoundText(text, language) || text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
