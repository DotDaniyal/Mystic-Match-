import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Check, Gift, Sparkles, Flame, Award, Zap, Crown } from 'lucide-react';
import { DAILY_LOGIN_REWARDS, STREAK_BONUSES, getStreakBonus, calculateDailyStreak } from '../data';
import { GameState, DailyLoginReward } from '../types';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimDay: (reward: DailyLoginReward) => void;
  triggerHaptic: (type?: any) => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimDay,
  triggerHaptic,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = gameState.lastClaimedDaily === todayStr;
  const currentDayCycle = gameState.dailyLoginDay || 1; // 1 to 7

  const streakInfo = calculateDailyStreak(gameState.lastClaimedDaily, gameState.dailyStreak || 0);
  const currentStreak = streakInfo.currentStreak;
  const nextStreakOnClaim = streakInfo.nextStreakOnClaim;
  const nextBonus = getStreakBonus(nextStreakOnClaim);

  const todayReward = DAILY_LOGIN_REWARDS.find((r) => r.day === currentDayCycle) || DAILY_LOGIN_REWARDS[0];

  const handleClaim = () => {
    if (isClaimedToday) return;
    triggerHaptic('win');
    onClaimDay(todayReward);
  };

  const streakMilestones = [3, 5, 7];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#10152D]/85 backdrop-blur-md select-none touch-manipulation"
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-login-title"
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
            className="relative w-full max-w-md bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-3.5 sm:p-5 shadow-[0_12px_45px_rgba(113,56,200,0.35)] rounded-2xl text-[#F8F5FF] max-h-[92dvh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(196,167,255,0.20)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7138C8] to-[#A855F7] text-[#F8F5FF] flex items-center justify-center font-black shadow-md border border-[#39D5E8]/40">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 id="daily-login-title" className="text-base sm:text-lg font-headline font-black uppercase text-[#F8F5FF] leading-none">
                    Daily Rewards
                  </h3>
                  <p className="text-[10px] text-[#C6BDD9] mt-0.5">7-Day Journey &amp; Consecutive Streaks</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] flex items-center justify-center cursor-pointer transition-colors"
                title="Close Calendar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto allow-scroll my-2 pr-0.5 space-y-3">
              {/* Active Daily Streak Highlight Card */}
              <div className="bg-gradient-to-r from-[#7138C8]/25 via-[#29203D] to-[#211238] border border-[#F5C76B]/50 rounded-xl p-2.5 sm:p-3 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C76B] to-[#F18BCB] text-[#211238] flex items-center justify-center font-black shadow-[0_0_15px_rgba(245,199,107,0.5)] shrink-0">
                    <Flame size={24} className="fill-[#211238] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline font-black text-sm sm:text-base text-[#F5C76B] uppercase leading-none">
                        {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} Streak
                      </span>
                      {currentStreak > 0 && (
                        <span className="text-[9px] font-headline font-black bg-[#F5C76B]/20 text-[#F5C76B] border border-[#F5C76B]/40 px-1.5 py-0.5 rounded-full uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#C6BDD9] mt-1 leading-tight">
                      {isClaimedToday
                        ? `Streak saved for today! Return tomorrow to reach ${currentStreak + 1} days.`
                        : nextBonus
                        ? `🔥 Claim today to hit a ${nextStreakOnClaim}-day milestone bonus!`
                        : `Claim today to push your streak to ${nextStreakOnClaim} consecutive days.`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-[9px] uppercase font-headline font-bold text-[#C4A7FF] block">Cycle</span>
                  <span className="font-headline font-black text-xs sm:text-sm text-[#39D5E8]">
                    Day {currentDayCycle}/7
                  </span>
                </div>
              </div>

              {/* Streak Milestone Rewards Track (3, 5, 7 Days) */}
              <div className="bg-[#211238]/90 border border-[rgba(196,167,255,0.20)] rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-headline font-black text-[#F8F5FF] uppercase tracking-wide flex items-center gap-1">
                    <Sparkles size={11} className="text-[#F5C76B]" /> Streak Milestones &amp; Bonuses
                  </span>
                  <span className="text-[9px] text-[#39D5E8] font-medium">Extra gifts on 3, 5 &amp; 7 days!</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {streakMilestones.map((milestoneDays) => {
                    const bonus = STREAK_BONUSES[milestoneDays];
                    if (!bonus) return null;

                    const isReached = currentStreak >= milestoneDays;
                    const isUpcomingToday = !isClaimedToday && nextStreakOnClaim === milestoneDays;

                    return (
                      <div
                        key={milestoneDays}
                        className={`p-2 rounded-xl border flex flex-col justify-between text-center relative transition-all ${
                          isReached
                            ? 'bg-gradient-to-b from-emerald-950/60 to-[#211238] border-emerald-400/50 shadow-sm'
                            : isUpcomingToday
                            ? 'bg-gradient-to-b from-[#3a2062] to-[#211238] border-[#F5C76B] ring-2 ring-[#F5C76B]/50 shadow-[0_0_12px_rgba(245,199,107,0.3)] animate-pulse'
                            : 'bg-[#29203D] border-[rgba(196,167,255,0.20)] opacity-85'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[8px] font-headline font-black uppercase mb-1">
                          <span className={isUpcomingToday ? 'text-[#F5C76B]' : isReached ? 'text-emerald-300' : 'text-[#C6BDD9]/60'}>
                            {milestoneDays} Days
                          </span>
                          {isReached ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                              <Check size={9} />
                            </span>
                          ) : isUpcomingToday ? (
                            <span className="text-[7.5px] font-headline font-black bg-[#F5C76B] text-[#211238] px-1 rounded">
                              TODAY
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-headline text-[#C6BDD9]">
                              {Math.min(currentStreak, milestoneDays)}/{milestoneDays}
                            </span>
                          )}
                        </div>

                        <div className="my-0.5 text-base sm:text-lg">
                          {milestoneDays === 3 && '🥉'}
                          {milestoneDays === 5 && '🥈'}
                          {milestoneDays === 7 && '👑'}
                        </div>

                        <div className="text-[8px] sm:text-[9px] font-headline font-bold text-[#F5C76B] truncate">
                          +{bonus.coins} Coins
                        </div>
                        <div className="text-[7.5px] sm:text-[8px] font-semibold text-[#39D5E8] truncate">
                          +{bonus.diamonds} Gems
                        </div>

                        {bonus.boosters && (
                          <div className="text-[7px] text-[#C4A7FF] truncate mt-0.5 font-medium">
                            {milestoneDays === 3 && '+1 Hint'}
                            {milestoneDays === 5 && '+Hammer, Shuffle'}
                            {milestoneDays === 7 && '+All 5 Boosters!'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7 Days Daily Journey Grid */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-headline font-black text-[#F8F5FF] uppercase tracking-wide">
                    7-Day Journey Cycle
                  </span>
                  <span className="text-[9px] text-[#C6BDD9]">Resets every 7 days</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {DAILY_LOGIN_REWARDS.map((reward) => {
                    const isPast = reward.day < currentDayCycle || (reward.day === currentDayCycle && isClaimedToday);
                    const isToday = reward.day === currentDayCycle && !isClaimedToday;
                    const isGrandDay = reward.day === 7;

                    return (
                      <div
                        key={reward.day}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center relative transition-all min-h-[78px] ${
                          isGrandDay ? 'col-span-2 sm:col-span-2' : ''
                        } ${
                          isToday
                            ? 'bg-gradient-to-b from-[#3a2062] to-[#29203D] border-[#F5C76B] ring-2 ring-[#F5C76B]/50 shadow-[0_0_15px_rgba(245,199,107,0.3)]'
                            : isPast
                            ? 'bg-[#211238] border-emerald-500/40 opacity-75'
                            : 'bg-[#29203D] border-[rgba(196,167,255,0.20)]'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between text-[8px] font-headline font-black uppercase">
                          <span className={isToday ? 'text-[#F5C76B]' : 'text-[#C6BDD9]'}>
                            Day {reward.day}
                          </span>
                          {isPast && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                              <Check size={10} />
                            </span>
                          )}
                        </div>

                        <div className="my-0.5 text-lg sm:text-xl">
                          {reward.day === 1 && '🪙'}
                          {reward.day === 2 && '💡'}
                          {reward.day === 3 && '💰'}
                          {reward.day === 4 && '🔄'}
                          {reward.day === 5 && '👑'}
                          {reward.day === 6 && '🔨'}
                          {reward.day === 7 && '🌈'}
                        </div>

                        <span className="text-[8px] sm:text-[8.5px] font-headline font-bold text-[#F8F5FF] line-clamp-1 leading-tight">
                          {reward.rewardDescription}
                        </span>

                        {isToday && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#F5C76B] text-[#211238] font-headline font-black text-[7px] uppercase px-1.5 py-0.2 rounded-full shadow">
                            Ready
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Claim Area */}
            <div className="pt-2.5 border-t border-[rgba(196,167,255,0.20)] shrink-0">
              {isClaimedToday ? (
                <div className="text-center py-2.5 bg-[#211238] rounded-xl border border-[rgba(196,167,255,0.20)]">
                  <p className="text-xs font-headline font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                    <Check size={14} /> Today&apos;s Reward Claimed
                  </p>
                  <p className="text-[10px] text-[#C6BDD9] mt-0.5">
                    🔥 Streak: <strong className="text-[#F5C76B]">{currentStreak} Days</strong>. Come back tomorrow for Day {((currentDayCycle % 7) + 1)}!
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full py-3 bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] text-[#211238] rounded-xl font-headline text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_4px_18px_rgba(245,199,107,0.4)] hover:brightness-110 active:scale-95 cursor-pointer flex flex-col items-center justify-center transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <Gift size={16} />
                    <span>
                      Claim Day {currentDayCycle} Reward
                      {nextBonus && ` + ${nextBonus.title}!`}
                    </span>
                  </div>
                  {nextBonus && (
                    <span className="text-[9px] font-semibold text-[#211238]/90 mt-0.5">
                      Includes +{nextBonus.coins} coins, +{nextBonus.diamonds} gems &amp; boosters!
                    </span>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
