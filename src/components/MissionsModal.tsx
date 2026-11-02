import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Check, Award, Sparkles } from 'lucide-react';
import { GameState, Mission } from '../types';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimMission: (mission: Mission) => void;
  triggerHaptic: (type?: any) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimMission,
  triggerHaptic,
}) => {
  

  const missions = gameState.missions || [];

  return (
    <AnimatePresence>
      {isOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#10152D]/85 backdrop-blur-md select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missions-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            triggerHaptic('click');
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-4 sm:p-5 shadow-[0_12px_45px_rgba(113,56,200,0.35)] rounded-2xl text-[#F8F5FF] max-h-[90dvh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(196,167,255,0.20)] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#39D5E8] to-[#579BFF] text-[#211238] flex items-center justify-center font-black shadow-md">
                <Target size={18} />
              </div>
              <div>
                <h3 id="missions-modal-title" className="text-base sm:text-lg font-headline font-black uppercase text-[#F8F5FF] leading-none">
                  Adventurer Quests
                </h3>
                <p className="text-[9px] text-[#C6BDD9] mt-0.5">Earn Coins &amp; Power Boosters</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] flex items-center justify-center cursor-pointer transition-colors"
              title="Close Quests"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mission Cards */}
          <div className="flex-1 overflow-y-auto allow-scroll py-3 space-y-2.5 pr-0.5">
            {missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));
              const canClaim = mission.completed && !mission.claimed;

              return (
                <div
                  key={mission.id}
                  className={`p-3 rounded-xl border transition-all ${
                    mission.claimed
                      ? 'bg-[#211238] border-emerald-500/30 opacity-75'
                      : canClaim
                      ? 'bg-gradient-to-r from-[#3a2062] to-[#29203D] border-[#F5C76B]/80 shadow-[0_0_15px_rgba(245,199,107,0.25)]'
                      : 'bg-[#29203D] border-[rgba(196,167,255,0.20)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-headline font-black text-xs sm:text-sm text-[#F8F5FF] leading-tight">
                        {mission.title}
                      </h4>
                      <p className="text-[9px] text-[#C6BDD9] leading-snug mt-0.5">
                        {mission.description}
                      </p>
                    </div>

                    {/* Reward badge */}
                    <div className="flex items-center gap-1 shrink-0 bg-[#211238] px-2 py-0.5 rounded-lg border border-[#F5C76B]/40 text-[9px] font-headline font-black text-[#F5C76B]">
                      <span>🪙 +{mission.rewardCoins}</span>
                      {mission.rewardBooster && (
                        <span>+1 {mission.rewardBooster.type === 'hint' ? '💡' : mission.rewardBooster.type === 'shuffle' ? '🔄' : mission.rewardBooster.type === 'undo' ? '⏪' : mission.rewardBooster.type === 'hammer' ? '🔨' : '🌈'}</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#10152D] h-2 rounded-full overflow-hidden border border-[rgba(196,167,255,0.20)] my-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#39D5E8] to-[#F5C76B] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-headline font-bold text-[#39D5E8]">
                      Progress: {Math.min(mission.current, mission.target)} / {mission.target}
                    </span>

                    {mission.claimed ? (
                      <span className="text-[9px] font-headline font-bold text-emerald-400 flex items-center gap-1">
                        <Check size={12} /> Claimed
                      </span>
                    ) : canClaim ? (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('win');
                          onClaimMission(mission);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-[#F5C76B] to-[#F18BCB] text-[#211238] rounded-lg font-headline font-black text-[10px] uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer active:scale-95"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-[9px] font-headline text-[#C6BDD9]">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-[rgba(196,167,255,0.20)] text-center shrink-0">
            <p className="text-[9px] text-[#C6BDD9]">
              ⚔️ Complete adventures to unlock ongoing coin and booster bounties.
            </p>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
