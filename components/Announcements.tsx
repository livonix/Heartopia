
import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiService';
import { Bell, Calendar, Tag, Loader2, Megaphone, Clock } from 'lucide-react';

export const Announcements: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.fetch('/news');
        setNews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // --- PARSEUR RICHE (Markdown, Discord Timestamps, Emojis) ---
  const formatContent = (text: string) => {
    if (!text) return '';

    // 1. Map des emojis Discord courants vers Unicode
    const emojiMap: Record<string, string> = {
        ':alarm_clock:': '⏰',
        ':wrench:': '🔧',
        ':gift:': '🎁',
        ':star:': '⭐',
        ':warning:': '⚠️',
        ':sparkles:': '✨',
        ':heart:': '❤️',
        ':white_check_mark:': '✅',
        ':x:': '❌',
        ':calendar:': '📅'
    };

    let processed = text;

    // Remplacement Emojis
    Object.entries(emojiMap).forEach(([key, val]) => {
        processed = processed.split(key).join(val);
    });

    // Remplacement Timestamps Discord <t:1769637600:f>
    processed = processed.replace(/<t:(\d+)(?::[a-zA-Z])?>/g, (_, ts) => {
        const date = new Date(parseInt(ts) * 1000);
        // Style badge pour la date
        return `<span class="inline-flex items-center gap-1 bg-[#2b7dad]/10 text-[#2b7dad] border border-[#2b7dad]/20 px-1.5 py-0.5 rounded text-xs font-bold mx-1 align-baseline"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>`;
    });

    // Remplacement Gras **texte**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-extrabold">$1</strong>');

    // Traitement ligne par ligne pour les listes
    const lines = processed.split('\n');
    let htmlParts: string[] = [];
    let inList = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Détection item de liste (* ou -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            if (!inList) {
                htmlParts.push('<ul class="list-disc pl-5 space-y-2 my-3 text-slate-600 marker:text-[#2b7dad]">');
                inList = true;
            }
            // Nettoyer le marqueur et ajouter l'item
            htmlParts.push(`<li class="pl-1">${trimmed.substring(2)}</li>`);
        } else {
            // Fin de liste si on était dedans
            if (inList) {
                htmlParts.push('</ul>');
                inList = false;
            }
            
            // Ligne vide = saut de ligne visuel
            if (trimmed === '') {
                htmlParts.push('<div class="h-2"></div>');
            } else {
                // Paragraphe standard
                htmlParts.push(`<p class="mb-1 leading-relaxed">${line}</p>`);
            }
        }
    });

    if (inList) htmlParts.push('</ul>');

    return htmlParts.join('');
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center py-20 lg:py-32 px-6 bg-[var(--wiki-bg)]">
      <div className="max-w-5xl w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-wiki-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#2b7dad]/20">
             <Megaphone size={14} /> Officiel
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[var(--wiki-text-main)] mb-6 tracking-tight">
            Annonces <span className="text-[#2b7dad]">Heartopia</span>
          </h1>
          <p className="text-[var(--wiki-text-muted)] font-bold text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Restez informé des dernières mises à jour, maintenances et événements du jeu.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 size={40} className="animate-spin text-[#2b7dad]" />
          </div>
        ) : news.length === 0 ? (
          <div className="glass-panel p-20 rounded-[4rem] text-center border-dashed border-[#2b7dad]/30 bg-[#2b7dad]/5 animate-wiki-in">
             <Bell size={48} className="text-[#2b7dad]/20 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-[var(--wiki-text-main)] mb-2">Aucune annonce</h3>
             <p className="text-[var(--wiki-text-muted)] font-bold">L'équipe n'a pas encore publié de nouvelles.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-slide-up">
            {news.map((item, idx) => (
              <article key={item.id} className="group relative bg-[var(--wiki-card-bg)] rounded-[2.5rem] border border-[var(--wiki-border)] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                
                {/* Image Section */}
                <div className="md:w-1/3 min-h-[250px] relative overflow-hidden bg-slate-100">
                   {item.image_url ? (
                     <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-br from-[#2b7dad]/5 to-[#2b7dad]/20 flex items-center justify-center">
                        <Bell size={40} className="text-[#2b7dad]/20" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden"></div>
                   
                   {/* Tag Badge */}
                   <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${item.tag === 'Mise à jour' ? 'bg-purple-500 text-white' : item.tag === 'Maintenance' ? 'bg-amber-500 text-white' : 'bg-[#2b7dad] text-white'}`}>
                         <Tag size={10} /> {item.tag || 'Info'}
                      </span>
                   </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 lg:p-10 flex flex-col">
                   <div className="flex items-center gap-2 text-[var(--wiki-text-muted)] text-xs font-bold uppercase tracking-wider mb-3 opacity-60">
                      <Calendar size={12} /> {formatDate(item.created_at)}
                   </div>
                   
                   <h2 className="text-2xl lg:text-3xl font-black text-[var(--wiki-text-main)] mb-6 leading-tight group-hover:text-[#2b7dad] transition-colors">
                      {item.title}
                   </h2>
                   
                   {/* Rich Text Renderer */}
                   <div 
                     className="text-[var(--wiki-text-muted)] font-medium text-sm lg:text-base"
                     dangerouslySetInnerHTML={{ __html: formatContent(item.content) }}
                   />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};