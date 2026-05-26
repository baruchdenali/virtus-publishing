import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Language } from '@/i18n';
import { translations, languages } from '@/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  languages,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    // Try to get from localStorage or browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('virtus-lang') as Language | null;
      if (stored && translations[stored]) return stored;
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) return browserLang;
    }
    return 'en';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('virtus-lang', newLang);
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
