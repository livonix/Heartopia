
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, Gift, Copy, Check } from 'lucide-react';
import { api } from '../../lib/apiService';

export const CodesTab: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    reward: '', 
    status: 'active', 
    description: ''
  });

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/admin/codes');
      setCodes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = editingId ? `/admin/codes/${editingId}` : '/admin/codes';
    try {
      await api.fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchCodes();
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce code ?")) return;
    try {
      await api.fetch(`/admin/codes/${id}`, { method: 'DELETE' });
      fetchCodes();
    } catch (e) { console.error(e); }
  };

  const openAdd = () => { 
    setEditingId(null); 
    setFormData({ code: '', reward: '', status: 'active', description: '' }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (c: any) => { 
    setEditingId(c.id); 
    setFormData({ 
      code: c.code, 
      reward: c.reward, 
      status: c.status, 
      description: c.description 
    }); 
    setIsModalOpen(true); 
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Codes Cadeaux</h2>
           <p className="text-slate-400 text-sm font-medium">Gérez les codes promotionnels du jeu.</p>
        </div>
        <button onClick={openAdd} className="bg-[#55a4dd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4493cc] shadow-lg shadow-[#55a4dd]/20 transition-all text-xs uppercase tracking-wider">
          <Plus size={16}/> Ajouter un Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.map(c => {
          const isActive = c.status === 'active';
          return (
            <div key={c.id} className={`group bg-[#0f172a] rounded-[2rem] border ${isActive ? 'border-white/10' : 'border-red-500/20'} relative overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300`}>
              {/* Header */}
              <div className={`p-6 flex items-center gap-4 border-b ${isActive ? 'border-white/5 bg-white/5' : 'border-red-500/10 bg-red-500/5'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isActive ? 'bg-[#55a4dd] text-white' : 'bg-slate-700 text-slate-500'}`}>
                      <Gift size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-white truncate font-mono tracking-wide">{c.code}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {isActive ? 'Actif' : 'Expiré'}
                      </span>
                  </div>
              </div>
              
              <div className="p-6">
                  <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Récompense</p>
                      <p className="text-white font-bold text-sm">{c.reward}</p>
                  </div>
                  {c.description && (
                      <div className="mb-6">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-slate-400 text-xs italic line-clamp-2">{c.description}</p>
                      </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button onClick={() => openEdit(c)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">Modifier</button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                  </div>
              </div>
            </div>
          );
        })}
        
        {codes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-[2rem]">
                <Gift size={40} className="mb-4 opacity-50"/>
                <p className="font-bold">Aucun code enregistré.</p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-wiki-in">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Modifier Code' : 'Nouveau Code'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Code (ex: HEARTOPIA2026)</label>
                  <input type="text" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-lg font-mono font-bold focus:border-[#55a4dd] outline-none tracking-wider uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Récompense</label>
                  <input type="text" placeholder="ex: 500 Pièces d'or" required className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none" value={formData.reward} onChange={e => setFormData({...formData, reward: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Statut</label>
                      <select className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                          <option value="active">Actif</option>
                          <option value="expired">Expiré</option>
                      </select>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Description / Notes (Optionnel)</label>
                  <textarea className="w-full bg-[#020617] p-4 rounded-xl border border-white/10 text-white text-sm focus:border-[#55a4dd] outline-none resize-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails supplémentaires..." />
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
