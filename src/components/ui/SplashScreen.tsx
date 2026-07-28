'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#0a0a0c] flex flex-col items-center justify-center text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-xl"
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/20">
            <Brain className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-2"
          >
            Bienvenida <span className="text-emerald-400">Dr Vasquez</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-zinc-400 text-lg"
          >
            Iniciando Motor de IA Clínica...
          </motion.p>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
          className="h-1 w-48 bg-emerald-500/20 rounded-full overflow-hidden origin-left mt-8 relative"
        >
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-emerald-400"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
