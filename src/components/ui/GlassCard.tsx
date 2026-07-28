'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({ children, className, glow = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-xl p-6',
          glow && 'shadow-emerald-500/10 border-emerald-500/20',
          className
        )
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
