import React, { useState } from 'react';
import { Copy, Check, Sparkles, RefreshCw, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '../lib/utils';

interface CaptionDisplayProps {
  captions: string[];
  imageUrl: string;
  onReset: () => void;
  onRegenerate: () => void;
}

export function CaptionDisplay({ captions, imageUrl, onReset, onRegenerate }: CaptionDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (caption: string, index: number) => {
    copyToClipboard(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4 md:gap-8 items-stretch h-full">
      {/* Image Preview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full md:w-1/3 shrink-0 h-32 md:h-auto md:aspect-[4/5] rounded-2xl overflow-hidden relative bg-neutral-900 border border-neutral-800 shadow-xl"
      >
        <img 
          src={imageUrl} 
          alt="Uploaded preview" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent gap-3 md:gap-4">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-300 hover:text-white transition-colors drop-shadow-md"
          >
             <Undo2 size={16} /> New Photo
          </button>
          <button 
            onClick={onRegenerate}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-300 hover:text-white transition-colors drop-shadow-md"
          >
             <RefreshCw size={16} /> Generate More
          </button>
        </div>
      </motion.div>

      {/* Captions List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-neutral-400" size={16} />
            <h2 className="text-sm uppercase tracking-widest font-semibold text-neutral-400">Curated Captions</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar flex flex-col gap-3 pb-2 md:pb-0">
          <AnimatePresence>
            {captions.map((caption, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group relative p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer shrink-0"
                onClick={() => handleCopy(caption, index)}
              >
                <p className="text-neutral-200 text-[15px] leading-snug pr-8 font-medium">
                  {caption}
                </p>
                <button 
                  title="Copy caption"
                  className="absolute text-neutral-500 top-1/2 -translate-y-1/2 right-4 transition-colors group-hover:text-neutral-300"
                >
                  {copiedIndex === index ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
