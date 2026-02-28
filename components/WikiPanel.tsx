
import React, { useState, useMemo, useEffect } from 'react';
import { WIKI_STRUCTURE as FALLBACK_STRUCTURE, WikiCategory, API_URL } from '../constants';
import { CommentsSection } from './CommentsSection';
import { useLanguage } from '../lib/languageContext';
import {
  Search, ChevronRight, ChevronDown, Loader2, MapPin,
  Calendar, Coins, Ruler, Menu, X, ArrowUpRight, CloudSun, Utensils, Clock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCachedFetch } from '../hooks/useCachedFetch';

interface WikiPanelProps {
  user?: any;
  onLoginRequest?: () => void;
  initialSlug?: string;
}

// Improved Bubble Tag
const BubbleTag = ({ label, color = "blue" }: { label: string, color?: "blue" | "orange" | "green" | "pink" | "slate" }) => {
  const styles = {
    blue: "bg-sky-50 text-sky-600 border-sky-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pink: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return (
    <span className={`${styles[color]} px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border inline-flex items-center`}>
      {label}
    </span>
  );
};

// Redesigned Infobox (Card Style)
const Infobox: React.FC<{ data: any, isCollected?: boolean, onToggle?: () => void }> = ({ data, isCollected, onToggle }) => {
  return (
    <div className="infobox-container group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(43,125,173,0.2)] hover:-translate-y-2 transition-all duration-300 border border-slate-100 hover:border-[#2b7dad]/30 flex flex-col h-full relative">

      {/* Collection Toggle */}
      {onToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`absolute top-4 left-4 z-20 p-2 rounded-full shadow-lg transition-all ${isCollected ? 'bg-emerald-500 text-white scale-110' : 'bg-white/80 text-slate-300 hover:text-emerald-500'}`}
          title={isCollected ? "Retirer de ma collection" : "Ajouter à ma collection"}
        >
          <Check size={16} strokeWidth={3} />
        </button>
      )}

      {/* Header Image Area */}
      <div className={`relative h-56 bg-slate-50 p-6 flex items-center justify-center overflow-hidden ${isCollected ? 'bg-emerald-50/50' : ''}`}>
        {/* Abstract Pattern Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#2b7dad 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>

        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className={`relative z-10 w-40 h-40 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${isCollected ? 'grayscale-0' : ''}`}
            loading="lazy"
          />
        ) : (
          <span className="text-slate-300 font-black text-4xl uppercase select-none">?</span>
        )}

        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
          {data.rarity || "Commun"}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-xl font-black text-slate-800 leading-tight mb-1 group-hover:text-[#2b7dad] transition-colors flex items-center gap-2">
            {data.title || "Objet Inconnu"}
            {isCollected && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Obtenu</span>}
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fiche Détail</p>
        </div>

        <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-[#2b7dad]/10 transition-colors">
          {(data.lieu || data.zone) && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><MapPin size={14} className="text-[#2b7dad]" /> {data.zone ? 'Zone' : 'Lieu'}</span>
              <span className="font-bold text-slate-700 text-right">{data.lieu || data.zone}</span>
            </div>
          )}

          {data.foods && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><Utensils size={14} className="text-[#2b7dad]" /> Aliments</span>
              <span className="font-bold text-slate-700 text-right">{data.foods}</span>
            </div>
          )}

          {data.ingredients && (
            <div className="flex flex-col gap-1 text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide mb-1"><Utensils size={14} className="text-[#2b7dad]" /> Ingrédients</span>
              <p className="font-bold text-slate-700 text-xs leading-relaxed">{data.ingredients}</p>
            </div>
          )}

          {data.periode && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><Calendar size={14} className="text-[#2b7dad]" /> Période</span>
              <span className="font-bold text-slate-700 text-right">{data.periode}</span>
            </div>
          )}

          {(data.meteo || data.weather) && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><CloudSun size={14} className="text-[#2b7dad]" /> Météo</span>
              <span className="font-bold text-slate-700 text-right">{data.meteo || data.weather}</span>
            </div>
          )}

          {data.heure && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><Clock size={14} className="text-[#2b7dad]" /> Heure</span>
              <span className="font-bold text-slate-700 text-right">{data.heure}</span>
            </div>
          )}

          {data.taille && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide"><Ruler size={14} className="text-[#2b7dad]" /> Taille</span>
              <span className="font-bold text-slate-700">{data.taille}</span>
            </div>
          )}
        </div>

        {data.price_min && (
          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur</span>
            <div className="flex items-center gap-1.5 font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <Coins size={14} className="fill-amber-500" />
              {data.price_min}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemGrid: React.FC<{ items: any[], collectedIds: string[], onToggle: (id: string) => void }> = ({ items, collectedIds, onToggle }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 my-8">
    {items.map((item, i) => {
      const isCollected = collectedIds.includes(item.title || item.name); // Using title/name as ID for demo
      return (
        <div key={i} className={`group bg-white rounded-3xl p-4 border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up relative ${isCollected ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-slate-100'}`} style={{ animationDelay: `${i * 50}ms` }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(item.title || item.name); }}
            className={`absolute top-3 left-3 z-10 p-1.5 rounded-full transition-all ${isCollected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300 hover:text-emerald-500'}`}
          >
            <Check size={12} strokeWidth={4} />
          </button>

          <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
            {item.image && (
              <img src={item.image} alt={item.name} className={`w-2/3 h-2/3 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 ${isCollected ? '' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`} loading="lazy" />
            )}
          </div>
          <div className="text-center">
            <h4 className={`font-bold text-sm leading-tight transition-colors ${isCollected ? 'text-emerald-700' : 'text-slate-700 group-hover:text-[#2b7dad]'}`}>{item.name}</h4>
            {item.rarity && <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1 block">{item.rarity}</span>}
          </div>
        </div>
      )
    })}
  </div>
);

const RichContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const renderContent = () => {
    const html = content
      .replace(/### (.*)/g, '<h3 class="text-2xl font-black text-[#2b7dad] mt-10 mb-6 flex items-center gap-3"><span class="w-8 h-1 bg-[#2b7dad] rounded-full"></span>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-extrabold bg-[#2b7dad]/10 px-1 rounded">$1</strong>')
      .replace(/- (.*)/g, '<li class="flex items-start gap-3 mb-3 ml-2"><span class="w-1.5 h-1.5 rounded-full bg-[#2b7dad] mt-2.5 shrink-0"></span><span class="text-slate-600 font-medium">$1</span></li>')
      .replace(/\n/g, '<br />');
    return { __html: html };
  };
  return (
    <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <img src="https://website.xdcdn.net/poster/133737826/home/topBar/M0Bt6oHS.png" className="w-64 grayscale" alt="watermark" />
      </div>
      <div className="relative z-10 font-medium leading-loose text-slate-600" dangerouslySetInnerHTML={renderContent()} />
    </div>
  );
};

export const WikiPanel: React.FC<WikiPanelProps> = ({ user, onLoginRequest, initialSlug }) => {
  const [wikiData, setWikiData] = useState<WikiCategory[]>([]);
  const [activePageId, setActivePageId] = useState<string>('');
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);

  const { lang, t } = useLanguage();

  // Cache integration
  const { data: fetchedData, loading } = useCachedFetch(`/wiki/structure?lang=${lang}`);

  useEffect(() => {
    if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
      setWikiData(fetchedData);
      setExpandedCats(fetchedData.map((c: any) => c.id.toString()));

      if (initialSlug && !activePageId) {
        for (const cat of fetchedData) {
          const page = cat.pages?.find((p: any) => p.slug === initialSlug);
          if (page) {
            setActivePageId(page.id.toString());
            return;
          }
        }
      }
    } else if (!loading) {
      setWikiData(FALLBACK_STRUCTURE);
      setExpandedCats(FALLBACK_STRUCTURE.map((c: any) => c.id.toString()));
    }
  }, [fetchedData, loading, initialSlug, activePageId]);

  useEffect(() => {
    // Load collection
    const savedCollection = localStorage.getItem('heartopia_collection');
    if (savedCollection) setCollectedItems(JSON.parse(savedCollection));
  }, []);

  const toggleCollected = (id: string) => {
    setCollectedItems(prev => {
      const newSet = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('heartopia_collection', JSON.stringify(newSet));
      return newSet;
    });
  };

  useEffect(() => {
    if (!loading && wikiData.length > 0 && !activePageId) {
      const firstPage = wikiData[0]?.pages?.[0];
      if (firstPage) setActivePageId(firstPage.id.toString());
    }
  }, [loading, wikiData, activePageId]);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handlePageChange = (page: any) => {
    if (activePageId === page.id.toString()) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePageId(page.id.toString());
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsTransitioning(false);
    }, 300);
  };

  const activePage = useMemo(() => {
    if (!wikiData || wikiData.length === 0) return null;
    for (const cat of wikiData) {
      if (!cat.pages) continue;
      const page = cat.pages.find(p => p.id.toString() === activePageId);
      if (page) return page;
    }
    return null;
  }, [activePageId, wikiData]);

  // --- SEO DYNAMIQUE PAGE WIKI ---
  useEffect(() => {
    if (activePage) {
      document.title = `${activePage.title} - Wiki Heartopia Communautaire`;
      // On pourrait injecter une meta description spécifique ici si elle existait dans l'objet page
    } else {
      document.title = "Wiki Heartopia - Guides & Encyclopédie";
    }

    return () => { document.title = "Heartopia - Wiki & Encyclopédie Communautaire"; }
  }, [activePage]);

  const filteredNav = useMemo(() => {
    if (!wikiData) return [];
    return wikiData.map(cat => ({
      ...cat,
      pages: (cat.pages || []).filter(p => {
        const title = p.title;
        return !search || title.toLowerCase().includes(search.toLowerCase());
      })
    })).filter(cat => cat.pages.length > 0);
  }, [search, wikiData]);

  if (loading || isTransitioning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#f8fafc]">
        <Loader2 size={48} className="animate-spin text-[#2b7dad] mb-6" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">
          {loading ? t("Connexion à la base de données...", "Connecting to database...") : t("Chargement du contenu...", "Loading content...")}
        </p>
      </div>
    );
  }

  if (!activePage) return null;

  const displayTitle = activePage.title;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-[#f8fafc]">

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-slate-700 text-sm">Menu Wiki</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-[70px] lg:top-[80px] z-40 w-full lg:w-80 h-[calc(100vh-80px)] 
        bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar 
        transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder={t("Rechercher...", "Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-[#2b7dad] focus:bg-white focus:ring-4 focus:ring-[#2b7dad]/10 outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="space-y-6">
            {filteredNav.map(cat => {
              return (
                <div key={cat.id} className="space-y-2">
                  <button
                    onClick={() => toggleCat(cat.id.toString())}
                    className="w-full flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 hover:text-[#2b7dad] transition-colors"
                  >
                    <span>{cat.name}</span>
                    {expandedCats.includes(cat.id.toString()) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {expandedCats.includes(cat.id.toString()) && (
                    <div className="flex flex-col gap-1 relative pl-2">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-100"></div>
                      {(cat.pages || []).map(page => {
                        const isActive = activePageId === page.id.toString();
                        return (
                          <button
                            key={page.id}
                            onClick={() => handlePageChange(page)}
                            className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ml-2
                          ${isActive
                                ? 'bg-[#2b7dad] text-white shadow-md shadow-[#2b7dad]/20'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#2b7dad]'
                              }`}
                          >
                            {page.title}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-[#f8fafc] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 lg:py-16">

          {/* Breadcrumb / Header */}
          <div className="mb-12 animate-wiki-in">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              <span>Wiki</span>
              <ChevronRight size={10} />
              <span className="text-[#2b7dad]">{displayTitle}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-tight mb-6">
              {displayTitle}
            </h1>

            <div className="h-1.5 w-20 bg-[#2b7dad] rounded-full"></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {(activePage.sections || []).map((section) => {
                const sectionTitle = section.title;
                const rawContent = section.content;
                const isArrayContent = Array.isArray(rawContent);
                const first = isArrayContent ? (rawContent as any[])[0] : null;

                const isInfoboxSeries = isArrayContent && first?.type === 'infobox';
                const isInsectSeries = isArrayContent && first?.type === 'insect_infobox';
                const isAnimalSeries = isArrayContent && first?.type === 'animal_infobox';
                const isRecipeSeries = isArrayContent && first?.type === 'recipe_infobox';
                const isStandardGrid = isArrayContent && !first?.type;

                return (
                  <div key={section.id}>
                    <section id={`section-${section.id}`}>
                      <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-black text-slate-800">{sectionTitle}</h2>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>

                      {(isInfoboxSeries || isInsectSeries || isAnimalSeries || isRecipeSeries) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {(rawContent as any[]).map((data, i) => (
                            <Infobox
                              key={i}
                              data={data}
                              isCollected={collectedItems.includes(data.title || data.name)}
                              onToggle={() => toggleCollected(data.title || data.name)}
                            />
                          ))}
                        </div>
                      )}

                      {isStandardGrid && (
                        <ItemGrid
                          items={rawContent as any[]}
                          collectedIds={collectedItems}
                          onToggle={toggleCollected}
                        />
                      )}

                      {!isArrayContent && <RichContent content={rawContent as string} />}
                    </section>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="mt-20 pt-10 border-t border-slate-200">
            <CommentsSection sectionId={activePage.sections?.[0]?.id || 0} user={user} onLoginRequest={onLoginRequest || (() => { })} />
          </div>
        </div>
      </main>
    </div>
  );
};