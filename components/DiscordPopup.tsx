
import React from 'react';
import { X, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface DiscordPopupProps {
  onClose: () => void;
}

export const DiscordPopup: React.FC<DiscordPopupProps> = ({ onClose }) => {
  const { t } = useLanguage();

  const handleJoin = () => {
    window.open('https://discord.gg/3Gk9WexUNM', '_blank');
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem('heartopia_discord_popup_shown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-wiki-in">
      <div className="relative bg-[#5865F2] w-full max-w-lg rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
        <div className="bg-white rounded-[2.3rem] p-8 lg:p-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865F2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20"
                aria-label="Fermer"
            >
                <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-[#5865F2] rounded-3xl flex items-center justify-center shadow-lg shadow-[#5865F2]/30 mb-6 rotate-3">
                    <MessageCircle size={40} className="text-white" />
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 leading-tight">
                    {t("Le Discord du Wiki est", "The Wiki Discord is")} <span className="text-[#5865F2]">{t("Ouvert !", "Open!")}</span>
                </h2>

                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                    {t(
                        "Rejoignez la communauté Heartopia France pour échanger des astuces, partager vos créations et participer au développement du Wiki.",
                        "Join the Heartopia community to share tips, show off your creations, and help develop the Wiki."
                    )}
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={handleJoin}
                        className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#5865F2]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {t("Rejoindre le serveur", "Join Server")} <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={handleClose}
                        className="w-full py-4 bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        {t("Non merci, plus tard", "No thanks, later")}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
