
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../constants';
import { translations } from './translations';

export interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  lang: string;
  availableLanguages: Language[];
  setLang: (code: string) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(() => {
    const savedLang = localStorage.getItem('heartopia_lang');
    if (savedLang) return savedLang;
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'fr';
  });
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([{ code: 'fr', name: 'Français' }]);

  useEffect(() => {
    // 1. Charger les langues disponibles depuis le backend
    const fetchLanguages = async () => {
      try {
        const res = await fetch(`${API_URL}/wiki/languages`);
        if (res.ok) {
          const data = await res.json();
          setAvailableLanguages(data);
        }
      } catch (e) {
        console.error("Failed to load languages", e);
      }
    };
    fetchLanguages();
  }, []);

  const setLang = (code: string) => {
    setLangState(code);
    localStorage.setItem('heartopia_lang', code);
  };

  // Fonction de traduction améliorée
  const t = (key: string, defaultText: string = '') => {
    // 1. Chercher dans la langue actuelle
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // 2. Fallback sur l'anglais
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    // 3. Fallback sur le français
    if (translations['fr'] && translations['fr'][key]) {
      return translations['fr'][key];
    }
    // 4. Retourner le texte par défaut ou la clé si rien n'est trouvé
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, availableLanguages, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
