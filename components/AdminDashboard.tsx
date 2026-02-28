
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  LogOut, 
  Compass,
  ChevronRight,
  Monitor,
  PlaySquare,
  Loader2,
  Cloud,
  RefreshCw,
  Menu as MenuIcon,
  X,
  MessageSquare,
  Search,
  Bell,
  Gift,
  Megaphone,
  Inbox,
  UserCog,
  Power,
  BarChart2,
  Languages,
  Eye
} from 'lucide-react';
import { api } from '../lib/apiService';
import { useSocket } from '../lib/socketContext';
import type { User } from '../types';

const StatsTab = lazy(() => import('./admin/StatsTab').then(m => ({ default: m.StatsTab })));
const TeamTab = lazy(() => import('./admin/TeamTab').then(m => ({ default: m.TeamTab })));
const WikiTab = lazy(() => import('./admin/WikiTab').then(m => ({ default: m.WikiTab })));
const GuidesTab = lazy(() => import('./admin/GuidesTab').then(m => ({ default: m.GuidesTab })));
const AcademyTab = lazy(() => import('./admin/AcademyTab').then(m => ({ default: m.AcademyTab })));
const CommentsTab = lazy(() => import('./admin/CommentsTab').then(m => ({ default: m.CommentsTab })));
const CodesTab = lazy(() => import('./admin/CodesTab').then(m => ({ default: m.CodesTab })));
const AnnouncementsTab = lazy(() => import('./admin/AnnouncementsTab').then(m => ({ default: m.AnnouncementsTab })));
const UsersTab = lazy(() => import('./admin/UsersTab').then(m => ({ default: m.UsersTab })));
const AnalyticsTab = lazy(() => import('./admin/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const TranslationsTab = lazy(() => import('./admin/TranslationsTab').then(m => ({ default: m.TranslationsTab })));

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

const TabLoader = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Chargement du module...</span>
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [dbStats, setDbStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState(api.getMode());
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  
  // Utilisation du contexte WebSocket pour le compteur temps réel
  const { onlineUsers } = useSocket();

  const fetchStats = async () => {
    try {
      const stats = await api.fetch('/admin/stats');
      setDbStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStatus = async () => {
      try {
          const res = await api.fetch('/admin/maintenance');
          setMaintenanceMode(res.enabled);
      } catch(e) {
          console.error("Failed to fetch maintenance status", e);
      }
  };

  useEffect(() => {
    fetchStats();
    fetchMaintenanceStatus();
  }, []);

  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    const isConnected = await api.checkConnection();
    setMode(api.getMode());
    if (isConnected) {
      await fetchStats();
      await fetchMaintenanceStatus();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleMaintenance = async () => {
      if(!confirm(maintenanceMode ? "Désactiver le mode maintenance ?" : "ACTIVER le mode maintenance ? Le site sera inaccessible aux visiteurs.")) return;
      
      setTogglingMaintenance(true);
      try {
          const res = await api.fetch('/admin/maintenance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enabled: !maintenanceMode })
          });
          if(res.success) setMaintenanceMode(res.enabled);
      } catch(e) {
          alert("Erreur lors du changement de mode");
      } finally {
          setTogglingMaintenance(false);
      }
  };

  // --- ROLE BASED ACCESS LOGIC ---
  const role = user.role || 'guest';

  // Define All tabs
  const allTabs = [
    { id: 'stats', label: 'Vue d\'ensemble', icon: LayoutDashboard, roles: ['support', 'moderator', 'admin'] },
    { id: 'analytics', label: 'Analytics GDPR', icon: BarChart2, roles: ['admin'] },
    { id: 'translations', label: 'Traduction IA', icon: Languages, roles: ['admin'] },
    { id: 'wiki', label: 'Gestion Wiki', icon: BookOpen, roles: ['moderator', 'admin'] },
    { id: 'announcements', label: 'Annonces & News', icon: Megaphone, roles: ['moderator', 'admin'] },
    { id: 'guides', label: 'Portails Guides', icon: Compass, roles: ['moderator', 'admin'] },
    { id: 'academy', label: 'Académie Vidéo', icon: PlaySquare, roles: ['moderator', 'admin'] },
    { id: 'codes', label: 'Codes Cadeaux', icon: Gift, roles: ['moderator', 'admin'] },
    { id: 'comments', label: 'Modération', icon: MessageSquare, roles: ['moderator', 'admin'] },
        { id: 'team', label: 'Staff & Rôles', icon: Users, roles: ['admin'] },
    { id: 'users', label: 'Utilisateurs', icon: UserCog, roles: ['admin'] },
  ];

  // Filter based on role
  const navItems = allTabs.filter(tab => tab.roles.includes(role));

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  // Redirect guest or restricted user if they land on unauthorized page
  if (!navItems.find(t => t.id === activeTab)) {
      if (navItems.length > 0) setActiveTab(navItems[0].id);
  }

  if (role === 'guest') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center font-sans">
              <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full shadow-lg">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h1>
                  <p className="text-gray-600 text-sm mb-8">
                      Votre compte a été créé avec le rôle <strong>Visiteur</strong>. 
                      Veuillez contacter un administrateur pour obtenir les droits d'accès au dashboard.
                  </p>
                  <button onClick={onBack} className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-widest transition-colors w-full mb-3">
                      Retour au site
                  </button>
                  <button onClick={onLogout} className="text-red-600 hover:text-red-700 text-xs font-semibold uppercase tracking-widest">
                      Déconnexion
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen font-sans flex bg-gray-100 text-gray-900 overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-white border-r border-gray-200 flex flex-col 
        transition-transform duration-300 ease-out shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Monitor size={18} />
            </div>
            <div>
              <h1 className="text-gray-900 font-semibold text-lg">Admin Panel</h1>
              <p className="text-gray-500 text-xs">Version 2.2</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${mode === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              {mode === 'live' ? 'Live' : 'Demo'}
            </span>
            <span>{role}</span>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50">
        
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <MenuIcon size={20} />
              </button>
              <button onClick={onBack} className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={16} className="rotate-180" /> Retour
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{onlineUsers} en ligne</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell size={18} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                  <img src={user?.avatar} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<TabLoader />}>
              {activeTab === 'stats' && <StatsTab stats={dbStats} loading={loading} />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'translations' && <TranslationsTab />}
              {activeTab === 'team' && <TeamTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'wiki' && <WikiTab />}
              {activeTab === 'guides' && <GuidesTab />}
              {activeTab === 'academy' && <AcademyTab />}
              {activeTab === 'comments' && <CommentsTab />}
              {activeTab === 'codes' && <CodesTab />}
              {activeTab === 'announcements' && <AnnouncementsTab />}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};