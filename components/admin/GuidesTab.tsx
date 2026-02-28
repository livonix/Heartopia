
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, Compass } from 'lucide-react';
import { api } from '../../lib/apiService';

export const GuidesTab: React.FC = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    icon_url: '', 
    bubble_url: '', 
    order_index: 0 
  });

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/guides');
      setGuides(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = editingId ? `/admin/guides/${editingId}` : '/admin/guides';
    try {
      await api.fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchGuides();
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce portail ?")) return;
    try {
      await api.fetch(`/admin/guides/${id}`, { method: 'DELETE' });
      fetchGuides();
    } catch (e) { console.error(e); }
  };

  const openAdd = () => { 
    setEditingId(null); 
    setFormData({ name: '', description: '', icon_url: '', bubble_url: '', order_index: guides.length }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (g: any) => { 
    setEditingId(g.id); 
    setFormData({ 
      name: g.name, 
      description: g.description, 
      icon_url: g.icon_url, 
      bubble_url: g.bubble_url, 
      order_index: g.order_index 
    }); 
    setIsModalOpen(true); 
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Portails Guides</h2>
           <p className="text-slate-400 text-sm font-medium">Configurez les tuiles affichées sur la page d'accueil.</p>
        </div>
        <button onClick={openAdd} className="bg-[#55a4dd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4493cc] shadow-lg shadow-[#55a4dd]/20 transition-all text-xs uppercase tracking-wider">
          <Plus size={16}/> Nouveau Portail
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guides.map(g => (
          <div key={g.id} className="group relative bg-[#0f172a]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-[#55a4dd]/30 transition-all shadow-sm hover:shadow-xl overflow-hidden">
            
            {/* Background Effect */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#55a4dd]/10 rounded-full blur-[50px] group-hover:bg-[#55a4dd]/20 transition-colors pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-[#020617] rounded-2xl p-2 flex items-center justify-center border border-white/10 shadow-lg">
                        {g.icon_url ? (
                            <img src={g.icon_url} className="w-full h-full object-contain" alt=""/>
                        ) : (
                            <Compass size={24} className="text-slate-600"/>
                        )}
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase">
                        #{g.order_index}
                    </div>
                </div>

                <h3 className="text-xl font-black text-white mb-2">{g.name}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                    {g.description}
                </p>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => openEdit(g)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all">Modifier</button>
                  <button onClick={() => handleDelete(g.id)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"><Trash2 size={18}/></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-wiki-in">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Modifier' : 'Nouveau'} Portail</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Nom</label>
                  <input type="text" placeholder="Nom du guide" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white font-bold focus:border-[#55a4dd] outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Description</label>
                  <textarea placeholder="Description courte..." required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm min-h-[100px] resize-none focus:border-[#55a4dd] outline-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">URL Icône</label>
                      <input type="text" placeholder="https://..." required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#55a4dd] outline-none" value={formData.icon_url} onChange={e => setFormData({...formData, icon_url: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Ordre</label>
                      <input type="number" className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white font-bold focus:border-[#55a4dd] outline-none" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} />
                  </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-[#55a4dd] hover:bg-[#4493cc] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#55a4dd]/20 transition-all">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
