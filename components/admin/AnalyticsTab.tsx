
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiService';
import { BarChart3, Users, MousePointer2, Chrome, Loader2, RefreshCw } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.fetch('/admin/analytics');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#55a4dd]" size={40} /></div>;

  // Sécurisation si data est vide ou mal formé
  const pages = data?.pages || [];
  const browsers = data?.browsers || [];
  const dailyUnique = data?.dailyUnique || [];

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-white">Analytics GDPR</h2>
            <p className="text-slate-400 text-sm font-medium">Données anonymisées des utilisateurs ayant accepté le tracking.</p>
        </div>
        <button onClick={fetchAnalytics} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Top Pages */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6 text-[#55a4dd]">
                <MousePointer2 size={20} />
                <h3 className="font-black text-white uppercase tracking-widest text-xs">Pages les plus vues</h3>
            </div>
            <div className="space-y-4">
                {pages.length > 0 ? pages.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 w-4">{i+1}</span>
                            <span className="text-sm font-medium text-slate-300 truncate max-w-[150px]">{p.page_path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#55a4dd]" style={{width: `${Math.min(100, (p.views / (pages[0]?.views || 1)) * 100)}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-white">{p.views}</span>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-xs italic">Aucune donnée disponible</p>
                )}
            </div>
        </div>

        {/* Browser Stats */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6 text-purple-400">
                <Chrome size={20} />
                <h3 className="font-black text-white uppercase tracking-widest text-xs">Navigateurs</h3>
            </div>
            <div className="flex flex-wrap gap-4">
                {browsers.length > 0 ? browsers.map((b: any, i: number) => (
                    <div key={i} className="flex-1 min-w-[100px] bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{b.count}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{b.browser}</span>
                    </div>
                )) : (
                    <p className="text-slate-500 text-xs italic">Aucune donnée disponible</p>
                )}
            </div>
        </div>

        {/* Daily Unique */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 text-emerald-400">
                <Users size={20} />
                <h3 className="font-black text-white uppercase tracking-widest text-xs">Visiteurs Uniques (7j)</h3>
            </div>
            <div className="flex items-end justify-between h-40 gap-2">
                {dailyUnique.length > 0 ? dailyUnique.map((d: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-emerald-500/20 rounded-t-lg relative group h-full flex items-end">
                            <div className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-400" style={{height: `${Math.max(10, d.visitors * 5)}%`}}></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {d.visitors}
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(d.date).toLocaleDateString('fr', {weekday: 'short'})}</span>
                    </div>
                )) : (
                    <p className="text-slate-500 text-xs italic w-full text-center mt-20">Aucune donnée historique</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
