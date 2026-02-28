
import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Copy, Plus } from 'lucide-react';
import { ImageUploadInput } from './ImageUploadInput';

interface GridEditorProps {
  items: any[];
  onChange: (items: any[]) => void;
}

export const GridEditor: React.FC<GridEditorProps> = ({ items, onChange }) => {
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
        <div key={idx} className="bg-[#0f172a] p-4 rounded-2xl border border-white/10 flex gap-4 group hover:border-[#55a4dd]/30 transition-all items-start">
          <div className="flex flex-col gap-1 shrink-0 bg-white/5 rounded-lg p-1">
             <button type="button" onClick={() => moveItem(idx, 'up')} className="p-1 hover:text-[#55a4dd] text-slate-500 transition-colors"><ChevronUp size={16}/></button>
             <div className="text-[10px] font-black text-center text-[#55a4dd]">{idx + 1}</div>
             <button type="button" onClick={() => moveItem(idx, 'down')} className="p-1 hover:text-[#55a4dd] text-slate-500 transition-colors"><ChevronDown size={16}/></button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input type="text" placeholder="Nom" className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-[#55a4dd]" value={item.name} onChange={(e) => updateItem(idx, {...item, name: e.target.value})} />
              <select className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-[#55a4dd] outline-none" value={item.rarity} onChange={(e) => updateItem(idx, {...item, rarity: e.target.value})}>
                <option>Commun</option><option>Rare</option><option>Épique</option><option>Légendaire</option>
              </select>
              <textarea placeholder="Description courte" rows={2} className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-xs text-slate-300 resize-none outline-none focus:border-[#55a4dd]" value={item.desc} onChange={(e) => updateItem(idx, {...item, desc: e.target.value})} />
            </div>
            <div className="space-y-2">
              <ImageUploadInput 
                value={item.image || ''} 
                onChange={(val) => updateItem(idx, {...item, image: val})} 
                placeholder="Image de l'objet"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => removeItem(idx)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
            <button type="button" onClick={() => duplicateItem(idx)} className="p-2 text-slate-500 hover:text-[#55a4dd] hover:bg-[#55a4dd]/10 rounded-lg transition-all"><Copy size={16} /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { name: '', image: '', rarity: 'Commun', desc: '' }])} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-[#55a4dd] hover:text-[#55a4dd] flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all bg-[#0f172a]/50">
        <Plus size={16} /> Ajouter un élément
      </button>
    </div>
  );
};
