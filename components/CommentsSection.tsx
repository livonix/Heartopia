
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, LogIn } from 'lucide-react';
import { API_URL } from '../constants';

interface CommentsSectionProps {
  sectionId: string | number;
  user: any;
  onLoginRequest: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ sectionId, user, onLoginRequest }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [sectionId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comments/${sectionId}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: sectionId,
          username: user.username,
          avatar: user.avatar,
          content: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="mt-12 bg-white/60 rounded-[2rem] border border-[#e6dccf] p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-[#2b7dad]" size={20} />
        <h3 className="text-xl font-black text-[#5e4d3b]">Espace Communautaire</h3>
        <span className="bg-[#2b7dad]/10 text-[#2b7dad] text-xs font-bold px-2 py-1 rounded-full">{comments.length}</span>
      </div>

      {/* Formulaire */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Me" />
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre astuce ou posez une question..."
                className="flex-1 bg-white border border-[#e6dccf] rounded-2xl p-4 text-sm font-medium text-[#5e4d3b] focus:outline-none focus:border-[#2b7dad] focus:ring-2 focus:ring-[#2b7dad]/10 resize-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting || !newComment.trim()}
                className="bg-[#2b7dad] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#20648f] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publier
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#f3f3f3] rounded-2xl p-6 text-center border-2 border-dashed border-[#e6dccf]">
            <p className="text-[#9a836b] font-bold text-sm mb-4">Connectez-vous pour rejoindre la discussion</p>
            <button 
              onClick={onLoginRequest}
              className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#4752C4] transition-all shadow-lg shadow-[#5865F2]/20"
            >
              <LogIn size={16} /> Connexion Discord
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#2b7dad]" /></div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="flex-shrink-0">
                <img src={comment.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={comment.username} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-[#5e4d3b] text-sm">{comment.username}</span>
                  <span className="text-[10px] font-bold text-[#9a836b] opacity-60">{formatDate(comment.created_at)}</span>
                </div>
                <div className="bg-white p-4 rounded-r-2xl rounded-bl-2xl text-sm font-medium text-[#7c6a55] leading-relaxed shadow-sm border border-[#f3f3f3]">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-[#9a836b] text-xs font-bold italic opacity-60">Aucun commentaire pour le moment. Soyez le premier !</p>
        )}
      </div>
    </div>
  );
};
