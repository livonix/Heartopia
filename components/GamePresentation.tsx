
import React from 'react';
import { Home, Users, Sparkles, Sprout, Heart, Gamepad2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface GamePresentationProps {
  onExplore?: () => void;
}

export const GamePresentation: React.FC<GamePresentationProps> = ({ onExplore }) => {
  const { t } = useLanguage();

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden font-['Quicksand']">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2b7dad]/20 to-transparent"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#2b7dad]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#ffce00]/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="max-w-7xl mx-auto">
        
        {/* Main Pitch */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-[#5e4d3b] mb-8 leading-tight animate-slide-up">
            {t("pres.title")}
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-loose animate-slide-up delay-100">
            {t("pres.desc")}
            <br/><br/>
            {t("pres.platforms")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-20">
            
            {/* Feature 1 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2.5rem] border border-slate-100 hover:border-[#2b7dad]/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default animate-slide-up delay-100">
                <div className="w-16 h-16 bg-[#2b7dad]/10 rounded-2xl flex items-center justify-center text-[#2b7dad] mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Home size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-[#2b7dad] transition-colors">{t("pres.f1.title")}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {t("pres.f1.desc")}
                </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2.5rem] border border-slate-100 hover:border-[#ffce00]/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default animate-slide-up delay-200">
                <div className="w-16 h-16 bg-[#ffce00]/10 rounded-2xl flex items-center justify-center text-[#e6b800] mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    <Sprout size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-[#e6b800] transition-colors">{t("pres.f2.title")}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {t("pres.f2.desc")}
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2.5rem] border border-slate-100 hover:border-[#9146FF]/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default animate-slide-up delay-300">
                <div className="w-16 h-16 bg-[#9146FF]/10 rounded-2xl flex items-center justify-center text-[#9146FF] mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Users size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-[#9146FF] transition-colors">{t("pres.f3.title")}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {t("pres.f3.desc")}
                </p>
            </div>
        </div>

        {/* Secondary Info & Wiki Link */}
        <div className="bg-[#0f172a] rounded-[3rem] p-10 lg:p-16 text-center relative overflow-hidden shadow-2xl group animate-scale-in delay-300">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px"}}></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2b7dad]/20 to-purple-500/20 pointer-events-none group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
                    <Sparkles size={14} className="animate-pulse" /> {t("pres.help")}
                </div>
                
                <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">{t("pres.wiki.title")}</h2>
                
                <p className="text-slate-300 font-medium text-lg max-w-2xl mx-auto mb-10">
                    {t("pres.wiki.desc")}
                </p>

                <button 
                    onClick={() => {
                        if (onExplore) {
                            onExplore();
                        } else {
                            const wikiSection = document.getElementById('section-game');
                            if(wikiSection) wikiSection.scrollIntoView({behavior: 'smooth'});
                        }
                    }}
                    className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#2b7dad] hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 group/btn"
                >
                    {t("pres.wiki.btn")} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>

        {/* FAQ Keywords for SEO (Hidden visually but semantic) */}
        <div className="sr-only">
            <h3>FAQ Heartopia</h3>
            <p>Heartopia est-il gratuit ? Oui, c'est un jeu free-to-play.</p>
            <p>Plateformes : PC, Steam, iOS, Android.</p>
            <p>Jeu hors ligne ? Non, nécessite une connexion internet.</p>
        </div>

      </div>
    </section>
  );
};
