import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, CheckCircle2 } from 'lucide-react';
import { BoosterType } from '../types';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: (boosterType: BoosterType) => void;
  triggerHaptic: (type?: any) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
  triggerHaptic,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [awardedBooster, setAwardedBooster] = useState<BoosterType>('hammer');

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setIsPlaying(false);
      setCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const boosters: BoosterType[] = ['hint', 'shuffle', 'undo', 'hammer', 'rainbow'];
          const picked = boosters[Math.floor(Math.random() * boosters.length)];
          setAwardedBooster(picked);
          setCompleted(true);
          setIsPlaying(false);
          triggerHaptic('win');
          onRewardGranted(picked);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, countdown, onRewardGranted, triggerHaptic]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#10152D]/90 backdrop-blur-md select-none touch-manipulation"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              triggerHaptic('click');
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-5 max-w-xs w-full text-center rounded-2xl shadow-[0_12px_45px_rgba(113,56,200,0.4)] relative text-[#F8F5FF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7138C8] to-[#A855F7] border border-[#39D5E8]/40 flex items-center justify-center mx-auto mb-3 text-[#F8F5FF] shadow-md">
              <Film size={24} />
            </div>

            <h3 className="text-base font-headline font-black uppercase text-[#F8F5FF] mb-1">
              Mystic Reel Broadcast
            </h3>
            <p className="text-xs text-[#C6BDD9] mb-4">
              Watch a short mystical simulation to receive a free booster!
            </p>

            {completed ? (
              <div className="bg-[#211238] p-3 rounded-xl border border-emerald-400/50 mb-4">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1 font-headline font-bold text-xs">
                  <CheckCircle2 size={16} /> Reward Granted!
                </div>
                <p className="text-xs text-[#F8F5FF] font-headline font-black">
                  +1 {awardedBooster.toUpperCase()} Booster
                </p>
              </div>
            ) : isPlaying ? (
              <div className="bg-[#211238] p-4 rounded-xl border border-[rgba(196,167,255,0.25)] mb-4">
                <div className="text-2xl font-headline font-black text-[#F5C76B] mb-1 animate-pulse">
                  {countdown}s
                </div>
                <p className="text-[10px] text-[#39D5E8] font-headline uppercase tracking-wider">
                  Gathering magical energies...
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  setIsPlaying(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] text-[#211238] rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-[0_4px_18px_rgba(245,199,107,0.35)] hover:brightness-110 active:scale-95 cursor-pointer mb-2"
              >
                Watch Simulation (3s)
              </button>
            )}

            {completed && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  onClose();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[#39D5E8] to-[#579BFF] text-[#211238] rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow cursor-pointer hover:brightness-110 active:scale-95"
              >
                Collect &amp; Return
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
