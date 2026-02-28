
import React, { useState } from 'react';
import { FileText, Layers, Users, Activity, ArrowUpRight, MousePointer2, UserCheck, HardDrive, BarChart3, Globe, UserPlus, Megaphone, Send, CheckCircle } from 'lucide-react';
import { api } from '../../lib/apiService';

interface StatsTabProps {
  stats: any;
  loading: boolean;
}

export const StatsTab: React.FC<StatsTabProps> = ({ stats, loading }) => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const cards = [
    { label: "Visiteurs Uniques (Total)", value: stats?.uniqueVisitors || 0, icon: UserCheck, color: "from-purple-500 to-indigo-600", trend: "Global" },
    { label: "Nouveaux (Ce Jour)", value: stats?.newUniqueToday || 0, icon: UserPlus, color: "from-pink-500 to-rose-600", trend: "+24h" },
    { label: "Visites Aujourd'hui", value: stats?.todayVisits || 0, icon: Activity, color: "from-emerald-500 to-teal-600", trend: "Trafic" },
    { label: "Total Hits", value: stats?.totalVisits || 0, icon: MousePointer2, color: "from-blue-500 to-cyan-600", trend: "All Time" },
  ];

  const handleBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!broadcastMessage.trim()) return;
      setIsSending(true);
      try {
          await api.fetch('/admin/broadcast', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ message: broadcastMessage })
          });
          setBroadcastMessage('');
          setSendSuccess(true);
          setTimeout(() => setSendSuccess(false), 3000);
      } catch(e) {
          alert("Erreur lors de l'envoi");
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h2>
          <p className="text-gray-600 font-medium text-sm">Bienvenue sur l'interface d'administration. Voici ce qui se passe aujourd'hui.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">Derniers 24h</button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">Temps réel</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group relative overflow-hidden">
             {/* Decorative Background */}
             <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${s.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
             
             <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm`}>
                  <s.icon size={22} />
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                  <ArrowUpRight size={12} className="text-green-600" />
                  <span className="text-[10px] font-medium text-green-600">{s.trend}</span>
                </div>
             </div>
             
             <div className="relative z-10">
               <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                 {loading ? <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div> : s.value.toLocaleString()}
               </div>
               <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{s.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Content & System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wiki Status */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><BarChart3 size={20} /></div>
                    <h3 className="text-xl font-bold text-gray-900">Contenu du Wiki</h3>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">Voir détails</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-5">
                      <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                          <FileText size={24} />
                      </div>
                      <div>
                          <div className="text-3xl font-bold text-gray-900">{stats?.pages || 0}</div>
                          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pages Publiées</div>
                      </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-5">
                      <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                          <Layers size={24} />
                      </div>
                      <div>
                          <div className="text-3xl font-bold text-gray-900">{stats?.categories || 0}</div>
                          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Catégories</div>
                      </div>
                  </div>
              </div>
          </div>

          {/* System Status & Broadcast Widget */}
          <div className="flex flex-col gap-6">
              
              {/* Broadcast Widget */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Megaphone size={18} /></div>
                      <h4 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Broadcast Live</h4>
                  </div>
                  <form onSubmit={handleBroadcast} className="flex gap-2">
                      <input 
                        type="text" 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Message système..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 outline-none placeholder:text-gray-500 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={isSending || !broadcastMessage}
                        className={`p-2.5 rounded-lg text-white transition-all ${sendSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'}`}
                      >
                          {sendSuccess ? <CheckCircle size={16} /> : <Send size={16} />}
                      </button>
                  </form>
                  <p className="mt-2 text-[10px] text-gray-500 font-medium">Envoie une notification push instantanée à tous les visiteurs connectés.</p>
              </div>

              {/* System Widget */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><HardDrive size={20} /></div>
                        <h4 className="text-gray-900 font-semibold text-lg">Système</h4>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-medium text-green-600 uppercase">En Ligne</span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-600">
                           <span>CPU Usage</span>
                           <span className="text-gray-900">12%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-green-600 w-[12%] rounded-full"></div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-600">
                           <span>Database Connections</span>
                           <span className="text-gray-900">4/10</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 w-[40%] rounded-full"></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                     <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Globe size={14} />
                        <span>IP Audit: <span className="text-gray-900 font-mono">Actif</span></span>
                     </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
