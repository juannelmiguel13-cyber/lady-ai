'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                scale: currentStep === step.id ? 1.1 : 1,
                backgroundColor:
                  currentStep > step.id
                    ? 'rgb(16, 185, 129)'
                    : currentStep === step.id
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
              }}
              transition={{ duration: 0.3 }}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
                currentStep > step.id
                  ? 'border-emerald-500 text-white'
                  : currentStep === step.id
                  ? 'border-emerald-500/50 text-emerald-400'
                  : 'border-white/[0.1] text-zinc-500'
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </motion.div>
            <span
              className={clsx(
                'mt-1.5 text-xs font-medium whitespace-nowrap',
                currentStep >= step.id ? 'text-zinc-300' : 'text-zinc-600'
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="mx-3 mb-5">
              <div
                className={clsx(
                  'h-[2px] w-12 rounded-full transition-all duration-500',
                  currentStep > step.id
                    ? 'bg-emerald-500'
                    : 'bg-white/[0.08]'
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
