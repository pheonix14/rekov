'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'HI' | 'ES' | 'FR';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  EN: {
    check_in: 'CHECK-IN',
    manual_entry: 'Manual Entry',
    status_check: 'STATUS CHECK',
    token_lookup: 'Token Lookup',
    schedules: 'SCHEDULES',
    doctor_timings: 'Doctor Timings',
    listening: 'Listening... Tap to stop.',
    processing: 'Processing',
    understood: 'Understood',
    network_error: 'Network Error. Please try again.',
    welcome: 'Welcome to REKOV',
    hospital_system: 'Hospital Self-Service System',
  },
  HI: {
    check_in: 'चेक-इन',
    manual_entry: 'मैन्युअल प्रविष्टि',
    status_check: 'स्थिति जांच',
    token_lookup: 'टोकन खोजें',
    schedules: 'समय सारिणी',
    doctor_timings: 'डॉक्टर का समय',
    listening: 'सुन रहे हैं... रोकने के लिए टैप करें।',
    processing: 'प्रोसेसिंग',
    understood: 'समझ गया',
    network_error: 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।',
    welcome: 'REKOV में आपका स्वागत है',
    hospital_system: 'अस्पताल स्वयं-सेवा प्रणाली',
  },
  ES: {
    check_in: 'REGISTRARSE',
    manual_entry: 'Entrada Manual',
    status_check: 'ESTADO',
    token_lookup: 'Buscar Ficha',
    schedules: 'HORARIOS',
    doctor_timings: 'Horarios del Doctor',
    listening: 'Escuchando... Toca para detener.',
    processing: 'Procesando',
    understood: 'Entendido',
    network_error: 'Error de red. Inténtalo de nuevo.',
    welcome: 'Bienvenido a REKOV',
    hospital_system: 'Sistema de Autoservicio del Hospital',
  },
  FR: {
    check_in: 'S\'ENREGISTRER',
    manual_entry: 'Saisie Manuelle',
    status_check: 'VÉRIFIER LE STATUT',
    token_lookup: 'Recherche de Jeton',
    schedules: 'HORAIRES',
    doctor_timings: 'Horaires du Docteur',
    listening: 'Écoute... Appuyez pour arrêter.',
    processing: 'Traitement',
    understood: 'Compris',
    network_error: 'Erreur réseau. Veuillez réessayer.',
    welcome: 'Bienvenue chez REKOV',
    hospital_system: 'Système en Libre-Service de l\'Hôpital',
  }
};

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: 'EN',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('EN');

  useEffect(() => {
    const saved = localStorage.getItem('rekov_lang') as Language;
    if (saved && TRANSLATIONS[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('rekov_lang', newLang);
  };

  const t = (key: string) => {
    return TRANSLATIONS[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
