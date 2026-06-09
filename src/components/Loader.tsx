import React from 'react';
import { motion } from 'motion/react';

export function Loader() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-neutral-400"
            animate={{
              y: ["0%", "-100%", "0%"],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <p className="mt-6 text-sm font-medium tracking-widest uppercase text-neutral-500">
        Analyzing your vibe
      </p>
    </div>
  );
}
