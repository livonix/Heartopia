
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, Megaphone } from 'lucide-react';
import { api } from '../../lib/apiService';

// Styles des tags mappés statiquement pour Tailwind
const TAG_STYLES: Record<string, string> = {
  'Mise à jour': 'bg-purple-500',
  'Maintenance': 'bg-amber-500',
  'Info': 'bg-[#55a4dd]',
  'Événement': 'bg-pink-500'
};

export const AnnouncementsTab: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    tag: 'Info', 
    content: '', 
    image_url: '',
    is_pinned: false 
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/admin/announcements');
      setNews(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = editingId ? `/admin/announcements/${editingId}` : '/admin/announcements';
    try {
      await api.fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchNews();
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await api.fetch(`/admin/announcements/${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (e) { console.error(e); }
  };

  const openAdd = () => { 
    setEditingId(null); 
    setFormData({ title: '', tag: 'Info', content: '', image_url: '', is_pinned: false }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (n: any) => { 
    setEditingId(n.id); 
    setFormData({ 
      title: n.title, 
      tag: n.tag, 
      content: n.content, 
      image_url: n.image_url,
      is_pinned: Boolean(n.is_pinned)
    }); 
    setIsModalOpen(true); 
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Annonces Officielles</h2>
           <p className="text-slate-400 text-sm font-medium">Publiez des mises à jour et des news pour la communauté.</p>
        </div>
        <button onClick={openAdd} className="bg-[#55a4dd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4493cc] shadow-lg shadow-[#55a4dd]/20 transition-all text-xs uppercase tracking-wider">
          <Plus size={16}/> Nouvelle Annonce
        </button>
      </div>

      <div className="grid gap-6">
        {news.map(n => (
          <div key={n.id} className="group bg-[#0f172a] p-6 rounded-3xl border border-white/5 hover:border-[#55a4dd]/30 transition-all flex flex-col md:flex-row gap-6">
            
            {/* Thumbnail */}
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-black/20 flex-shrink-0 relative border border-white/5">
                {n.image_url ? (
                    <img src={n.image_url} className="w-full h-full object-cover opacity-80" alt=""/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Megaphone size={24}/></div>
                )}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${TAG_STYLES[n.tag] || 'bg-[#55a4dd]'}`}>
                    {n.tag}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">{n.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{n.content}</p>
                </div>
                
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                  <span className="mr-auto text-[10px] text-slate-600 font-mono">{new Date(n.created_at).toLocaleDateString()}</span>
                  <button onClick={() => openEdit(n)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">Modifier</button>
                  <button onClick={() => handleDelete(n.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </div>
            </div>
          </div>
        ))}
        
        {news.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-[2rem]">
                <Megaphone size={40} className="mb-4 opacity-50"/>
                <p className="font-bold">Aucune annonce publiée.</p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-wiki-in">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Modifier Annonce' : 'Nouvelle Annonce'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Titre</label>
                  <input type="text" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Tag</label>
                      <select className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none appearance-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}>
                          <option>Info</option>
                          <option>Mise à jour</option>
                          <option>Maintenance</option>
                          <option>Événement</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">URL Image (Optionnel)</label>
                      <input type="text" placeholder="https://..." className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#55a4dd] outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Contenu</label>
                  <textarea required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none min-h-[200px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Détails de l'annonce..." />
              </div>
            </form>
            <div className="px-8 py-6 bg-[#020617] border-t border-white/5 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Annuler</button>
              <button onClick={(e) => handleSave(e as any)} type="submit" disabled={loading} className="flex-[2] py-4 bg-[#55a4dd] hover:bg-[#4493cc] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#55a4dd]/20 transition-all">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
