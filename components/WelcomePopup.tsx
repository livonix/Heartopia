
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Heart, BadgeCheck, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface WelcomePopupProps {
  onClose?: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  // NOUVELLE CLÉ pour forcer l'affichage (Reset pour la nouvelle annonce globale)
  const STORAGE_KEY = 'heartopia_official_global_partnership_seen_v2';

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-wiki-in">
      <div className="relative bg-white max-w-xl w-full p-8 lg:p-12 rounded-[3rem] text-center shadow-[0_30px_70px_rgba(43,125,173,0.3)] border-4 border-[#2b7dad]/20 overflow-hidden">

        {/* Background Confetti/Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2b7dad] via-[#ffce00] to-[#2b7dad]"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ffce00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#2b7dad]/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-[#7c6a55] hover:text-[#2b7dad] transition-colors p-2 z-10"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className="w-24 h-24 bg-gradient-to-br from-[#2b7dad] to-[#20648f] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3 relative">
          <BadgeCheck size={48} className="text-white" />
          <div className="absolute -bottom-2 -right-2 bg-[#ffce00] rounded-full p-1.5 border-2 border-white">
            <Globe size={16} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-[#2b7dad] mb-2 uppercase tracking-tight">
          {t("Wiki Communautaire", "Community Wiki")}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles size={16} className="text-[#ffce00]" />
          <span className="text-sm font-bold text-[#ffce00] uppercase tracking-widest">{t("Projet Indépendant", "Independent Project")}</span>
          <Sparkles size={16} className="text-[#ffce00]" />
        </div>

        <div className="space-y-6 text-[#7c6a55] font-medium leading-relaxed">
          <p className="text-lg">
            {t(
              "Bienvenue sur le",
              "Welcome to the"
            )}
            <br />
            <strong className="text-[#2b7dad] text-xl"> {t("Wiki & Site Communautaire de Heartopia", "Heartopia Community Wiki & Site")}</strong>
          </p>

          <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-600">
              Projet Communautaire
            </div>
            <p className="text-sm text-[#5e4d3b]">
              {t(
                "Ce site est un projet communautaire indépendant, créé par des fans pour les joueurs. Il n'a aucun lien officiel avec le studio XD Interactive.",
                "This site is an independent community project, created by fans for players. It has no official affiliation with XD Interactive studio."
              )}
            </p>
          </div>

          <p className="text-xs opacity-80 font-bold uppercase tracking-wide">
            {t("Bienvenue dans la communauté !", "Welcome to the community!")}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="mt-10 w-full bg-[#2b7dad] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#20648f] shadow-xl shadow-[#2b7dad]/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
          {t("Entrer sur le Wiki", "Enter the Wiki")}
          <Heart size={20} className="fill-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
