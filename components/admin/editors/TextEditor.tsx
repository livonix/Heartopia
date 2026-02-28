
import React from 'react';
import { Bold, Italic, Heading, List, AlertCircle } from 'lucide-react';

interface TextEditorProps {
  value: string | any[];
  onChange: (value: string | any[]) => void;
  setMode: (mode: any) => void;
  detectMode: (val: any) => any;
}

export const TextEditor: React.FC<TextEditorProps> = ({ value, onChange, setMode, detectMode }) => {
  const isArray = Array.isArray(value);
  const textValue = typeof value === 'string' ? value : '';

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertTag = (tagOpen: string, tagClose: string = '') => {
    const textarea = document.getElementById('section-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    const newValue = before + tagOpen + selection + tagClose + after;
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 10);
  };

  if (isArray) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4 bg-[#0f172a] rounded-xl border border-white/10">
         <AlertCircle size={40} className="text-amber-500" />
         <p className="text-slate-400 text-sm font-bold">Cette section utilise un éditeur visuel (Grille ou Infobox). <br/>Cliquez ci-dessous pour l'afficher correctement.</p>
         <button type="button" onClick={() => setMode(detectMode(value))} className="px-6 py-2 bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Afficher l'éditeur visuel</button>
      </div>
    );
  }

  return (
    <div className="space-y-px overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[#0f172a]">
      <div className="flex flex-wrap gap-1 p-2 bg-[#020617] border-b border-white/10">
        <button type="button" onClick={() => insertTag('**', '**')} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors" title="Gras"><Bold size={16}/></button>
        <button type="button" onClick={() => insertTag('*', '*')} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors" title="Italique"><Italic size={16}/></button>
        <button type="button" onClick={() => insertTag('### ')} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors" title="Titre"><Heading size={16}/></button>
        <button type="button" onClick={() => insertTag('\n- ')} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors" title="Liste"><List size={16}/></button>
      </div>
      <textarea id="section-textarea" className="w-full bg-[#020617] p-6 focus:bg-[#0f172a] outline-none min-h-[300px] font-medium text-slate-300 transition-all leading-relaxed text-sm" placeholder="Écrivez votre contenu ici (Markdown supporté)..." value={textValue} onChange={handleTextChange} />
    </div>
  );
};
