
import React, { useState, useEffect, useCallback } from 'react';
import { Check, MessageSquare, Link, Loader2, User } from 'lucide-react';
import { api } from '../../lib/apiService';
import type { AdminComment, CommentStatus } from '../../types';

export const CommentsTab: React.FC = () => {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CommentStatus | 'all'>('all');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const data = await api.fetch(`/admin/comments${query}`);
      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleMarkHandled = async (id: number) => {
    try {
      await api.fetch(`/admin/comments/${id}/handle`, { method: 'PUT' });
      setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'handled', handled_at: new Date().toISOString() } : c));
    } catch (e) {
      console.error("Erreur marquage:", e);
      alert("Erreur lors du marquage comme traité");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h2 className="text-3xl font-black text-white">Modération</h2>
            <p className="text-slate-400 text-sm font-medium">Gérez les interactions communautaires.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CommentStatus | 'all')}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 focus:outline-none focus:border-[#55a4dd]/50"
          >
            <option value="all">Tous</option>
            <option value="open">Ouverts</option>
            <option value="handled">Traités</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-300">
            <MessageSquare size={14} /> {comments.length} Commentaires
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#55a4dd]" size={40} />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-white">C'est calme par ici</h3>
            <p className="text-slate-500 font-medium">Aucun commentaire en attente de modération.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className={`group bg-[#0f172a] p-6 rounded-3xl border ${comment.status === 'handled' ? 'border-green-500/20' : 'border-white/5'} hover:border-[#55a4dd]/30 transition-all shadow-sm hover:shadow-lg flex flex-col sm:flex-row gap-6 relative overflow-hidden`}>
              {/* Left Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${comment.status === 'handled' ? 'bg-green-500' : 'bg-[#55a4dd]'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

              {/* User Info */}
              <div className="flex-shrink-0 flex sm:flex-col items-center gap-3 min-w-[100px] border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0 sm:pr-6">
                <div className="relative">
                    <img 
                        src={comment.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                        alt={comment.username} 
                        className="w-12 h-12 rounded-xl border border-white/10 object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#5865F2] p-0.5 rounded-full border border-[#0f172a]">
                        <User size={10} className="text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-white truncate max-w-[100px]">{comment.username}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatDate(comment.created_at)}</p>
                    {comment.status === 'handled' && comment.handled_at && (
                      <p className="text-[10px] text-green-500 font-mono mt-1">Traité: {formatDate(comment.handled_at)}</p>
                    )}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-[#55a4dd] uppercase tracking-widest bg-[#55a4dd]/10 px-2 py-1 rounded-md border border-[#55a4dd]/20">
                        <Link size={10} className="inline mr-1" />
                        {comment.section_title || `Section #${comment.section_id}`}
                    </span>
                    {comment.status === 'handled' && (
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                        <Check size={10} className="inline mr-1" />
                        Traité
                      </span>
                    )}
                </div>
                
                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                    {comment.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col justify-end gap-2 pl-4 sm:border-l border-white/5">
                {comment.status === 'open' && (
                  <button 
                      onClick={() => handleMarkHandled(comment.id)}
                      className="p-3 bg-white/5 hover:bg-green-500/20 text-slate-400 hover:text-green-400 rounded-xl transition-all group/btn"
                      title="Marquer comme traité"
                  >
                      <Check size={18} className="transition-transform group-hover/btn:scale-110" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
