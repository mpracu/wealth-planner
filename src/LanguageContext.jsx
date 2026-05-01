import { createContext, useContext, useState } from 'react';
import { T } from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const t = (key) => T[key]?.[lang] ?? T[key]?.en ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
