/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { TRANSLATIONS } from "../translations";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "sampoorn_kisan_lang";

export function LanguageProvider({ children, initialUser }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch { void 0; }
    if (initialUser && initialUser.preferredLanguage) {
      const codeMap = { English: "EN", Telugu: "TE", Hindi: "HI", Tamil: "TA", Kannada: "KN", Marathi: "MR", Punjabi: "PA" };
      if (codeMap[initialUser.preferredLanguage]) return codeMap[initialUser.preferredLanguage];
    }
    return "EN";
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, langCode);
      } catch { void 0; }
    }
  };

  const t = (key, fallback = "") => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS["EN"] && TRANSLATIONS["EN"][key]) {
      return TRANSLATIONS["EN"][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
