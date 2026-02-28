
import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Link, Loader2 } from 'lucide-react';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ value, onChange, placeholder = "Image...", className }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState<'url' | 'file'>(value.startsWith('data:') ? 'file' : 'url');
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert File to optimized Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too big (max 800px width)
        const MAX_WIDTH = 800;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        onChange(dataUrl);
        setInputType('file');
        setLoading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      e.preventDefault();
      processFile(e.clipboardData.files[0]);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {value ? (
        <div className="relative w-full aspect-square bg-[#0f172a] rounded-xl border border-white/10 overflow-hidden group-hover:border-[#55a4dd]/50 transition-all">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <button type="button" onClick={() => { onChange(''); setInputType('url'); }} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors">
               <X size={16} />
             </button>
          </div>
        </div>
      ) : (
        <div 
          className={`relative w-full border border-white/10 rounded-xl bg-[#020617] overflow-hidden transition-all ${isDragOver ? 'border-[#55a4dd] bg-[#55a4dd]/10' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {loading ? (
             <div className="flex items-center justify-center p-4">
               <Loader2 size={20} className="animate-spin text-[#55a4dd]" />
             </div>
          ) : (
            <div className="flex flex-col">
               {/* Mode Switcher inside input */}
               <div className="flex items-center border-b border-white/5">
                  <button type="button" onClick={() => setInputType('url')} className={`flex-1 py-2 text-[10px] font-black uppercase ${inputType === 'url' ? 'text-[#55a4dd] bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>Lien</button>
                  <div className="w-px h-full bg-white/5"></div>
                  <button type="button" onClick={() => setInputType('file')} className={`flex-1 py-2 text-[10px] font-black uppercase ${inputType === 'file' ? 'text-[#55a4dd] bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>Fichier</button>
               </div>

               {inputType === 'url' ? (
                 <div className="flex items-center px-3 py-2">
                    <Link size={14} className="text-slate-500 mr-2" />
                    <input 
                      type="text" 
                      placeholder="https://..." 
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600 font-mono"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onPaste={handlePaste}
                    />
                 </div>
               ) : (
                 <div 
                    className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => inputRef.current?.click()}
                    onPaste={handlePaste} // Handle paste on the drop area
                    tabIndex={0} // Make div focusable to catch paste events
                 >
                    <input 
                      type="file" 
                      ref={inputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                    />
                    <Upload size={20} className="text-slate-500 mb-1" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Click / Drop / Paste</span>
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
