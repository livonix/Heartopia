
import React from 'react';
import { Hammer, Cloud, ShieldCheck, MessageCircle } from 'lucide-react';

interface MaintenancePageProps {
  onLoginRequest: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onLoginRequest }) => {
  return (
    <div className="min-h-screen bg-[#2b7dad] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Quicksand']">
      
      {/* Background Clouds Animation */}
      <div className="absolute top-20 left-10 text-white/10 animate-float" style={{animationDuration: '6s'}}>
         <Cloud size={100} />
      </div>
      <div className="absolute bottom-20 right-10 text-white/10 animate-float" style={{animationDuration: '8s'}}>
         <Cloud size={120} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full text-center">
         <div className="w-32 h-32 bg-white/20 rounded-[2.5rem] backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 border border-white/30">
            <Hammer size={64} className="text-white drop-shadow-md animate-pulse" />
         </div>

         <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
            En Travaux
         </h1>
         
         <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-xl">
            <p className="text-white text-lg font-bold leading-relaxed mb-6">
               Le Wiki Heartopia est actuellement en maintenance pour mise à jour.
               <br/><br/>
               <span className="text-white/80 text-sm font-medium">Nos petits architectes travaillent dur pour améliorer votre expérience. Revenez vite !</span>
            </p>

            <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-8"></div>

            <div className="flex flex-col gap-4">
                <a 
                    href="https://discord.gg/3Gk9WexUNM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#5865F2] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#4752C4] transition-all shadow-lg active:scale-95 group"
                >
                    <MessageCircle size={18} className="fill-white/20 group-hover:scale-110 transition-transform" /> 
                    Rejoindre le Discord
                </a>

                <button 
                    onClick={onLoginRequest}
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#2b7dad] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 opacity-90 hover:opacity-100"
                >
                    <ShieldCheck size={16} /> Accès Staff
                </button>
            </div>
         </div>
      </div>

      <footer className="absolute bottom-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">
         Heartopia Wiki © 2026
      </footer>
    </div>
  );
};
