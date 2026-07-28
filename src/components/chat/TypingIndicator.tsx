'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  text?: string;
}

export default function TypingIndicator({ text = 'Dr. Vásquez está escribiendo...' }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-400 p-2">
      <div className="flex items-center gap-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.span>
    </div>
  );
}
