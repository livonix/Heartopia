import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GamePresentation } from './components/GamePresentation';
import { Features } from './components/Features';
import { VideoSection } from './components/VideoSection';
import { PreReg } from './components/PreReg';
import { Footer } from './components/Footer';
import { WikiPanel } from './components/WikiPanel';
import { Team } from './components/Team';
import { Announcements } from './components/Announcements';
import { Streamers } from './components/Streamers';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { RedeemCodes } from './components/RedeemCodes';
import { MaintenancePage } from './components/MaintenancePage';
import { DownloadPage } from './components/DownloadPage';
import { Feedback } from './components/Feedback';
import { LegalPage } from './components/LegalPage';
import { DiscordPopup } from './components/DiscordPopup';
import { WelcomePopup } from './components/WelcomePopup';
import { CookieBanner } from './components/CookieBanner';
import { ConnectionOverlay } from './components/ConnectionOverlay';
import { LivePreview } from './components/LivePreview';
import { CommandMenu } from './components/CommandMenu';
import { Showcase } from './components/Showcase';
import { TradingPost } from './components/TradingPost';
import { api } from './lib/apiService';

export type WikiView = 'home' | 'faune' | 'flore' | 'artisanat' | 'mobilier' | 'personnages' | 'guides';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [wikiSlug, setWikiSlug] = useState<string | undefined>(undefined);
  const [showDiscordPopup, setShowDiscordPopup] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('heartopia_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    checkAuth();

    // Discord Popup Logic
    const popupSeen = localStorage.getItem('heartopia_discord_popup_shown');
    if (!popupSeen) {
      const timer = setTimeout(() => setShowDiscordPopup(true), 15000);
      return () => clearTimeout(timer);
    }

    // Command Palette Shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = () => {
    // Simulation Login
    const mockUser = {
      id: '123',
      username: 'Traveler',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      role: 'admin', // Auto admin for demo
      isAdmin: true
    };
    localStorage.setItem('heartopia_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('heartopia_user');
    setUser(null);
    setView('home');
  };

  const navigateTo = (target: string, params?: any) => {
    if (target === 'wiki' && params?.slug) {
        setWikiSlug(params.slug);
    } else {
        setWikiSlug(undefined);
    }
    setView(target);
    window.scrollTo(0, 0);
  };

  // --- RENDER VIEWS ---

  if (view === 'admin_login') {
    return <AdminLogin onBack={() => setView('home')} onLoginSuccess={(u) => { setUser(u); setView('admin_dashboard'); }} />;
  }

  if (view === 'admin_dashboard') {
    return <AdminDashboard user={user} onLogout={handleLogout} onBack={() => setView('home')} />;
  }

  if (view === 'download') {
    return <DownloadPage onBack={() => setView('home')} />;
  }

  if (view === 'feedback') {
    return <Feedback onBack={() => setView('home')} user={user} onLoginRequest={handleLogin} />;
  }

  if (view === 'legal') {
    return <LegalPage type="legal" onBack={() => setView('home')} />;
  }

  if (view === 'privacy') {
    return <LegalPage type="privacy" onBack={() => setView('home')} />;
  }

  if (view === 'showcase') {
    return <Showcase onBack={() => setView('home')} user={user} onLoginRequest={handleLogin} />;
  }

  if (view === 'trading') {
    return <TradingPost onBack={() => setView('home')} user={user} onLoginRequest={handleLogin} />;
  }

  // MAIN LAYOUT
  return (
    <div className="min-h-screen bg-[#fafbfc] font-['Quicksand'] relative" ref={scrollRef}>
      <ConnectionOverlay />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onNavigate={navigateTo} />
      
      {showDiscordPopup && <DiscordPopup onClose={() => setShowDiscordPopup(false)} />}
      <WelcomePopup />
      <CookieBanner onConsentChange={() => {}} />

      <Navbar 
        scrollRef={scrollRef}
        onNavigateToWiki={() => navigateTo('wiki')}
        onNavigateToNews={() => navigateTo('announcements')}
        onNavigateToTeam={() => navigateTo('team')}
        onNavigateToAcademy={() => navigateTo('academy')}
        onNavigateToShowcase={() => navigateTo('showcase')}
        onNavigateToAdmin={() => user?.isAdmin ? navigateTo('admin_dashboard') : navigateTo('admin_login')}
        onNavigateToCodes={() => navigateTo('codes')}
        onNavigateToStreamers={() => navigateTo('streamers')}
        onLoginRequest={handleLogin}
        onNavigateToFeedback={() => navigateTo('feedback')}
        onLogout={handleLogout}
        user={user}
      />

      {view === 'home' && (
        <>
          <div id="section-home"><Hero onExplore={() => navigateTo('wiki')} onDownload={() => navigateTo('download')} /></div>
          <GamePresentation onExplore={() => navigateTo('wiki')} />
          <div id="section-game"><Features /></div>
          <PreReg />
          <div id="section-video"><VideoSection /></div>
          <LivePreview onNavigateToStreamers={() => navigateTo('streamers')} />
        </>
      )}

      {view === 'wiki' && (
        <WikiPanel user={user} onLoginRequest={handleLogin} initialSlug={wikiSlug} />
      )}

      {view === 'announcements' && <Announcements />}
      {view === 'team' && <Team />}
      {view === 'academy' && <div className="pt-20"><VideoSection /></div>}
      {view === 'streamers' && <Streamers />}
      {view === 'codes' && <RedeemCodes onBack={() => setView('home')} />}

      <Footer 
        onAdminClick={() => user?.isAdmin ? navigateTo('admin_dashboard') : navigateTo('admin_login')}
        onTeamClick={() => navigateTo('team')}
        onLegalClick={() => navigateTo('legal')}
        onPrivacyClick={() => navigateTo('privacy')}
        onFeedbackClick={() => navigateTo('feedback')}
      />
    </div>
  );
}

export default App;
