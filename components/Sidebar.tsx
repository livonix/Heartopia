import React from 'react';
import { 
  Home, 
  Bug, 
  Leaf, 
  Hammer, 
  Sofa, 
  Users, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { WikiView } from '../App';

interface SidebarProps {
  activeView: WikiView;
  onViewChange: (view: WikiView) => void;
  isOpen: boolean;
}

const MENU_ITEMS = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'faune', label: 'Faune', icon: Bug, desc: 'Poissons & Insectes' },
  { id: 'flore', label: 'Flore', icon: Leaf, desc: 'Agriculture & Fleurs' },
  { id: 'artisanat', label: 'Artisanat', icon: Hammer, desc: 'Recettes & Forge' },
  { id: 'mobilier', label: 'Mobilier', icon: Sofa, desc: 'Décoration' },
  { id: 'personnages', label: 'Citoyens', icon: Users, desc: 'Villageois' },
  { id: 'guides', label: 'Guides', icon: BookOpen, desc: 'Tutoriels' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen }) => {
  return (
    <aside 
      className={`fixed lg:relative z-40 h-[calc(100vh-80px)] transition-all duration-500 ease-in-out bg-white/40 backdrop-blur-xl border-r border-white/40
        ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden opacity-0'}
      `}
    >
      <div className="p-6 h-full flex flex-col gap-2 overflow-y-auto">
        <div className="text-[10px] font-bold text-[#9a836b] uppercase tracking-[0.2em] mb-4 px-2 opacity-60">
          Navigation Wiki
        </div>
        
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as WikiView)}
              className={`group flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 relative
                ${isActive 
                  ? 'bg-[#55a4dd] text-white shadow-lg scale-[1.02]' 
                  : 'text-[#9a836b] hover:bg-white/60 hover:translate-x-1'
                }
              `}
            >
              <div className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-white/20' : 'bg-[#55a4dd]/10 text-[#55a4dd]'}`}>
                <Icon size={22} />
              </div>
              
              <div className="flex flex-col items-start text-left flex-1">
                <span className="font-bold text-sm lg:text-base leading-tight">
                  {item.label}
                </span>
                {item.desc && !isActive && (
                  <span className="text-[10px] opacity-60 font-semibold uppercase tracking-tighter">
                    {item.desc}
                  </span>
                )}
              </div>
              
              {isActive && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-[#55a4dd] p-1 rounded-full shadow-md animate-bounce-x">
                  <ChevronRight size={14} />
                </div>
              )}
            </button>
          );
        })}

        <div className="mt-auto pt-8">
          <div className="bg-[#55a4dd]/10 p-4 rounded-[2rem] border border-[#55a4dd]/20">
            <p className="text-[11px] text-[#55a4dd] font-bold text-center leading-relaxed italic">
              "Contribuez au savoir commun de Heartopia !"
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};