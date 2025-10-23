import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { setLocale, getLocale, locales } from "../paraglide/runtime";

type Locale = (typeof locales)[number];

interface LanguageContextType {
  currentLanguage: Locale;
  setLanguage: (lang: Locale) => void;
  availableLanguages: typeof locales;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(getLocale());

  const setLanguage = (lang: Locale) => {
    setLocale(lang, { reload: false });
    setCurrentLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  // Initialize language from localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem(
      "preferredLanguage"
    ) as Locale | null;
    if (storedLanguage && locales.includes(storedLanguage)) {
      setLocale(storedLanguage, { reload: false });
      setCurrentLanguage(storedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocale(browserLang, { reload: false });
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages: locales,
      }}
    >
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
