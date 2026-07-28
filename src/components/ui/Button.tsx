'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          {
            'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25':
              variant === 'primary',
            'bg-white/[0.06] border border-white/[0.1] text-zinc-200 hover:bg-white/[0.1] hover:border-white/[0.15]':
              variant === 'secondary',
            'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]':
              variant === 'ghost',
            'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25':
              variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3 text-base': size === 'lg',
          },
          className
        )
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
