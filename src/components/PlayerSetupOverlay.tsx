import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';

interface PlayerSetupOverlayProps {
  onContinue: (name: string) => void;
  triggerHaptic: () => void;
}

export const PlayerSetupOverlay: React.FC<PlayerSetupOverlayProps> = ({
  onContinue,
  triggerHaptic,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a player name!');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long!');
      return;
    }
    if (trimmedName.length > 15) {
      setError('Name must be 15 characters or less!');
      return;
    }

    onContinue(trimmedName);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-3 sm:p-4 bg-[#10152D]/85 backdrop-blur-md">
      {/* Floating magical atmospheric nebulas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7138C8]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#39D5E8]/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120 }}
        className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-5 sm:p-7 shadow-[0_10px_40px_rgba(113,56,200,0.35)] text-center select-none rounded-2xl text-[#F8F5FF] max-h-[90dvh] overflow-y-auto"
      >
        {/* Crystal Orb Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7138C8] via-[#A855F7] to-[#39D5E8] border-2 border-[#39D5E8] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(57,213,232,0.5)] mb-3">
          🔮
        </div>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#211238] border border-[rgba(196,167,255,0.25)] rounded-full text-[#39D5E8] text-[10px] font-bold uppercase tracking-widest mb-2">
            <Sparkles size={11} className="text-[#F5C76B] animate-pulse" />
            Fantasy Match-3 Realm
          </div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F5C76B] via-[#F8F5FF] to-[#39D5E8] leading-tight mb-1">
            WELCOME TO MYSTIC MATCH
          </h1>
          <p className="text-xs text-[#C6BDD9] font-medium max-w-[260px] mx-auto leading-relaxed">
            Enter your player name to begin your journey across the crystal archipelagos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[11px] font-headline font-bold uppercase tracking-wider text-[#39D5E8] mb-1.5">
              Enter your player name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter Name..."
                maxLength={15}
                autoFocus
                className="w-full bg-[#211238] text-[#F8F5FF] border-2 border-[rgba(196,167,255,0.25)] rounded-xl font-headline font-bold text-sm px-4 py-3 shadow-inner focus:outline-none focus:border-[#39D5E8] focus:ring-2 focus:ring-[#39D5E8]/30 transition-all placeholder:text-[#C6BDD9]/40"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-headline font-bold text-[#C6BDD9]">
                {name.length}/15
              </span>
            </div>
            {error && (
              <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="mt-1 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] hover:brightness-110 text-[#211238] font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(245,199,107,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={16} className="fill-current" />
              START GAME
            </button>
            <p className="text-[10px] text-[#C6BDD9] font-medium text-center">
              ⚡ Instant setup. Account saved locally on this device.
            </p>
          </div>
        </form>

        {/* New player starting stats - Guaranteed All Zeros */}
        <div className="mt-5 pt-4 border-t border-[rgba(196,167,255,0.20)] flex justify-around text-center text-[#C6BDD9] text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#F5C76B]">Coins</span>
            <span className="font-headline font-black text-sm text-[#F8F5FF]">🪙 0</span>
          </div>
          <div className="w-[1px] bg-[rgba(196,167,255,0.25)] h-7 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#39D5E8]">Diamonds</span>
            <span className="font-headline font-black text-sm text-[#F8F5FF]">💎 0</span>
          </div>
          <div className="w-[1px] bg-[rgba(196,167,255,0.25)] h-7 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Level</span>
            <span className="font-headline font-black text-sm text-[#F8F5FF]">⭐ 0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
