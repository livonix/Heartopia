
import React, { useState, useEffect } from 'react';
import { 
  Type, Grid, Layout, Bug, Utensils, Gift, PawPrint 
} from 'lucide-react';
import { TextEditor } from './editors/TextEditor';
import { GridEditor } from './editors/GridEditor';
import { PromoCodeEditor } from './editors/PromoCodeEditor';
import { InfoboxEditor } from './editors/InfoboxEditor';

interface SectionEditorProps {
  value: string | any[] | any;
  onChange: (value: string | any[] | any) => void;
}

// Configuration des modes avec classes statiques pour Tailwind
const MODE_CONFIG = {
  text: { label: 'Texte', icon: Type, activeClass: 'bg-slate-700 text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  grid: { label: 'Grille', icon: Grid, activeClass: 'bg-[#55a4dd] text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  promo_codes: { label: 'Codes', icon: Gift, activeClass: 'bg-[#55a4dd] text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  infobox: { label: 'Pêche', icon: Layout, activeClass: 'bg-amber-500 text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  insect_infobox: { label: 'Insecte', icon: Bug, activeClass: 'bg-orange-600 text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  recipe_infobox: { label: 'Recette', icon: Utensils, activeClass: 'bg-[#f43f5e] text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' },
  animal_infobox: { label: 'Animal', icon: PawPrint, activeClass: 'bg-emerald-600 text-white', inactiveClass: 'text-slate-500 hover:text-slate-300' }
};

type ModeKey = keyof typeof MODE_CONFIG;

export const SectionEditor: React.FC<SectionEditorProps> = ({ value, onChange }) => {
  const isArray = Array.isArray(value);
  
  // Fonction utilitaire pour détecter le mode basé sur les données
  const detectMode = (val: any): ModeKey => {
    if (!Array.isArray(val)) return 'text';
    const first = val[0];
    if (!first) return 'grid'; 
    if (first.type === 'infobox') return 'infobox';
    if (first.type === 'insect_infobox') return 'insect_infobox';
    if (first.type === 'animal_infobox') return 'animal_infobox';
    if (first.type === 'recipe_infobox') return 'recipe_infobox';
    if (first.type === 'promo_codes') return 'promo_codes';
    return 'grid';
  };

  const [mode, setMode] = useState<ModeKey>(() => detectMode(value));

  // Sync mode if value changes externally
  // Removed useEffect causing setState warning. Initialization is handled by useState.
  // If dynamic mode switching based on value prop is needed, it should be done carefully or via a key prop.

  const switchMode = (newMode: ModeKey) => {
    if (newMode === mode) return;

    // Protection: If current data structure matches new mode, just switch display without wiping data
    const currentDetected = detectMode(value);
    if (currentDetected === newMode) {
        setMode(newMode);
        return;
    }

    // Default Templates
    const templates = {
        grid: [{ name: '', image: '', rarity: 'Commun', desc: '' }],
        infobox: [{ type: 'infobox', title: '', image: '', lieu: '', taille: '', periode: 'Toute l\'année', meteo: 'Toute météo', heure: 'Toute la journée', passion: '1', price_min: '', price_max: '?' }],
        insect_infobox: [{ type: 'insect_infobox', title: '', image: '', lieu: '', periode: 'Été', meteo: 'Soleil', heure: 'Journée', passion: '1', price_min: '', price_max: '?' }],
        recipe_infobox: [{ type: 'recipe_infobox', title: '', image: '', ingredients: '', price_min: '', price_max: '?' }],
        animal_infobox: [{ type: 'animal_infobox', title: '', image: '', rarity: 'Sauvage', zone: '', foods: '', weather: 'Soleil' }],
        promo_codes: [{ type: 'promo_codes', code: '', reward: '', expiration: 'Permanent', status: 'active' }]
    };

    if (newMode === 'text') {
      if (confirm("Passer en mode texte supprimera votre configuration actuelle. Continuer ?")) {
        onChange('');
        setMode('text');
      }
    } else {
        onChange((templates[newMode] as any) || []);
        setMode(newMode);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex flex-wrap bg-[#0f172a] p-1.5 rounded-xl border border-white/10 w-fit gap-1">
        {Object.entries(MODE_CONFIG).map(([key, config]) => (
          <React.Fragment key={key}>
            {key === 'infobox' && <div className="w-px bg-white/10 mx-1"></div>}
            <button 
              type="button" 
              onClick={() => switchMode(key as ModeKey)} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === key ? config.activeClass : config.inactiveClass
              }`}
            >
              <config.icon size={14} /> {config.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Render Specific Editor */}
      {mode === 'text' && (
        <TextEditor 
            value={value} 
            onChange={onChange} 
            setMode={setMode} 
            detectMode={detectMode} 
        />
      )}

      {mode === 'grid' && isArray && (
        <GridEditor items={value} onChange={onChange} />
      )}

      {mode === 'promo_codes' && isArray && (
        <PromoCodeEditor items={value} onChange={onChange} />
      )}

      {(mode === 'infobox' || mode === 'insect_infobox' || mode === 'recipe_infobox' || mode === 'animal_infobox') && isArray && (
        <InfoboxEditor items={value} onChange={onChange} type={mode} />
      )}
    </div>
  );
};
