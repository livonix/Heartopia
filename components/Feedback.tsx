
import React from 'react';
import { ArrowLeft, MessageCircle, LifeBuoy } from 'lucide-react';

interface FeedbackProps {
  onBack: () => void;
  user: any;
  onLoginRequest: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ onBack }) => {
  return (
    <div className="relative bg-[var(--wiki-bg)] min-h-screen font-['Quicksand'] flex flex-col">
      <nav className="sticky top-0 left-0 w-full z-50 bg-[var(--wiki-card-bg)]/80 backdrop-blur-md border-b border-[var(--wiki-border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[var(--wiki-text-muted)] font-bold hover:text-[#55a4dd] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Retour</span>
          </button>
          <div className="flex items-center gap-2">
             <MessageCircle className="text-[#2b7dad]" />
             <span className="font-black text-[#5e4d3b]">Feedback</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 animate-wiki-in">
        <div className="max-w-2xl w-full">
          <div className="glass-panel p-8 sm:p-12 rounded-[3rem] shadow-xl bg-white border border-[#e6dccf] flex flex-col items-center text-center">
            
            <div className="w-24 h-24 bg-[#2b7dad]/10 rounded-full flex items-center justify-center mb-8 text-[#2b7dad]">
               <LifeBuoy size={48} />
            </div>

            <h1 className="text-3xl font-black text-[#5e4d3b] mb-4">Page de Feedback Archivée</h1>
            
            <p className="text-[#9a836b] font-medium leading-relaxed text-lg mb-8 max-w-lg">
              Ce formulaire n'est plus maintenu. Pour contacter l'équipe, signaler un bug ou proposer une idée, merci d'utiliser les autres canaux de communication disponibles.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 w-full">
                <p className="text-slate-600 font-bold text-base mb-2">
                    Service de contact temporairement indisponible
                </p>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                    Nous vous remercions de votre compréhension
                </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
