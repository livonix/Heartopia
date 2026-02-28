
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GamePresentation } from './components/GamePresentation';
import { Features } from './components/Features';
import { VideoSection } from './components/VideoSection';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { ConnectionOverlay } from './components/ConnectionOverlay';
import { SocialSection } from './components/SocialSection';
import { WelcomePopup } from './components/WelcomePopup';

const WikiPanel = React.lazy(() => import('./components/WikiPanel').then(m => ({ default: m.WikiPanel })));
const AdminLogin = React.lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Team = React.lazy(() => import('./components/Team').then(m => ({ default: m.Team })));
const LegalPage = React.lazy(() => import('./components/LegalPage').then(m => ({ default: m.LegalPage })));
const RedeemCodes = React.lazy(() => import('./components/RedeemCodes').then(m => ({ default: m.RedeemCodes })));
const Streamers = React.lazy(() => import('./components/Streamers').then(m => ({ default: m.Streamers })));
const LivePreview = React.lazy(() => import('./components/LivePreview').then(m => ({ default: m.LivePreview })));
const Announcements = React.lazy(() => import('./components/Announcements').then(m => ({ default: m.Announcements })));
const DownloadPage = React.lazy(() => import('./components/DownloadPage').then(m => ({ default: m.DownloadPage })));
const MaintenancePage = React.lazy(() => import('./components/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const Showcase = React.lazy(() => import('./components/Showcase').then(m => ({ default: m.Showcase })));
const ShowcasePreview = React.lazy(() => import('./components/ShowcasePreview').then(m => ({ default: m.ShowcasePreview })));
const DiscordPopup = React.lazy(() => import('./components/DiscordPopup').then(m => ({ default: m.DiscordPopup })));

import { ArrowLeft, PlayCircle, ChevronDown, LayoutDashboard, LogOut, ShieldCheck, Info, Megaphone, X, Gift } from 'lucide-react';
import { API_URL, ASSETS } from './constants';
import { useLanguage } from './lib/languageContext';
import { useSocket } from './lib/socketContext';
import { api, ApiError } from './lib/apiService';
import type { User } from './types';

export type WikiView = 'home' | 'wiki' | 'team' | 'academy' | 'codes' | 'admin' | 'legal' | 'privacy' | 'streamers' | 'news' | 'download' | 'showcase';

const App: React.FC = () => {
    const { setLang, lang } = useLanguage();
    const { socket } = useSocket();
    const [notification, setNotification] = useState<{ msg: string, type?: 'system' | 'code', data?: any } | null>(null);
    const [consentGiven, setConsentGiven] = useState(false); // État du consentement

    // --- GLOBAL NOTIFICATION PERMISSION & LISTENER ---
    useEffect(() => {
        // Demander la permission dès que possible
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Socket Global Notifications & Support Notifications
    useEffect(() => {
        if (!socket) return;

        // 1. Notifications Globales (Broadcast Admin)
        const handleNotification = (msg: string) => {
            setNotification({ msg, type: 'system' });
            if (document.hidden && Notification.permission === 'granted') {
                new Notification('Heartopia Info', { body: msg, icon: ASSETS.logo });
            }
        };

        // 2. Notification Nouveau Code Cadeau
        const handleNewCode = (data: any) => {
            setNotification({
                msg: `Nouveau Code Cadeau : ${data.code} !`,
                type: 'code',
                data: data
            });
            if (document.hidden && Notification.permission === 'granted') {
                new Notification('Nouveau Code Heartopia !', { body: `Code: ${data.code} - ${data.reward}`, icon: ASSETS.logo });
            }
        };

        socket.on('global_notification', handleNotification);
        socket.on('new_code_alert', handleNewCode);

        return () => {
            socket.off('global_notification', handleNotification);
            socket.off('new_code_alert', handleNewCode);
        };
    }, [socket]);

    const handleNotificationClick = () => {
        if (notification?.type === 'code') {
            // Naviguer vers les codes avec l'ID à mettre en avant
            navigate('codes', '', { highlightId: notification.data.id });
            setNotification(null);
        }
    };

    // --- AUTH HANDLING ---
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showDiscordPopup, setShowDiscordPopup] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);

    // Init consent state from storage
    useEffect(() => {
        const storedConsent = localStorage.getItem('heartopia_consent');
        if (storedConsent === 'granted') {
            setConsentGiven(true);
        }
    }, []);

    // ROUTING LOGIC
    const getInitialState = () => {
        const path = window.location.pathname.substring(1); // Remove leading slash
        const parts = path.split('/');
        const root = parts[0] || 'home';

        if (root === 'admin') return { view: 'admin', slug: '' };

        if (root === 'wiki') {
            const urlLang = parts[1];
            const pageSlug = parts[2] || '';

            if (urlLang === 'fr' || urlLang === 'en') {
                return { view: 'wiki', slug: pageSlug, langCode: urlLang };
            }
            return { view: 'wiki', slug: parts[1] || '' };
        }

        if (['team', 'academy', 'codes', 'legal', 'privacy', 'streamers', 'news', 'showcase'].includes(root)) {
            return { view: root, slug: '' };
        }
        if (root === 'annonces') return { view: 'news', slug: '' };
        if (root === 'telecharger') return { view: 'download', slug: '' };
        return { view: 'home', slug: '' };
    };

    const [routeState, setRoute] = useState<any>(getInitialState());
    const { view, slug, extraData } = routeState;

    const containerRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // @ts-ignore
        if (routeState.langCode && (routeState.langCode === 'fr' || routeState.langCode === 'en')) {
            // Prevent unnecessary updates if lang is already set
            // @ts-ignore
            if (routeState.langCode !== lang) {
                // @ts-ignore
                setLang(routeState.langCode);
            }
        }
    }, [routeState, lang, setLang]);

    // Check Maintenance
    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await fetch(`${API_URL}/status`);
                if (res.ok) {
                    const data = await res.json();
                    setIsMaintenance(data.maintenance);
                }
            } catch (e) {
                console.warn("Could not check maintenance status", e);
            }
        };
        checkMaintenance();
    }, []);

    // Handle Browser Back/Forward
    useEffect(() => {
        const handlePopState = () => {
            setRoute(getInitialState());
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (newView: string, newSlug: string = '', extra: any = null) => {
        let url = newView === 'home' ? '/' : `/${newView}`;
        if (newView === 'wiki') url = `/wiki/${lang}${newSlug ? `/${newSlug}` : ''}`;
        if (newView === 'news') url = '/annonces';
        if (newView === 'download') url = '/telecharger';

        window.history.pushState({}, '', url);
        setRoute({ view: newView, slug: newSlug, extraData: extra });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Popup Management
    useEffect(() => {
        const welcomeSeen = localStorage.getItem('heartopia_official_global_partnership_seen_v2');
        const discordSeen = localStorage.getItem('heartopia_discord_popup_shown');

        if (welcomeSeen && !discordSeen && !isMaintenance) {
            const timer = setTimeout(() => setShowDiscordPopup(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isMaintenance]);

    const handleWelcomePopupClose = () => {
        const discordSeen = localStorage.getItem('heartopia_discord_popup_shown');
        if (!discordSeen) {
            setShowDiscordPopup(true);
        }
    };

    // TRACKING VISIT (GDPR Compliant)
    useEffect(() => {
        // Ne track QUE si le consentement est donné
        if (!consentGiven) return;

        const recordVisit = async () => {
            const visitorId = localStorage.getItem('heartopia_visitor_id');
            if (!visitorId) return;

            try {
                await fetch(`${API_URL}/visit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitor_id: visitorId,
                        page_path: window.location.pathname,
                        action_type: 'view'
                    })
                });
            } catch (e) {
                console.error("Audit failed:", e);
            }
        };
        recordVisit();
    }, [view, slug, consentGiven]); // Re-run when view changes OR when consent is newly granted

    const handleDiscordCallback = useCallback(async (code: string, isAdminContext: boolean) => {
        setIsLoading(true);
        setError(null);
        try {
            window.history.replaceState({}, document.title, window.location.pathname);
            const endpoint = isAdminContext ? `${API_URL}/auth/discord` : `${API_URL}/auth/discord/public`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                if (isAdminContext) navigate('admin');
            } else {
                setError(data.error || "Échec de l'authentification");
                if (isAdminContext) alert("Erreur: " + data.error);
            }
        } catch (err) {
            setError("Le serveur d'authentification est injoignable.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    // Handle Discord OAuth Callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('Discord OAuth Error:', error);
            setError('Erreur lors de l\'authentification Discord');
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        
        if (code) {
            const authMode = localStorage.getItem('auth_mode');
            const isAdminContext = authMode === 'admin';
            handleDiscordCallback(code, isAdminContext);
        }
    }, [handleDiscordCallback]);

    const initiateLogin = (isAdmin = false) => {
        localStorage.setItem('auth_mode', isAdmin ? 'admin' : 'public');
        const CLIENT_ID = '1459651039945818122';
        const REDIRECT_URI = encodeURIComponent(window.location.origin);
        const scope = 'identify';
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
    };

    const handleLogout = async () => {
        try {
            await api.fetch('/auth/logout', { method: 'POST' });
        } catch (e) {
            // ignore
        }
        setUser(null);
        navigate('home');
        setError(null);
        setIsUserMenuOpen(false);
    };

    // RENDER LOGIC

    // Maintenance screen takes priority over standard content BUT ConnectionOverlay takes priority over everything
    const renderContent = () => {
        if (isMaintenance && (!user || !user.hasAccess)) {
            return <MaintenancePage onLoginRequest={() => initiateLogin(true)} />;
        }

        if (view === 'download') return <DownloadPage onBack={() => navigate('home')} />;

        if (view === 'admin') {
            if (user && user.hasAccess) return <AdminDashboard user={user} onLogout={handleLogout} onBack={() => navigate('home')} />;
            else if (user) return <AdminDashboard user={user} onLogout={handleLogout} onBack={() => navigate('home')} />;
            return <AdminLogin onBack={() => navigate('home')} onLoginSuccess={() => { }} isLoading={isLoading} error={error} />;
        }

        if (view === 'legal' || view === 'privacy') return <LegalPage type={view} onBack={() => navigate('home')} />;
        if (view === 'codes') return <RedeemCodes onBack={() => navigate('home')} highlightId={extraData?.highlightId} />;
        if (view === 'showcase') return <Showcase onBack={() => navigate('home')} user={user} onLoginRequest={() => initiateLogin(false)} />;

        // Default Standard View (Home, Wiki, etc)
        return (
            <>
                {(view === 'wiki' || view === 'team' || view === 'academy' || view === 'streamers' || view === 'news' || view === 'showcase') ? (
                    <div className="relative bg-[var(--wiki-bg)] min-h-screen font-['Quicksand'] flex flex-col transition-colors duration-300">
                        <nav className="sticky top-0 left-0 w-full z-50 bg-[var(--wiki-card-bg)]/80 backdrop-blur-md border-b border-[var(--wiki-border)] transition-colors duration-300">
                            <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">
                                <button onClick={() => navigate('home')} className="flex items-center gap-2 text-[var(--wiki-text-muted)] font-bold hover:text-[#2b7dad] transition-colors">
                                    <ArrowLeft size={18} />
                                    <span className="text-sm font-bold">Retour à l'accueil</span>
                                </button>
                                <div className="flex items-center">
                                    <img src="https://website.xdcdn.net/poster/133737826/home/topBar/M0Bt6oHS.png" alt="Logo Heartopia" className="h-8" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden lg:flex items-center gap-6 mr-2">
                                        <button onClick={() => navigate('wiki')} className={`text-xs font-black uppercase transition-colors ${view === 'wiki' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Wiki</button>
                                        <button onClick={() => navigate('news')} className={`text-xs font-black uppercase transition-colors ${view === 'news' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Annonces</button>
                                        <button onClick={() => navigate('showcase')} className={`text-xs font-black uppercase transition-colors ${view === 'showcase' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Galerie</button>
                                        <button onClick={() => navigate('academy')} className={`text-xs font-black uppercase transition-colors ${view === 'academy' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Academy</button>
                                        <button onClick={() => navigate('streamers')} className={`text-xs font-black uppercase transition-colors ${view === 'streamers' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Streamers</button>
                                        <button onClick={() => navigate('team')} className={`text-xs font-black uppercase transition-colors ${view === 'team' ? 'text-[#2b7dad]' : 'text-[var(--wiki-text-muted)] hover:text-[#2b7dad]'}`}>Équipe</button>
                                    </div>

                                    {user ? (
                                        <div className="relative border-l border-[var(--wiki-border)] pl-4 ml-2" ref={userMenuRef}>
                                            <button
                                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                                className="flex items-center gap-2 p-1 bg-[var(--wiki-bg)] border border-[var(--wiki-border)] rounded-full hover:bg-[var(--wiki-card-bg)] transition-all shadow-sm"
                                            >
                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2b7dad]">
                                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                </div>
                                                <ChevronDown size={14} className={`text-[var(--wiki-text-muted)] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isUserMenuOpen && (
                                                <div className="absolute right-0 mt-3 w-64 bg-[var(--wiki-card-bg)] border border-[var(--wiki-border)] rounded-2xl shadow-2xl p-2 animate-wiki-in z-[100]">
                                                    <div className="px-4 py-3 border-b border-[var(--wiki-border)] mb-2">
                                                        {user.isAdmin && (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-[#2b7dad] uppercase tracking-widest mb-1">
                                                                <ShieldCheck size={12} /> Admin Connecté
                                                            </div>
                                                        )}
                                                        <p className="text-xs font-black text-[var(--wiki-text-main)] truncate">{user.username}</p>
                                                    </div>

                                                    <button
                                                        onClick={() => { navigate('admin'); setIsUserMenuOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${user.isAdmin ? 'text-[var(--wiki-text-muted)] hover:bg-[#2b7dad]/10 hover:text-[#2b7dad]' : 'text-[#2b7dad] hover:bg-[#2b7dad]/10'}`}
                                                    >
                                                        {user.isAdmin ? (
                                                            <><LayoutDashboard size={18} /> Tableau de bord</>
                                                        ) : (
                                                            <><ShieldCheck size={18} /> Accès Admin</>
                                                        )}
                                                    </button>

                                                    
                                                    <div className="h-px bg-[var(--wiki-border)] my-2 mx-2"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut size={18} /> Déconnexion
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => initiateLogin(false)}
                                            className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-colors ml-4"
                                        >
                                            Connexion
                                        </button>
                                    )}

                                    <div className="hidden sm:flex items-center gap-4 border-l border-[var(--wiki-border)] pl-4">
                                        <a href="https://heartopia.xd.com/" className="bg-[#2b7dad] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#20648f] transition-colors">Site du Jeu</a>
                                    </div>
                                </div>
                            </div>
                        </nav>
                        <main className="animate-wiki-in flex-1">
                            {view === 'wiki' && <WikiPanel user={user} onLoginRequest={() => initiateLogin(false)} initialSlug={slug} />}
                            {view === 'news' && <Announcements />}
                            {view === 'team' && <Team />}
                            {view === 'streamers' && <Streamers />}
                            {view === 'academy' && <div className="bg-[var(--wiki-bg)]"><VideoSection /></div>}
                        </main>
                    </div>
                ) : (
                    <>
                        <Navbar
                            scrollRef={containerRef}
                            onNavigateToWiki={() => navigate('wiki')}
                            onNavigateToNews={() => navigate('news')}
                            onNavigateToTeam={() => navigate('team')}
                            onNavigateToAcademy={() => navigate('academy')}
                            onNavigateToAdmin={() => navigate('admin')}
                            onNavigateToCodes={() => navigate('codes')}
                            onNavigateToStreamers={() => navigate('streamers')}
                            onNavigateToShowcase={() => navigate('showcase')}
                            onLoginRequest={() => initiateLogin(false)}
                            onLogout={handleLogout}
                            user={user}
                        />
                        <main ref={containerRef} className="wiki-container overflow-x-hidden">
                            <section id="section-home" className="wiki-section bg-[#2b7dad]"><Hero onExplore={() => navigate('wiki')} onDownload={() => navigate('download')} /></section>

                            <SocialSection />

                            {/* Nouvelle Section de Présentation du Jeu - Passage de navigate pour le bouton */}
                            <GamePresentation onExplore={() => navigate('wiki')} />

                            <section id="section-game" className="wiki-section bg-[#fafbfc]"><Features /></section>
                            <section id="section-showcase" className="wiki-section"><ShowcasePreview onNavigateToShowcase={() => navigate('showcase')} /></section>
                            <section id="section-live" className="wiki-section bg-[#fafbfc]"><LivePreview onNavigateToStreamers={() => navigate('streamers')} /></section>
                            <section id="section-video" className="wiki-section bg-gradient-to-b from-[#fafbfc] to-[#e8f4ff]">
                                <div className="w-full flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
                                    <div className="glass-panel p-12 lg:p-20 rounded-[4rem] max-w-4xl w-full flex flex-col items-center gap-8 shadow-2xl bg-white/60">
                                        <div className="w-24 h-24 bg-[#2b7dad]/10 rounded-full flex items-center justify-center text-[#2b7dad] animate-pulse">
                                            <PlayCircle size={64} />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl lg:text-6xl font-black text-[#9a836b] tracking-tight">Académie Heartopia</h2>
                                            <p className="text-lg lg:text-xl text-[#9a836b]/70 font-semibold max-w-xl mx-auto">
                                                Plongez dans notre bibliothèque de tutoriels vidéo pour devenir un citoyen exemplaire.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('academy')}
                                            className="bg-[#2b7dad] text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-[#20648f] shadow-xl shadow-[#2b7dad]/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Accéder à l'Académie
                                        </button>
                                    </div>
                                </div>
                            </section>
                            <Footer
                                onAdminClick={() => navigate('admin')}
                                onTeamClick={() => navigate('team')}
                                onLegalClick={() => navigate('legal')}
                                onPrivacyClick={() => navigate('privacy')}
                            />
                        </main>
                    </>
                )}
            </>
        );
    };

    return (
        <div className="relative font-['Quicksand'] bg-[#edd29f] transition-none selection:bg-[#2b7dad] selection:text-white">

            {/* GLOBAL DISCONNECTION OVERLAY */}
            <ConnectionOverlay />

            {/* Cookie Banner is mounted globally */}
            <CookieBanner onConsentChange={setConsentGiven} />

            {/* GLOBAL NOTIFICATION (WEBSOCKET TOAST) */}
            {notification && (
                <div
                    className="fixed top-24 right-6 z-[100] animate-slide-up max-w-sm w-full px-4 sm:px-0 cursor-pointer"
                    onClick={handleNotificationClick}
                >
                    <div className={`bg-[#2b7dad] text-white p-4 rounded-2xl shadow-2xl flex gap-4 border border-white/20 relative ${notification.type === 'code' ? 'bg-gradient-to-r from-[#2b7dad] to-purple-500' : ''}`}>
                        <div className="p-2 bg-white/20 rounded-full shrink-0 h-fit">
                            {notification.type === 'code' ? <Gift size={20} className="animate-bounce" /> : <Megaphone size={20} className="animate-pulse" />}
                        </div>
                        <div className="flex-1 pr-4">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{notification.type === 'code' ? 'Code Cadeau' : 'Message Système'}</p>
                            <span className="font-bold text-sm leading-relaxed block break-words">{notification.msg}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setNotification(null); }}
                            className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Fermer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {view !== 'wiki' && view !== 'news' && view !== 'team' && view !== 'streamers' && view !== 'academy' && view !== 'showcase' && (
                <WelcomePopup onClose={handleWelcomePopupClose} />
            )}
            {showDiscordPopup && <DiscordPopup onClose={() => setShowDiscordPopup(false)} />}

            <React.Suspense fallback={
                <div className="fixed inset-0 bg-[#edd29f] z-[999] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[#2b7dad] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[#2b7dad] font-black text-xl animate-pulse">Chargement de Heartopia...</p>
                </div>
            }>
                {renderContent()}
            </React.Suspense>
        </div>
    );
};

export default App;
