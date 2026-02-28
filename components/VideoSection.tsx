
import React, { useState, useEffect } from 'react';
import { Play, Clock, Youtube, ExternalLink, Loader2, Smartphone, Monitor } from 'lucide-react';
import { ASSETS, API_URL } from '../constants';
import { useLanguage } from '../lib/languageContext';

export const VideoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [academyVideos, setAcademyVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAcademy = async () => {
      try {
        const response = await fetch(`${API_URL}/academy`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAcademyVideos(data);
            setActiveVideo(data[0]);
          } else {
            setAcademyVideos([]);
            setActiveVideo(null);
          }
        } else {
          setAcademyVideos([]);
          setActiveVideo(null);
        }
      } catch (e) {
        console.error("Erreur chargement académie:", e);
        setAcademyVideos([]);
        setActiveVideo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademy();
  }, []);

  const handleSelectVideo = (video: any) => {
    setActiveVideo(video);
    setIsPlaying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to detect platform and ID
  const getVideoInfo = (url: string) => {
    if (!url) return { platform: 'native', id: '' };

    // YouTube Detection
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (ytMatch) return { platform: 'youtube', id: ytMatch[1] };

    // TikTok Detection
    const ttMatch = url.match(/tiktok\.com\/@.+\/video\/(\d+)/);
    if (ttMatch) return { platform: 'tiktok', id: ttMatch[1] };

    return { platform: 'native', id: url };
  };

  const { platform, id } = activeVideo ? getVideoInfo(activeVideo.video_url) : { platform: 'native', id: '' };
  const isPortrait = platform === 'tiktok';

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center py-12 lg:py-20 px-4 sm:px-6 lg:px-12 overflow-hidden transition-colors duration-300">
      
      <img src={ASSETS.section4.balloon} className="absolute top-10 right-[5%] w-24 sm:w-32 opacity-10 dark:opacity-5 animate-float pointer-events-none" alt="" loading="lazy" />
      
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center mx-auto">
        
        <div className="text-center mb-10 lg:mb-16 animate-wiki-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 mx-auto border border-[#2b7dad]/20">
            <Youtube size={14} /> {t("academy.title", "Académie Heartopia")}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[var(--wiki-text-main)] tracking-tight leading-none">
            {t("academy.subtitle_prefix", "Apprendre en")} <span className="text-[#2b7dad]">{t("academy.subtitle_suffix", "Images")}</span>
          </h2>
          <p className="text-[var(--wiki-text-muted)] font-semibold text-lg lg:text-xl mt-4 max-w-2xl mx-auto px-4">
            {t("academy.desc", "Découvrez les secrets de l'île à travers nos tutoriels vidéo communautaires.")}
          </p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center py-40">
                <Loader2 size={40} className="animate-spin text-[#2b7dad] mb-4" />
                <p className="text-[var(--wiki-text-muted)] font-black animate-pulse uppercase tracking-widest text-xs">{t("academy.sync", "Synchronisation...")}</p>
            </div>
        ) : academyVideos.length > 0 ? (
            <div className="w-full flex flex-col gap-12 animate-slide-up">
            
              {/* Main Player Section */}
              <div className="w-full max-w-5xl mx-auto relative group flex flex-col" id="academy-player">
                  {/* ... */}
                  
                  {/* Meta info */}
                  <div className={`mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 ${isPortrait ? 'max-w-sm mx-auto w-full' : ''}`}>
                    <div>
                      <h4 className="text-2xl font-black text-[var(--wiki-text-main)] mb-1 leading-tight">{activeVideo?.title}</h4>
                      <p className="text-sm font-bold text-[var(--wiki-text-muted)] opacity-70">{t("academy.published_in", "Publié dans la catégorie")} {activeVideo?.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 px-6 py-3 bg-[var(--wiki-card-bg)] border border-[var(--wiki-border)] rounded-2xl text-xs font-black text-[var(--wiki-text-muted)] hover:text-[#2b7dad] transition-all shadow-sm">
                         {t("common.share", "Partager")} <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
              </div>

              {/* Video Grid Section */}
              <div className="w-full max-w-7xl mx-auto mt-8">
                  <div className="flex items-center justify-between mb-8 px-4">
                    <h4 className="text-[var(--wiki-text-main)] font-black text-2xl uppercase tracking-tighter flex items-center gap-3">
                      <span className="w-2 h-8 bg-[#2b7dad] rounded-full"></span>
                      {t("academy.more_videos", "Autres Vidéos")}
                    </h4>
                    <span className="text-[10px] text-[#2b7dad] font-black bg-[#2b7dad]/10 px-3 py-1 rounded-full">{academyVideos.length} {t("academy.videos", "VIDÉOS")}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                    {/* ... */}
                  </div>

                  <div className="mt-16 pt-8 border-t border-[var(--wiki-border)] flex justify-center">
                    <button className="group flex items-center justify-center gap-3 bg-[#2b7dad] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#20648f] transition-all duration-500 shadow-lg shadow-[#2b7dad]/20 active:scale-95">
                      {t("academy.view_channel", "Voir la chaîne YouTube")} <ExternalLink size={16} />
                    </button>
                  </div>
              </div>

            </div>
        ) : (
            <div className="glass-panel p-20 rounded-[4rem] text-center bg-white/40 border-dashed border-[#2b7dad]/30">
                <Play size={48} className="text-[#2b7dad]/20 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-[#7c6a55] mb-2 uppercase tracking-tighter">{t("academy.construction_title", "L'académie est en cours de création")}</h3>
                <p className="text-sm font-bold text-[#7c6a55]/60 max-w-sm mx-auto">{t("academy.construction_desc", "Revenez bientôt pour découvrir nos premiers tutoriels vidéo.")}</p>
            </div>
        )}
      </div>
    </div>
  );
};
