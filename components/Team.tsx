
import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Heart, Star, Loader2, Users } from 'lucide-react';
import { API_URL } from '../constants';

export const Team: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${API_URL}/team`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data || []);
        }
      } catch (e) {
        console.error("Erreur chargement équipe:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center py-40 bg-[var(--wiki-bg)]">
        <Loader2 size={40} className="animate-spin text-[#2b7dad] mb-4" />
        <p className="text-[var(--wiki-text-muted)] font-bold animate-pulse uppercase tracking-widest text-xs">Chargement de l'équipe...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center py-20 lg:py-32 px-6 bg-[var(--wiki-bg)] transition-colors duration-300">
      <div className="max-w-6xl w-full mx-auto">
        <div className="text-center mb-20 animate-wiki-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
             <Star size={14} className="fill-[#2b7dad]" /> Équipe de Gestion
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[var(--wiki-text-main)] mb-6 tracking-tight">
            Les Bâtisseurs de <span className="text-[#2b7dad]">Heartopia</span>
          </h1>
          <p className="text-[var(--wiki-text-muted)] font-bold text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Découvrez les passionnés qui travaillent bénévolement pour offrir à la communauté mondiale le meilleur guide de jeu.
          </p>
        </div>

        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {members.map((member, i) => (
              <div 
                key={member.id || i} 
                className="group relative animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="glass-panel p-8 rounded-[3rem] h-full flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl bg-[var(--wiki-card-bg)]">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-[var(--wiki-border)] shadow-xl relative z-10">
                      <img src={member.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={member.name} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--wiki-card-bg)] rounded-2xl flex items-center justify-center shadow-lg z-20 text-[#2b7dad]">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="absolute inset-0 bg-[#2b7dad]/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-[var(--wiki-text-main)] group-hover:text-[#2b7dad] transition-colors">{member.name}</h3>
                    <span className="inline-block px-3 py-1 bg-[#2b7dad]/10 text-[#2b7dad] rounded-lg text-[10px] font-black uppercase tracking-widest mt-1">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-[var(--wiki-text-muted)] font-medium text-sm leading-relaxed mb-8 flex-1">
                    "{member.description}"
                  </p>

                  <div className="w-full pt-6 border-t border-[var(--wiki-border)] flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--wiki-bg)] flex items-center justify-center text-[var(--wiki-text-muted)] group-hover:text-[#2b7dad] transition-colors">
                          <MessageCircle size={16} />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[var(--wiki-bg)] flex items-center justify-center text-[var(--wiki-text-muted)] group-hover:text-red-400 transition-colors">
                          <Heart size={16} />
                      </div>
                    </div>
                    <a 
                      href="https://discord.gg/3Gk9WexUNM" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-[#2b7dad] uppercase tracking-widest hover:underline"
                    >
                      Discord →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-20 rounded-[4rem] text-center border-dashed border-[#2b7dad]/30 bg-[#2b7dad]/5 animate-wiki-in">
             <div className="w-20 h-20 bg-[#2b7dad]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2b7dad]">
               <Users size={40} />
             </div>
             <h3 className="text-2xl font-black text-[var(--wiki-text-main)] mb-2">L'équipe se prépare...</h3>
             <p className="text-[var(--wiki-text-muted)] font-bold max-w-md mx-auto">
               Aucun membre n'a encore été ajouté à l'annuaire public. Revenez très bientôt pour faire leur connaissance !
             </p>
          </div>
        )}

        <div className="mt-24 glass-panel p-10 lg:p-16 rounded-[4rem] text-center bg-[#2b7dad]/5 border-[#2b7dad]/10">
           <h3 className="text-3xl font-black text-[var(--wiki-text-main)] mb-4">Vous voulez aider ?</h3>
           <p className="text-[var(--wiki-text-muted)] font-bold mb-8 max-w-xl mx-auto">
             Le Wiki est un projet collaboratif. Si vous avez des informations, des images ou du temps, rejoignez-nous !
           </p>
           <a 
             href="https://discord.gg/3Gk9WexUNM" 
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-3 bg-[#5865F2] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#4752C4] transition-all shadow-xl shadow-[#5865F2]/20 active:scale-95"
           >
             Rejoindre l'équipe Discord
           </a>
        </div>
      </div>
    </div>
  );
};
