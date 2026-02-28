
import React, { useState, useEffect, useRef } from 'react';
import { Book, Menu, X, PlaySquare, ChevronDown, LayoutDashboard, LogOut, Download, ShieldCheck, Gift, Twitch, Globe, Users, Check, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

// Les IDs doivent correspondre aux sections, mais les labels seront gérés par t()
const NAV_ITEMS = [
  { id: 'home', labelKey: 'nav.home', section: 'section-home' },
  { id: 'database', labelKey: 'feat.cat.database', section: 'section-game' },
  { id: 'video', labelKey: 'nav.academy', section: 'section-video' },
];

interface NavbarProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onNavigateToWiki: () => void;
  onNavigateToNews?: () => void;
  onNavigateToTeam: () => void;
  onNavigateToAcademy: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToCodes?: () => void;
  onNavigateToStreamers: () => void;
  onNavigateToShowcase: () => void;
  onLoginRequest: () => void;
  onLogout: () => void;
  user?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  scrollRef, 
  onNavigateToWiki, 
  onNavigateToNews,
  onNavigateToTeam, 
  onNavigateToAcademy, 
  onNavigateToAdmin,
  onNavigateToCodes,
  onNavigateToStreamers,
  onNavigateToShowcase,
  onLoginRequest,
  onLogout,
  user 
}) => {
  const [activeItem, setActiveItem] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
  const { lang, setLang, availableLanguages, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const options = {
      root: null,
      threshold: 0.3, 
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const matchedItem = NAV_ITEMS.find(item => item.section === entry.target.id);
          if (matchedItem) {
            setActiveItem(matchedItem.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.section);
      if (el) observer.observe(el);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [scrollRef]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(t(
        "Installation manuelle :\n\n- Sur iOS : Appuyez sur 'Partager' puis 'Sur l'écran d'accueil'.\n\n- Sur Android : Appuyez sur les 3 points puis 'Installer l'application'.",
        "Manual Install:\n\n- iOS: Tap 'Share' then 'Add to Home Screen'.\n\n- Android: Tap the 3 dots then 'Install App'."
      ));
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => scrollToSection('section-home')}
          >
            <img 
              src="https://website.xdcdn.net/poster/133737826/home/topBar/M0Bt6oHS.png" 
              alt="Logo" 
              className="h-9 transition-transform group-hover:scale-105 filter drop-shadow-sm"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-2 bg-white/50 backdrop-blur-md rounded-full p-1.5 border border-white/40 shadow-sm hover:shadow-md transition-shadow">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.section)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  activeItem === item.id 
                    ? 'text-white shadow-md' 
                    : 'text-slate-600 hover:text-[#2b7dad] hover:text-[#2b7dad] hover:bg-white/60'
                }`}
              >
                {activeItem === item.id && (
                  <div className="absolute inset-0 bg-[#2b7dad] rounded-full z-[-1] animate-in fade-in zoom-in-95 duration-300"></div>
                )}
                {t(item.labelKey)}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-300 mx-2 opacity-50"></div>
            <button
                onClick={() => { if(onNavigateToNews) onNavigateToNews(); }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 text-slate-600 hover:text-[#2b7dad] hover:bg-white/60`}
            >
                {t('nav.news')}
            </button>
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Language Dropdown */}
            <div className="relative" ref={langMenuRef}>
                <button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold transition-all border shadow-sm ${isLangMenuOpen ? 'bg-white border-[#2b7dad] text-[#2b7dad]' : 'bg-white/60 hover:bg-white text-slate-600 hover:text-[#2b7dad] border-white/50'}`}
                    title="Change Language"
                >
                    <Globe size={18} />
                    <span className="uppercase text-xs tracking-wider">{lang}</span>
                    <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 z-[60]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Select Language</p>
                        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                            {availableLanguages.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => { setLang(l.code); setIsLangMenuOpen(false); }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${lang === l.code ? 'bg-[#2b7dad]/10 text-[#2b7dad]' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <span>{l.name}</span>
                                    {lang === l.code && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={onNavigateToShowcase}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-white text-slate-600 hover:text-[#2b7dad] rounded-xl font-bold transition-all border border-white/50 shadow-sm group"
            >
                <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs uppercase tracking-wide">{t('nav.showcase', 'Galerie')}</span>
            </button>

            <button
                onClick={onNavigateToStreamers}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-white text-slate-600 hover:text-[#9146FF] rounded-xl font-bold transition-all border border-white/50 shadow-sm group"
            >
                <Twitch size={18} className="group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs uppercase tracking-wide">{t('nav.streamers')}</span>
            </button>

            {onNavigateToCodes && (
              <button
                onClick={onNavigateToCodes}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-white text-[#2b7dad] rounded-xl font-bold transition-all border border-white/50 shadow-sm group"
              >
                <Gift size={18} className="group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs uppercase tracking-wide">{t('nav.codes')}</span>
              </button>
            )}

            <button
              onClick={onNavigateToWiki}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2b7dad] to-[#20648f] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#2b7dad]/20 transition-all active:scale-95"
            >
              <Book size={18} className="group-hover:rotate-6 transition-transform" />
              <span className="text-xs uppercase tracking-widest">{t('nav.wiki')}</span>
            </button>

            {user ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/80 border border-white rounded-full hover:bg-white transition-all shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#2b7dad]">
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-3 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-[10px] font-black text-[#2b7dad] uppercase tracking-widest mb-0.5">Compte</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
                    </div>
                    
                    <button 
                      onClick={() => { onNavigateToAdmin(); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${user.isAdmin ? 'text-slate-600 hover:bg-[#2b7dad]/10 hover:text-[#2b7dad]' : 'text-[#2b7dad] hover:bg-[#2b7dad]/10'}`}
                    >
                      {user.isAdmin ? (
                        <><LayoutDashboard size={18} /> {t('nav.dashboard')}</>
                      ) : (
                        <><ShieldCheck size={18} /> {t('nav.admin')}</>
                      )}
                    </button>

                                        
                    <div className="h-px bg-slate-100 my-2 mx-2"></div>
                    
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                    >
                      <LogOut size={18} /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3 ml-2">
                 <button 
                   onClick={onLoginRequest}
                   className="px-5 py-3 text-[#5865F2] font-black text-xs uppercase tracking-widest hover:bg-[#5865F2]/10 bg-white/80 rounded-xl border border-white shadow-sm transition-colors"
                 >
                   {t('nav.login')}
                 </button>
                 <button 
                   onClick={handleInstallClick}
                   className="p-3 bg-white/80 text-slate-600 rounded-xl hover:text-[#2b7dad] hover:shadow-md transition-all border border-white shadow-sm"
                   title={t('nav.install')}
                 >
                   <Download size={20} />
                 </button>
              </div>
            )}
          </div>
            
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 text-slate-700 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-colors shadow-sm"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 z-[45] bg-white/95 backdrop-blur-2xl transition-all duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6 relative overflow-hidden">
          
          {/* Decorative background blur */}
          <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#2b7dad]/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Mobile Language Switcher */}
          <div className="absolute top-6 right-24">
             <button 
               onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
               className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
             >
               <Globe size={14} /> {lang}
             </button>
             {isLangMenuOpen && (
                 <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                     {availableLanguages.map(l => (
                         <button 
                            key={l.code}
                            onClick={() => { setLang(l.code); setIsLangMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                         >
                             {l.name}
                         </button>
                     ))}
                 </div>
             )}
          </div>

          <div className="flex flex-col gap-6 w-full max-w-xs text-center relative z-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.section)}
                className="text-3xl font-black text-slate-800 hover:text-[#2b7dad] transition-colors"
              >
                {t(item.labelKey)}
              </button>
            ))}
            <button
                onClick={() => { if(onNavigateToNews) onNavigateToNews(); setIsMenuOpen(false); }}
                className="text-3xl font-black text-slate-800 hover:text-[#2b7dad] transition-colors"
            >
                {t('nav.news')}
            </button>
          </div>
          
          <div className="w-12 h-1 bg-slate-100 rounded-full"></div>

          <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
            <button
              onClick={() => { onNavigateToWiki(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-3 w-full py-5 bg-[#2b7dad] text-white rounded-3xl font-black text-lg shadow-xl shadow-[#2b7dad]/20 active:scale-95 transition-transform"
            >
              <Book size={22} /> {t('nav.wiki')}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
               <button
                  onClick={() => { onNavigateToAcademy(); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-2 py-5 bg-slate-50 rounded-3xl font-bold text-slate-600 active:scale-95 transition-transform border border-slate-100"
                >
                  <PlaySquare size={24} className="text-[#2b7dad]" />
                  <span className="text-xs uppercase tracking-wider">{t('nav.academy')}</span>
                </button>
                <button
                  onClick={() => { onNavigateToShowcase(); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-2 py-5 bg-slate-50 rounded-3xl font-bold text-slate-600 active:scale-95 transition-transform border border-slate-100"
                >
                  <ImageIcon size={24} className="text-[#2b7dad]" />
                  <span className="text-xs uppercase tracking-wider">{t('nav.showcase', 'Galerie')}</span>
                </button>
            </div>

            <button
              onClick={() => { onNavigateToTeam(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 rounded-3xl font-bold text-slate-600 active:scale-95 transition-transform border border-slate-100"
            >
              <Users size={18} className="text-[#2b7dad]" /> {t('nav.team')}
            </button>

            <button
              onClick={() => { onNavigateToStreamers(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#9146FF]/10 text-[#9146FF] border border-[#9146FF]/20 rounded-3xl font-bold text-sm uppercase tracking-widest"
            >
              <Twitch size={18} /> {t('nav.streamers')}
            </button>

            <button
              onClick={() => { if(onNavigateToCodes) onNavigateToCodes(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-3xl font-bold text-sm uppercase tracking-widest"
            >
              <Gift size={18} /> {t('nav.codes')}
            </button>
            
            {!user && (
                <button
                  onClick={() => { onLoginRequest(); setIsMenuOpen(false); }}
                  className="w-full py-4 bg-[#5865F2] text-white rounded-3xl font-black text-sm shadow-lg shadow-[#5865F2]/20 active:scale-95 transition-transform uppercase tracking-widest"
                >
                  {t('nav.login')}
                </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
