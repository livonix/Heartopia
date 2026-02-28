
import React, { useState, useEffect } from 'react';
import { ASSETS, API_URL } from '../constants';
import { Loader2, ArrowRight, Layout } from 'lucide-react';

export const PreReg: React.FC = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch(`${API_URL}/guides`);
        if (response.ok) {
          const data = await response.json();
          setGuides(data || []);
        }
      } catch (e) {
        console.error("Erreur chargement guides d'accueil:", e);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-20 sm:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden relative">
      <img src={ASSETS.preReg.cloud1} className="absolute top-10 left-[-5%] w-32 sm:w-40 opacity-40 animate-float pointer-events-none" alt="" />
      <img src={ASSETS.preReg.cloud2} className="absolute bottom-10 right-[-5%] w-40 sm:w-60 opacity-30 animate-float pointer-events-none" style={{animationDelay: '2s'}} alt="" />
      
      <div className="relative z-10 w-full max-w-6xl text-center mx-auto">
        <div className="mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2b7dad] mb-4">Portails de Guides</h2>
          <div className="w-20 sm:w-24 h-2 bg-[#2b7dad] mx-auto rounded-full opacity-30"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 size={40} className="animate-spin text-[#2b7dad] mb-4" />
            <p className="text-[#7c6a55] font-black animate-pulse">Chargement des portails...</p>
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {guides.map((cat) => (
              <div 
                key={cat.id} 
                className="group cursor-pointer relative"
              >
                <div className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center transition-all duration-500 hover:-translate-y-2 lg:hover:-translate-y-4 hover:shadow-2xl h-full border border-white/40">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 relative mb-6">
                     {cat.bubble_url && (
                       <img src={cat.bubble_url} className="absolute inset-0 w-full h-full object-contain opacity-20 scale-110 sm:scale-125" alt="" />
                     )}
                     {cat.icon_url && (
                       <img src={cat.icon_url} className="relative z-10 w-full h-full object-contain animate-float" style={{animationDuration: '4s'}} alt={cat.name} />
                     )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#7c6a55] mb-2">{cat.name}</h3>
                  <p className="text-[#7c6a55]/80 font-semibold text-sm leading-relaxed mb-4 flex-1">
                    {cat.description}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2 text-[#2b7dad] font-black text-xs sm:text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                    Consulter <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-[3rem] text-center border-dashed border-[#2b7dad]/30 bg-white/40 max-w-2xl mx-auto">
             <Layout size={48} className="text-[#2b7dad]/20 mx-auto mb-4" />
             <h3 className="text-xl font-black text-[#7c6a55] mb-2">Aucun guide publié</h3>
             <p className="text-sm font-bold text-[#7c6a55]/60">L'équipe prépare actuellement les portails d'accueil. Revenez très bientôt !</p>
          </div>
        )}

        <div className="mt-12 sm:mt-16 inline-block glass-panel px-6 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-3xl border-2 border-[#2b7dad]/10">
           <p className="text-[#7c6a55] font-bold italic text-sm sm:text-base">
             "Chaque page du wiki est un pas de plus vers la maîtrise de votre vie à Heartopia."
           </p>
        </div>
      </div>
    </div>
  );
};