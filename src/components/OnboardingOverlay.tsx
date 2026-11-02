import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Mystic Match',
      desc: 'Embark on a mythical match-3 puzzle adventure across the Floating Archipelago. Form match combos to harvest crystal power!',
      icon: '✨',
    },
    {
      title: 'Journey the Realm Map',
      desc: 'Progress along the winding floating islands. Clear stages with 3 stars to earn coins and gems.',
      icon: '🗺️',
    },
    {
      title: 'Master Crystal Combos',
      desc: 'Match 3, 4, or 5 crystals of the same color for explosive special gems and elemental chain reactions.',
      icon: '💎',
    },
  ];

  const currentStep = steps[step];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#10152D]/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border border-[rgba(196,167,255,0.25)] p-5 sm:p-6 shadow-[0_10px_35px_rgba(33,18,56,0.8)] rounded-2xl flex flex-col items-center text-center select-none text-[#F8F5FF] max-h-[90dvh] overflow-y-auto"
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-3">
            {steps.map((_, idx) => (
              <div
                key={`step-dot-${idx}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === step ? 'w-6 bg-[#39D5E8]' : 'w-2 bg-[#211238] border border-[rgba(196,167,255,0.2)]'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="text-4xl my-2">{currentStep.icon}</div>

          {/* Heading */}
          <h2 className="font-headline font-black text-xl uppercase tracking-wider text-[#F5C76B] leading-tight mb-2">
            {currentStep.title}
          </h2>

          {/* Description */}
          <p className="text-xs text-[#C6BDD9] font-medium leading-relaxed px-2 mb-5">
            {currentStep.desc}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onComplete}
              className="flex-1 py-2.5 bg-[#211238] border border-[rgba(196,167,255,0.2)] rounded-xl font-headline text-xs font-bold uppercase tracking-wider text-[#C6BDD9] hover:text-[#F8F5FF] hover:bg-[#29203D] transition-all cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#F5C76B] to-amber-500 text-[#10152D] rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-[0_2px_10px_rgba(245,199,107,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {step === steps.length - 1 ? 'Start Game' : 'Next'}
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
