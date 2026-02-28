
import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiService';
import { Twitch, Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface LivePreviewProps {
  onNavigateToStreamers: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ onNavigateToStreamers }) => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const data = await api.fetch(`/twitch/streams?lang=${lang}`);
        setStreams(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (e) {
        console.error("Failed to fetch streams", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [lang]); // Recharge quand la langue change

  const getThumbnail = (url: string) => {
    if (!url) return 'https://website.xdcdn.net/poster/133737826/home/s1/MEj0dry9.jpg';
    return url.replace('{width}', '440').replace('{height}', '248');
  };

  if (!loading && streams.length === 0) return null;

  return (
    <div className="w-full py-16 px-6 flex flex-col items-center relative overflow-hidden border-t border-gray-100">
       {/* Decor */}
       <div className="absolute top-0 left-0 w-full h-full bg-[#9146FF]/5 pointer-events-none opacity-50"></div>
       <div className="absolute -left-20 top-20 w-64 h-64 bg-[#9146FF]/10 rounded-full blur-[80px] pointer-events-none"></div>

       <div className="relative z-10 w-full max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
             <div className="text-center md:text-left mx-auto md:mx-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9146FF]/10 text-[#9146FF] rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 border border-[#9146FF]/20 justify-center md:justify-start w-full md:w-auto">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9146FF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9146FF]"></span>
                   </span>
                   <span className="flex items-center gap-1"><Twitch size={12} /> {t("En Direct", "Live Now")}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[#5e4d3b] tracking-tight">
                   Heartopia {t("sur", "on")} <span className="text-[#9146FF]">Twitch</span>
                </h2>
             </div>
             
             <button 
               onClick={onNavigateToStreamers}
               className="hidden md:flex group items-center gap-2 text-[#9146FF] font-bold text-sm uppercase tracking-widest hover:bg-[#9146FF]/10 px-4 py-2 rounded-xl transition-all"
             >
               {t("Voir tous les lives", "View all streams")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="aspect-video bg-gray-100 rounded-[1.5rem] animate-pulse"></div>
                ))}
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {streams.map((stream) => (
                   <a 
                     key={stream.id}
                     href={`https://www.twitch.tv/${stream.user_name}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group relative block bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#9146FF]/10 transition-all duration-300 hover:-translate-y-1 border border-[#f3f3f3]"
                   >
                      <div className="relative aspect-video bg-slate-900">
                         <img 
                           src={getThumbnail(stream.thumbnail_url)} 
                           alt={stream.title} 
                           className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                         />
                         <div className="absolute top-3 left-3 bg-[#ef4444] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">Live</div>
                         <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Users size={10} /> {stream.viewer_count}
                         </div>
                      </div>
                      
                      <div className="p-4 flex gap-3 items-center">
                         <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-[#9146FF] to-[#2b7dad] flex-shrink-0">
                            <img 
                                src={stream.profile_image_url || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                className="w-full h-full rounded-full border border-white object-cover" 
                                alt={stream.user_name} 
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-[#5e4d3b] truncate group-hover:text-[#9146FF] transition-colors">{stream.user_name}</h3>
                            <p className="text-[10px] text-[#9a836b] truncate opacity-80 font-bold">{stream.title}</p>
                         </div>
                      </div>
                   </a>
                ))}
             </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
             <button 
               onClick={onNavigateToStreamers}
               className="w-full bg-[#9146FF] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#9146FF]/20"
             >
               {t("Voir tous les lives", "View all streams")}
             </button>
          </div>
       </div>
    </div>
  );
};
