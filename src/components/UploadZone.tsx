import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full max-w-lg mx-auto overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300 ${
        isDragging ? 'border-neutral-400 bg-neutral-900/50' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/20'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-16 w-16 mb-4 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 shadow-inner">
          <UploadCloud strokeWidth={1.5} size={32} />
        </div>
        <h3 className="text-xl tracking-tight font-display font-medium text-neutral-200 mb-2">
          Drop your photo here
        </h3>
        <p className="text-sm font-medium text-neutral-500 max-w-xs mx-auto leading-relaxed">
          Or click to browse. We'll analyze the vibe and craft the perfect captions.
        </p>
      </div>
    </motion.div>
  );
}
