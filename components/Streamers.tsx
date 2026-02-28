
import React, { useState, useEffect } from 'react';
import { Twitch, Users, ExternalLink, Loader2, Video, Heart } from 'lucide-react';
import { api } from '../lib/apiService';
import { useLanguage } from '../lib/languageContext';

export const Streamers: React.FC = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        const data = await api.fetch(`/twitch/streams?lang=${lang}`);
        setStreams(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch streams", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [lang]);

  const getThumbnail = (url: string) => {
    if (!url) return 'https://website.xdcdn.net/poster/133737826/home/s1/MEj0dry9.jpg';
    return url.replace('{width}', '440').replace('{height}', '248');
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center py-20 lg:py-32 px-6 bg-[var(--wiki-bg)]">
      <div className="max-w-7xl w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-wiki-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#9146FF]/10 text-[#9146FF] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#9146FF]/20">
             <Twitch size={14} /> Community
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[var(--wiki-text-main)] mb-6 tracking-tight">
            Heartopia en <span className="text-[#9146FF]">Live</span>
          </h1>
          <p className="text-[var(--wiki-text-muted)] font-bold text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {t(
                "Retrouvez les créateurs de contenu qui explorent, construisent et partagent leur aventure en direct.",
                "Find content creators exploring, building, and sharing their adventure live."
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="animate-spin text-[#9146FF] mb-4" />
            <p className="text-[var(--wiki-text-muted)] font-bold animate-pulse uppercase tracking-widest text-xs">Recherche de signaux ({lang})...</p>
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streams.map((stream) => (
              <a 
                key={stream.id} 
                href={`https://www.twitch.tv/${stream.user_name}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block animate-slide-up"
              >
                <div className="bg-[var(--wiki-card-bg)] rounded-[2.5rem] overflow-hidden border border-[var(--wiki-border)] shadow-lg hover:shadow-[#9146FF]/20 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                  
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-black">
                    <img 
                      src={getThumbnail(stream.thumbnail_url)} 
                      alt={stream.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-[#ef4444] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span> Live
                    </div>

                    {/* Viewers Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90 font-bold text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <Users size={12} /> {stream.viewer_count} spectateurs
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex gap-4 flex-1">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#9146FF] to-[#2b7dad]">
                            <img 
                                src={stream.profile_image_url || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                className="w-full h-full rounded-full object-cover border-2 border-[var(--wiki-card-bg)]" 
                                alt={stream.user_name} 
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-base font-black text-[var(--wiki-text-main)] truncate leading-tight group-hover:text-[#9146FF] transition-colors">
                            {stream.user_name}
                        </h3>
                        <p className="text-xs text-[var(--wiki-text-muted)] font-medium line-clamp-2 mt-1 flex-1">
                            {stream.title}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#9146FF] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            Regarder sur Twitch <ExternalLink size={12} />
                        </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-20 rounded-[4rem] text-center border-dashed border-[#9146FF]/30 bg-[#9146FF]/5 animate-wiki-in">
             <div className="w-24 h-24 bg-[#9146FF]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#9146FF]">
               <Video size={40} />
             </div>
             <h3 className="text-2xl font-black text-[var(--wiki-text-main)] mb-2">Aucun Stream Actif ({lang})</h3>
             <p className="text-[var(--wiki-text-muted)] font-bold max-w-md mx-auto mb-8">
               Il semblerait que personne ne stream Heartopia dans cette langue pour le moment.
             </p>
             <a 
               href="https://www.twitch.tv/directory/category/heartopia" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 bg-[#9146FF] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#7c3aed] transition-all shadow-xl shadow-[#9146FF]/20 active:scale-95 text-xs uppercase tracking-widest"
             >
               Vérifier la catégorie <ExternalLink size={16} />
             </a>
          </div>
        )}

        <div className="mt-20 text-center">
           <div className="inline-flex items-center gap-2 p-4 bg-white rounded-2xl border border-[var(--wiki-border)] shadow-sm">
              <Heart size={16} className="text-[#9146FF] fill-[#9146FF]" />
              <p className="text-xs font-bold text-[var(--wiki-text-muted)]">
                 Vous streamez Heartopia ? <a href="https://discord.gg/3Gk9WexUNM" target="_blank" className="text-[#9146FF] underline hover:no-underline">Rejoignez le Discord</a> pour obtenir le rôle Streamer.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};
