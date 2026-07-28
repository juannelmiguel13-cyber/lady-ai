'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-lg pointer-events-auto"
            >
              <GlassCard className="p-0 overflow-hidden border-white/[0.12] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-zinc-400 hover:bg-white/[0.1] hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 text-zinc-300">{children}</div>

                {/* Footer */}
                {(primaryAction || secondaryAction) && (
                  <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] bg-black/20 p-4">
                    {secondaryAction && (
                      <Button variant="ghost" onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                      </Button>
                    )}
                    {primaryAction && (
                      <Button
                        variant={primaryAction.variant || 'primary'}
                        onClick={primaryAction.onClick}
                        isLoading={primaryAction.isLoading}
                      >
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
