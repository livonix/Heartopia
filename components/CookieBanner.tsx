
import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface CookieBannerProps {
  onConsentChange: (granted: boolean) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onConsentChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('heartopia_consent');
    if (consent === null) {
      // Petit délai pour l'animation d'entrée
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('heartopia_consent', 'granted');
    // Générer un ID unique si pas existant
    if (!localStorage.getItem('heartopia_visitor_id')) {
        localStorage.setItem('heartopia_visitor_id', crypto.randomUUID());
    }
    onConsentChange(true);
    setIsVisible(false);
  };

  const handleRefuse = async () => {
    const visitorId = localStorage.getItem('heartopia_visitor_id');
    
    // Si un ID existait (changement d'avis), on demande au serveur de tout supprimer
    if (visitorId) {
        try {
            await fetch('/api/tracking/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitor_id: visitorId })
            });
        } catch(e) { console.error("Erreur nettoyage", e); }
    }

    localStorage.setItem('heartopia_consent', 'denied');
    localStorage.removeItem('heartopia_visitor_id'); // Supprime l'ID localement
    onConsentChange(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[200] p-4 flex justify-center animate-slide-up">
      <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] p-6 max-w-4xl w-full flex flex-col md:flex-row items-center gap-6">
        
        <div className="flex-shrink-0 bg-[#2b7dad]/10 p-4 rounded-2xl text-[#2b7dad]">
            <Cookie size={32} />
        </div>

        <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center justify-center md:justify-start gap-2">
                {t("Respect de votre vie privée", "Respecting your privacy")} <ShieldCheck size={16} className="text-emerald-500" />
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t(
                    "Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience sur le Wiki. Aucune donnée n'est revendue. Si vous refusez, nous ne collecterons aucune information personnelle et effacerons toute trace précédente.",
                    "We use cookies to analyze traffic and improve your Wiki experience. No data is sold. If you refuse, we will collect no personal information and erase any previous traces."
                )}
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button 
                onClick={handleRefuse}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
                {t("Refuser & Supprimer", "Refuse & Delete")}
            </button>
            <button 
                onClick={handleAccept}
                className="px-8 py-3 rounded-xl bg-[#2b7dad] text-white font-black text-xs uppercase tracking-widest hover:bg-[#20648f] shadow-lg shadow-[#2b7dad]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Check size={16} /> {t("Accepter", "Accept")}
            </button>
        </div>
      </div>
    </div>
  );
};
