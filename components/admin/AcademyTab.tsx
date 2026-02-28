
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, Play, Film, Smartphone, Monitor } from 'lucide-react';
import { api } from '../../lib/apiService';

export const AcademyTab: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    duration: '', 
    type: 'Tuto', 
    video_url: '', 
    poster_url: '',
    order_index: 0 
  });

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/admin/academy');
      setVideos(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = editingId ? `/admin/academy/${editingId}` : '/admin/academy';
    try {
      await api.fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchVideos();
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    try {
      await api.fetch(`/admin/academy/${id}`, { method: 'DELETE' });
      fetchVideos();
    } catch (e) { console.error(e); }
  };

  const openAdd = () => { 
    setEditingId(null); 
    setFormData({ title: '', duration: '', type: 'Tuto', video_url: '', poster_url: '', order_index: videos.length }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (v: any) => { 
    setEditingId(v.id); 
    setFormData({ 
      title: v.title, 
      duration: v.duration, 
      type: v.type, 
      video_url: v.video_url, 
      poster_url: v.poster_url,
      order_index: v.order_index 
    }); 
    setIsModalOpen(true); 
  };

  const getPlatform = (url: string) => {
      if (url.includes('tiktok.com')) return { icon: Smartphone, label: 'TikTok', color: 'bg-black border-white/20' };
      if (url.includes('youtu')) return { icon: Monitor, label: 'YouTube', color: 'bg-red-600 border-red-500' };
      return { icon: Film, label: 'Fichier', color: 'bg-[#55a4dd] border-[#55a4dd]' };
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Médiathèque Academy</h2>
           <p className="text-slate-400 text-sm font-medium">Gérez les tutoriels. Supporte YouTube (16:9) et TikTok (9:16).</p>
        </div>
        <button onClick={openAdd} className="bg-[#55a4dd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4493cc] shadow-lg shadow-[#55a4dd]/20 transition-all text-xs uppercase tracking-wider">
          <Plus size={16}/> Ajouter une vidéo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map(v => {
          const platform = getPlatform(v.video_url);
          const PlatformIcon = platform.icon;
          
          return (
          <div key={v.id} className="group bg-[#0f172a] rounded-[2rem] border border-white/5 relative overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:border-[#55a4dd]/30">
            {/* Thumbnail */}
            <div className={`bg-black relative overflow-hidden ${platform.label === 'TikTok' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <img src={v.poster_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                </div>

                <div className={`absolute top-4 right-4 flex items-center gap-2 ${platform.color} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border`}>
                    <PlatformIcon size={12} /> {platform.label}
                </div>

                <div className="absolute top-4 left-4 bg-[#55a4dd]/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg border border-white/10">
                    {v.type}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                    {v.duration}
                </div>
            </div>
            
            <div className="p-5 flex flex-col justify-between bg-[#0f172a]">
                <h3 className="text-base font-bold text-white leading-tight line-clamp-2 mb-4" title={v.title}>{v.title}</h3>
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button onClick={() => openEdit(v)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">Modifier</button>
                  <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </div>
            </div>
          </div>
        )})}
        
        {videos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-[2rem]">
                <Film size={40} className="mb-4 opacity-50"/>
                <p className="font-bold">Aucune vidéo dans la bibliothèque.</p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-wiki-in">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Modifier Vidéo' : 'Nouvelle Vidéo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Titre</label>
                  <input type="text" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Durée</label>
                      <input type="text" placeholder="12:45" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Type</label>
                      <select className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option>Tuto</option>
                          <option>Event</option>
                          <option>Découverte</option>
                      </select>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Lien Vidéo</label>
                  <input type="text" placeholder="https://youtube.com/... ou https://tiktok.com/..." required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#55a4dd] outline-none" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                  <p className="text-[10px] text-slate-500 px-1">Le format (Paysage/Portrait) sera détecté automatiquement selon le lien.</p>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">URL Miniature</label>
                  <input type="text" placeholder="https://..." required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#55a4dd] outline-none" value={formData.poster_url} onChange={e => setFormData({...formData, poster_url: e.target.value})} />
              </div>
            </form>
            <div className="px-8 py-6 bg-[#020617] border-t border-white/5 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Annuler</button>
              <button onClick={(e) => handleSave(e as any)} type="submit" disabled={loading} className="flex-[2] py-4 bg-[#55a4dd] hover:bg-[#4493cc] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#55a4dd]/20 transition-all">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
