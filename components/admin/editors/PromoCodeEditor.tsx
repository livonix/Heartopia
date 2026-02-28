
import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Copy, Plus } from 'lucide-react';

interface PromoCodeEditorProps {
  items: any[];
  onChange: (items: any[]) => void;
}

export const PromoCodeEditor: React.FC<PromoCodeEditorProps> = ({ items, onChange }) => {
  const updateItem = (index: number, newData: any) => {
    const newItems = [...items];
    newItems[index] = newData;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, dir: 'up' | 'down') => {
    const newItems = [...items];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    onChange(newItems);
  };

  const duplicateItem = (index: number) => {
    const newItems = [...items];
    const clone = JSON.parse(JSON.stringify(newItems[index]));
    newItems.splice(index + 1, 0, clone);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-blue-950/20 p-6 rounded-[2rem] border border-blue-900/30 flex gap-6 group hover:border-blue-500/50 transition-all">
          <div className="flex flex-col gap-2 shrink-0">
             <button type="button" onClick={() => moveItem(idx, 'up')} className="p-1 hover:text-[#55a4dd] opacity-30 hover:opacity-100"><ChevronUp size={20}/></button>
             <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-[10px] font-black text-[#55a4dd] border border-slate-800">{idx + 1}</div>
             <button type="button" onClick={() => moveItem(idx, 'down')} className="p-1 hover:text-[#55a4dd] opacity-30 hover:opacity-100"><ChevronDown size={20}/></button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input type="text" placeholder="CODE PROMO (ex: HEARTOPIA2026)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-black text-white outline-none focus:border-[#55a4dd] font-mono tracking-widest" value={item.code} onChange={(e) => updateItem(idx, {...item, code: e.target.value.toUpperCase()})} />
              <input type="text" placeholder="Récompense (ex: 500 Pièces)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-[#55a4dd]" value={item.reward} onChange={(e) => updateItem(idx, {...item, reward: e.target.value})} />
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Expiration (ex: 31/12/2026)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#55a4dd]" value={item.expiration} onChange={(e) => updateItem(idx, {...item, expiration: e.target.value})} />
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[10px] font-black uppercase text-[#55a4dd] outline-none" value={item.status} onChange={(e) => updateItem(idx, {...item, status: e.target.value})}>
                <option value="active">Actif</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => removeItem(idx)} className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
            <button type="button" onClick={() => duplicateItem(idx)} title="Dupliquer" className="p-3 text-slate-500 hover:text-[#55a4dd] hover:bg-[#55a4dd]/10 rounded-xl transition-all"><Copy size={18} /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { type: 'promo_codes', code: '', reward: '', expiration: '', status: 'active' }])} className="w-full py-6 border-2 border-dashed border-blue-900/30 rounded-[2rem] text-blue-400 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-3 font-black text-[10px] uppercase transition-all">
        <Plus size={18} /> Ajouter un Code Promo
      </button>
    </div>
  );
};
