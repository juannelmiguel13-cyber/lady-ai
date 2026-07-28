'use client';

import { useState, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  success?: boolean;
  icon?: React.ReactNode;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, warning, success, icon, suffix, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={twMerge(
              clsx(
                'w-full rounded-xl border bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200',
                'focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50',
                icon && 'pl-10',
                suffix && 'pr-12',
                error
                  ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
                  : warning
                  ? 'border-amber-500/50 focus:ring-amber-500/30 focus:border-amber-500/50'
                  : success
                  ? 'border-emerald-500/50'
                  : focused
                  ? 'border-emerald-500/50'
                  : 'border-white/[0.08]',
                className
              )
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              {suffix}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-1.5 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          ) : warning ? (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-1.5 text-sm text-amber-400"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{warning}</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-1.5 text-sm text-emerald-400"
            >
              <Check className="h-4 w-4" />
              <span>¡Correcto!</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
