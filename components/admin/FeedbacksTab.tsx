
import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Calendar, Bug, Lightbulb, PenTool, Loader2 } from 'lucide-react';
import { api } from '../../lib/apiService';

export const FeedbacksTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/admin/feedbacks');
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Marquer ce feedback comme traité/supprimé ?")) return;
    try {
      await api.fetch(`/admin/feedbacks/${id}`, { method: 'DELETE' });
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error("Erreur suppression:", e);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'bug': return <Bug size={18} className="text-red-400" />;
        case 'suggestion': return <Lightbulb size={18} className="text-amber-400" />;
        default: return <PenTool size={18} className="text-[#55a4dd]" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
        case 'bug': return { label: 'Bug Report', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        case 'suggestion': return { label: 'Suggestion', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        default: return { label: 'Autre', color: 'bg-[#55a4dd]/10 text-[#55a4dd] border-[#55a4dd]/20' };
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h2 className="text-3xl font-black text-white">Retours Utilisateurs</h2>
            <p className="text-slate-400 text-sm font-medium">Bugs, suggestions et avis de la communauté.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#55a4dd]" size={40} />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-white">Tout est calme</h3>
            <p className="text-slate-500 font-medium">Aucun feedback en attente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((fb) => {
            const typeStyle = getTypeLabel(fb.type);
            return (
                <div key={fb.id} className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 hover:border-[#55a4dd]/30 transition-all shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${typeStyle.color} text-[10px] font-black uppercase tracking-widest`}>
                            {getIcon(fb.type)}
                            {typeStyle.label}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar size={10} /> {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex-1 bg-[#020617] p-4 rounded-2xl border border-white/5 mb-4">
                        <p className="text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {fb.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                            <img src={fb.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full bg-slate-800" alt="" />
                            <span className="text-xs font-bold text-white">{fb.username}</span>
                        </div>
                        <button 
                            onClick={() => handleDelete(fb.id)}
                            className="p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Marquer comme traité"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
