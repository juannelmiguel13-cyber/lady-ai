'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ConditionTagProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export default function ConditionTag({ label, selected, onClick, icon }: ConditionTagProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border cursor-pointer',
        selected
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
          : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-zinc-300'
      )}
    >
      {icon}
      <span>{label}</span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <Check className="h-3.5 w-3.5" />
        </motion.span>
      )}
    </motion.button>
  );
}
