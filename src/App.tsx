import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { CaptionDisplay } from './components/CaptionDisplay';
import { Loader } from './components/Loader';
import { compressImage } from './lib/utils';
import type { CaptionsResponse } from './types';
import { motion } from 'motion/react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaptions = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // Compress image and convert to base64 to ensure it fits within Vercel's payload limit
      const base64Data = await compressImage(file);
      
      const response = await fetch('/api/captions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        let msg = 'Failed to generate captions';
        try {
          const errData = await response.json();
          if (errData.error) msg = errData.error;
        } catch(e) {}
        throw new Error(msg);
      }

      const data: CaptionsResponse = await response.json();
      setCaptions(data.captions);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong. Please try a different photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setCaptions(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    
    generateCaptions(file);
  };

  const handleRegenerate = () => {
    if (selectedFile) {
      setCaptions(null);
      generateCaptions(selectedFile);
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setSelectedFile(null);
    setImageUrl(null);
    setCaptions(null);
    setError(null);
  };

  return (
    <main className="h-[100dvh] flex flex-col max-w-7xl mx-auto px-4 py-4 md:px-12 md:py-8 overflow-hidden">
      {(!captions && !isLoading) && (
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto flex-shrink-0 mt-4 md:mt-8 mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 md:mb-6 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            AI Copywriter
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4 text-white">
            Aura Check.
          </h1>
          <p className="text-base md:text-lg text-neutral-400 font-medium leading-relaxed">
            Upload a photo. We analyze the aesthetic and craft five high-taste captions for your feed.
          </p>
        </motion.header>
      )}

      <div className="flex-1 w-full relative flex flex-col items-center justify-center min-h-0 overflow-hidden">
        {!imageUrl && !isLoading && (
          <UploadZone onFileSelect={handleFileSelect} isLoading={isLoading} />
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg mx-auto mt-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-200 text-center font-medium text-sm"
          >
            {error}
            <button 
              onClick={handleReset}
              className="mt-2 block mx-auto underline text-red-400 hover:text-red-300"
            >
              Try again
            </button>
          </motion.div>
        )}

        {isLoading && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="rounded-2xl overflow-hidden aspect-square border border-neutral-800 relative opacity-40 grayscale">
              <img src={imageUrl} alt="Uploading" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Loader />
            </div>
          </motion.div>
        )}

        {captions && imageUrl && !isLoading && (
          <div className="w-full h-full flex flex-col">
            <CaptionDisplay 
              imageUrl={imageUrl} 
              captions={captions} 
              onReset={handleReset} 
              onRegenerate={handleRegenerate}
            />
          </div>
        )}
      </div>

      <footer className="mt-4 md:mt-8 text-center text-xs font-medium text-neutral-600 tracking-widest uppercase flex-shrink-0">
        Powered by Gemini
      </footer>
    </main>
  );
}
