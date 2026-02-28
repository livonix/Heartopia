
import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Copy, Plus, Bug, Utensils, PawPrint } from 'lucide-react';
import { ImageUploadInput } from './ImageUploadInput';

interface InfoboxEditorProps {
  items: any[];
  onChange: (items: any[]) => void;
  type: 'infobox' | 'insect_infobox' | 'recipe_infobox' | 'animal_infobox';
}

export const InfoboxEditor: React.FC<InfoboxEditorProps> = ({ items, onChange, type }) => {
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

  const getStyle = () => {
    switch (type) {
        case 'insect_infobox': return { color: 'text-orange-500', bg: 'bg-orange-600', border: 'border-orange-900/30', focus: 'focus:border-orange-600', icon: Bug };
        case 'recipe_infobox': return { color: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-900/30', focus: 'focus:border-rose-500', icon: Utensils };
        case 'animal_infobox': return { color: 'text-emerald-500', bg: 'bg-emerald-600', border: 'border-emerald-900/30', focus: 'focus:border-emerald-600', icon: PawPrint };
        default: return { color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-slate-800', focus: 'focus:border-amber-500', icon: null };
    }
  };

  const s = getStyle();
  const Icon = s.icon;

  const addNew = () => {
      // Create a clean template based on the current item structure, but empty fields
      const template = { ...items[0], title: '', image: '' };
      onChange([...items, template]);
  };

  return (
    <div className="space-y-8">
      {items.map((info, idx) => (
        <div key={idx} className={`bg-slate-900/40 p-8 rounded-[2.5rem] border ${s.border} relative group animate-wiki-in`}>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button type="button" onClick={() => moveItem(idx, 'up')} className={`p-2 bg-slate-950 border border-slate-800 rounded-full hover:${s.color} opacity-0 group-hover:opacity-100 transition-all`}><ChevronUp size={16}/></button>
            <div className={`w-8 h-8 ${s.bg} text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg`}>0{idx+1}</div>
            <button type="button" onClick={() => moveItem(idx, 'down')} className={`p-2 bg-slate-950 border border-slate-800 rounded-full hover:${s.color} opacity-0 group-hover:opacity-100 transition-all`}><ChevronDown size={16}/></button>
          </div>
          
          <div className="flex justify-between items-center mb-6">
             <div className={`flex items-center gap-3 ${s.color}`}>
                {Icon && <Icon size={20} />}
                <h4 className="font-black uppercase tracking-widest text-xs">Fiche #{idx+1}</h4>
             </div>
             <div className="flex gap-2">
               <button type="button" onClick={() => duplicateItem(idx)} className={`p-2 text-slate-500 hover:${s.color} transition-colors`}><Copy size={18} /></button>
               <button type="button" onClick={() => removeItem(idx)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-bold outline-none ${s.focus}`} value={info.title || ''} onChange={(e) => updateItem(idx, {...info, title: e.target.value})} placeholder="Nom" />
              
              {/* IMAGE UPLOAD REPLACEMENT */}
              <ImageUploadInput 
                value={info.image || ''} 
                onChange={(val) => updateItem(idx, {...info, image: val})} 
                className="w-full"
              />

              {type !== 'recipe_infobox' && type !== 'animal_infobox' && (
                  <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.lieu || ''} onChange={(e) => updateItem(idx, {...info, lieu: e.target.value})} placeholder="Lieu" />
              )}
              
              {type === 'infobox' && (
                  <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.taille || ''} onChange={(e) => updateItem(idx, {...info, taille: e.target.value})} placeholder="Taille (Petit, Moyen...)" />
              )}

              {type === 'animal_infobox' && (
                  <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.rarity || ''} onChange={(e) => updateItem(idx, {...info, rarity: e.target.value})} placeholder="Rareté (Sauvage...)" />
              )}

              {(type === 'infobox' || type === 'insect_infobox' || type === 'recipe_infobox') && (
                  <div className="flex gap-2">
                    <input type="text" className={`flex-1 bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.price_min || ''} onChange={(e) => updateItem(idx, {...info, price_min: e.target.value})} placeholder="Prix Mini" />
                    <input type="text" className={`flex-1 bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.price_max || ''} onChange={(e) => updateItem(idx, {...info, price_max: e.target.value})} placeholder="Prix Maxi" />
                  </div>
              )}
            </div>

            <div className="space-y-4">
              {(type === 'infobox' || type === 'insect_infobox') && (
                  <>
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.periode || ''} onChange={(e) => updateItem(idx, {...info, periode: e.target.value})} placeholder="Période" />
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.meteo || ''} onChange={(e) => updateItem(idx, {...info, meteo: e.target.value})} placeholder="Météo" />
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.heure || ''} onChange={(e) => updateItem(idx, {...info, heure: e.target.value})} placeholder="Heure" />
                    <input type="number" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.passion || ''} onChange={(e) => updateItem(idx, {...info, passion: e.target.value})} placeholder="Niveau Passion" />
                  </>
              )}

              {type === 'recipe_infobox' && (
                  <textarea className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus} h-full min-h-[150px] resize-none`} value={info.ingredients || ''} onChange={(e) => updateItem(idx, {...info, ingredients: e.target.value})} placeholder="Ingrédients (ex: 2 Pommes, 1 Sucre...)" />
              )}

              {type === 'animal_infobox' && (
                  <>
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.zone || ''} onChange={(e) => updateItem(idx, {...info, zone: e.target.value})} placeholder="Zone(s) d'apparition" />
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.foods || ''} onChange={(e) => updateItem(idx, {...info, foods: e.target.value})} placeholder="Aliments favoris" />
                    <input type="text" className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none ${s.focus}`} value={info.weather || ''} onChange={(e) => updateItem(idx, {...info, weather: e.target.value})} placeholder="Météo idéale" />
                  </>
              )}
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addNew} className={`w-full py-6 border-2 border-dashed border-slate-800 rounded-[2rem] ${s.color} hover:bg-white/5 flex items-center justify-center gap-3 font-black text-[10px] uppercase transition-all`}>
        <Plus size={18} /> Ajouter une fiche
      </button>
    </div>
  );
};
