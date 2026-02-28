
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { api } from '../../lib/apiService';

export const TeamTab: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ discord_id: '', role: '', description: '' });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/team');
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = editingId ? `/admin/team/${editingId}` : '/admin/team';
    try {
      await api.fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchTeam();
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await api.fetch(`/admin/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (e) { console.error(e); }
  };

  const openAdd = () => { setEditingId(null); setFormData({ discord_id: '', role: '', description: '' }); setIsModalOpen(true); };
  const openEdit = (m: any) => { setEditingId(m.id); setFormData({ discord_id: m.discord_id || '', role: m.role, description: m.description }); setIsModalOpen(true); };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Gestion de l'Équipe</h2>
           <p className="text-slate-400 text-sm font-medium">Gérez les membres affichés sur la page "L'Équipe".</p>
        </div>
        <button onClick={openAdd} className="bg-[#55a4dd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4493cc] shadow-lg shadow-[#55a4dd]/20 transition-all text-xs uppercase tracking-wider">
          <Plus size={16}/> Ajouter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map(m => (
          <div key={m.id} className="bg-[#0f172a]/60 backdrop-blur-md p-1 rounded-[2.5rem] border border-white/5 hover:border-[#55a4dd]/30 transition-all group shadow-sm hover:shadow-xl">
            <div className="bg-[#0f172a] rounded-[2.3rem] p-6 h-full flex flex-col relative overflow-hidden">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#55a4dd]/10 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-br from-[#55a4dd] to-purple-500 mb-4 shadow-lg group-hover:scale-105 transition-transform">
                       <img src={m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-full h-full rounded-[0.9rem] object-cover bg-[#0f172a]" alt={m.name}/>
                    </div>
                    
                    <h3 className="text-lg font-black text-white mb-1">{m.name}</h3>
                    <div className="px-3 py-1 bg-[#55a4dd]/10 text-[#55a4dd] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#55a4dd]/20">
                        {m.role}
                    </div>
                </div>

                <div className="mt-6 flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic text-center line-clamp-3">
                        "{m.description}"
                    </p>
                </div>

                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => openEdit(m)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
                      <Edit2 size={14} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all">
                      <Trash2 size={16}/>
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-wiki-in">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#55a4dd] to-purple-500"></div>
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <User size={24} className="text-[#55a4dd]" /> 
                        {editingId ? 'Modifier Membre' : 'Nouveau Membre'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">ID Discord</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Ex: 1459651039945818122" 
                            required 
                            className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white font-mono text-sm focus:border-[#55a4dd] outline-none transition-all group-hover:border-white/20" 
                            value={formData.discord_id} 
                            onChange={e => setFormData({...formData, discord_id: e.target.value})} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 px-1 font-medium">L'avatar et le pseudo sont synchronisés automatiquement.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Rôle</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Fondateur" 
                        required 
                        className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white font-bold focus:border-[#55a4dd] outline-none transition-all" 
                        value={formData.role} 
                        onChange={e => setFormData({...formData, role: e.target.value})} 
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Citation / Description</label>
                    <textarea 
                        placeholder="Une petite phrase sympa..." 
                        className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white min-h-[100px] text-sm focus:border-[#55a4dd] outline-none resize-none transition-all" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Annuler</button>
                    <button type="submit" disabled={loading} className="flex-[2] py-4 bg-[#55a4dd] hover:bg-[#4493cc] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#55a4dd]/20">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Enregistrer
                    </button>
                </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
