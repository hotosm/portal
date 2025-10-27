import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract locale from pathname (e.g., /fr/field -> fr)
  const urlLocale = (location.pathname.match(/^\/([a-z]{2})(\/|$)/)?.[1]) as Locale | undefined;
  
  // Set locale from URL
  const currentLanguage = useMemo(() => {
    const locale = urlLocale && locales.includes(urlLocale) ? urlLocale : getLocale();
    setLocale(locale);
    return locale;
  }, [urlLocale]);

  const setLanguage = (lang: Locale) => {
    const pathWithoutLocale = location.pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    navigate(`/${lang}${pathWithoutLocale}`);
  };

  // Redirect to default locale if no locale in URL
  useEffect(() => {
    if (!urlLocale && !location.pathname.match(/^\/[a-z]{2}(\/|$)/)) {
      const defaultLocale = getLocale();
      const targetPath = location.pathname === '/' ? `/${defaultLocale}/` : `/${defaultLocale}${location.pathname}`;
      navigate(targetPath, { replace: true });
    }
  }, [urlLocale, navigate, location.pathname]);

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
