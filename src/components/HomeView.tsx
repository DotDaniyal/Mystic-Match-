import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Play,
  Zap,
  Map,
  Trophy,
  Swords,
  Shield,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Target,
  Film,
  Flame
} from 'lucide-react';
import { GameState } from '../types';

interface HomeViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: (type?: any) => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenDailyLogin: () => void;
  onOpenMissions: () => void;
  onOpenRewardedAd: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  gameState,
  setTab,
  triggerHaptic,
  triggerPushNotification,
  onOpenProfile,
  onOpenShop,
  onOpenDailyLogin,
  onOpenMissions,
  onOpenRewardedAd,
}) => {
  const goToMap = () => {
    triggerHaptic('click');
    setTab('map');
  };

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = gameState.lastClaimedDaily === today;
  const unclaimedMissionsCount = (gameState.missions || []).filter(m => m.completed && !m.claimed).length;

  return (
    <div className="flex flex-col w-full relative z-10 select-none pb-4 text-[#F8F5FF] gap-y-2.5 sm:gap-y-4">
      {/* Mystic Match Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center relative w-full"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#29203D] border border-[rgba(57,213,232,0.40)] rounded-full text-[#39D5E8] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 shadow-[0_0_12px_rgba(57,213,232,0.25)]">
          <Sparkles size={11} className="text-[#F5C76B] animate-spin-slow" />
          Celestial Puzzle Realm
        </div>
        <h1 className="font-headline font-black text-xl sm:text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F5C76B] via-[#F8F5FF] to-[#39D5E8] drop-shadow-[0_2px_8px_rgba(245,199,107,0.35)]">
          MYSTIC MATCH
        </h1>
      </motion.div>

      {/* Player Profile & XP Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          triggerHaptic('click');
          onOpenProfile();
        }}
        className="card-glowing-purple p-2.5 sm:p-3.5 rounded-2xl relative cursor-pointer hover:border-[#A855F7] transition-all group flex flex-col w-full"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full flex-wrap xs:flex-nowrap">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#7138C8] via-[#A855F7] to-[#579BFF] border-2 border-[rgba(196,167,255,0.40)] flex items-center justify-center font-headline font-black text-sm sm:text-base text-white shadow-[0_0_15px_rgba(113,56,200,0.35)]">
                {gameState.name ? gameState.name.slice(0, 2).toUpperCase() : 'P1'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#F5C76B] text-[#211238] font-headline text-[7.5px] sm:text-[8px] px-1.5 py-0.2 rounded-full font-black border border-[#FDE68A]">
                LVL {gameState.level}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline text-xs sm:text-base font-extrabold tracking-tight text-[#F8F5FF] uppercase group-hover:text-[#39D5E8] transition-colors truncate">
                  {gameState.name || 'Crystal Mage'}
                </h2>
                <ChevronRight size={14} className="text-[#C4A7FF] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[#39D5E8] truncate">
                {gameState.level === 0 ? 'Novice Seeker' : `Master of Realm • Rank ${gameState.level}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end max-w-[100px] sm:max-w-[110px] w-full shrink-0">
            <div className="flex justify-between w-full text-[7.5px] sm:text-[8px] uppercase font-headline font-bold text-[#C4A7FF]">
              <span>XP</span>
              <span className="text-[#F5C76B]">{gameState.xp}/{gameState.xpMax}</span>
            </div>
            <div className="w-full h-2 bg-[#10152D] border border-[rgba(196,167,255,0.20)] mt-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#39D5E8] via-[#579BFF] to-[#A855F7] rounded-full shadow-[0_0_8px_rgba(57,213,232,0.6)] transition-all duration-300" 
                style={{ width: `${Math.min(100, (gameState.xp / gameState.xpMax) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Career Statistics Sub-grid with Win Streak */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 min-[340px]:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0"
      >
        <div className="bg-[#29203D] p-2 sm:p-2.5 rounded-xl border border-[rgba(245,199,107,0.30)] shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-[#F5C76B] flex items-center gap-1 truncate">
            <Trophy size={10} className="text-[#F5C76B] shrink-0" /> Score
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-[#F5C76B] mt-0.5 truncate">{gameState.score}</span>
        </div>

        <div className="bg-[#29203D] p-2 sm:p-2.5 rounded-xl border border-[rgba(16,185,129,0.30)] shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-[#10B981] flex items-center gap-1 truncate">
            <Swords size={10} className="text-[#10B981] shrink-0" /> Wins
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-[#10B981] mt-0.5 truncate">{gameState.wins}</span>
        </div>

        <div className="bg-[#29203D] p-2 sm:p-2.5 rounded-xl border border-[rgba(241,139,203,0.30)] shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-[#F18BCB] flex items-center gap-1 truncate">
            <Flame size={10} className="text-[#F18BCB] shrink-0" /> Streak
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-[#F18BCB] mt-0.5 truncate">{gameState.winStreak || 0}</span>
        </div>

        <div className="bg-[#29203D] p-2 sm:p-2.5 rounded-xl border border-[rgba(57,213,232,0.30)] shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-[#39D5E8] flex items-center gap-1 truncate">
            <Play size={10} className="text-[#39D5E8] shrink-0" /> Matches
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-[#39D5E8] mt-0.5 truncate">{gameState.totalMatchesMade || 0}</span>
        </div>
      </motion.div>

      {/* 2-Column Economy Hub: Booster Shop & 7-Day Login */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Booster Shop Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            triggerHaptic('click');
            onOpenShop();
          }}
          className="bg-[#29203D] border border-[rgba(245,199,107,0.35)] p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-[#F5C76B] transition-all shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5C76B]/20 text-[#F5C76B] border border-[#F5C76B]/40 flex items-center justify-center font-bold">
              <ShoppingBag size={16} />
            </div>
            <span className="text-[8px] font-headline font-black uppercase bg-[#F5C76B]/20 text-[#F5C76B] px-1.5 py-0.5 rounded border border-[#F5C76B]/40">
              Shop
            </span>
          </div>
          <div>
            <h4 className="font-headline font-black text-xs sm:text-sm text-[#F8F5FF] group-hover:text-[#F5C76B] transition-colors uppercase leading-none">
              Booster Emporium
            </h4>
            <p className="text-[9px] text-[#C6BDD9] mt-1 leading-snug">
              Buy Hint, Undo, Hammer, Shuffle &amp; Bundles!
            </p>
          </div>
        </motion.div>

        {/* 7-Day Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            triggerHaptic('click');
            onOpenDailyLogin();
          }}
          className="bg-[#29203D] border border-[rgba(196,167,255,0.30)] p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-[#39D5E8] transition-all shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#7138C8]/20 text-[#39D5E8] border border-[#7138C8]/40 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <span className={`text-[8px] font-headline font-black uppercase px-1.5 py-0.5 rounded border ${
              isClaimedToday ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-[#F5C76B] text-[#211238] border-[#FDE68A] animate-pulse'
            }`}>
              {isClaimedToday ? 'Claimed' : 'Gift Ready!'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-headline font-black text-xs sm:text-sm text-[#F8F5FF] group-hover:text-[#39D5E8] transition-colors uppercase leading-none">
                Daily Calendar
              </h4>
              {(gameState.dailyStreak || 0) > 0 && (
                <span className="text-[7.5px] font-headline font-black bg-[#F18BCB]/20 text-[#F18BCB] border border-[#F18BCB]/40 px-1 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <Flame size={9} className="text-[#F18BCB] fill-[#F18BCB]" /> {gameState.dailyStreak}d
                </span>
              )}
            </div>
            <p className="text-[9px] text-[#C6BDD9] mt-1 leading-snug">
              Day {gameState.dailyLoginDay || 1}/7 • {(gameState.dailyStreak || 0) > 0 ? `${gameState.dailyStreak}d streak active!` : 'Free boosters & bonuses!'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Missions and Rewarded Ad Banner Row */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Quests / Missions */}
        <div
          onClick={() => {
            triggerHaptic('click');
            onOpenMissions();
          }}
          className="bg-[#29203D] border border-[rgba(196,167,255,0.20)] hover:border-[#39D5E8] p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#39D5E8]/20 text-[#39D5E8] flex items-center justify-center shrink-0">
              <Target size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-headline font-black text-[11px] text-[#F8F5FF] leading-none uppercase truncate">
                Quests &amp; Bounties
              </p>
              <p className="text-[8px] text-[#C6BDD9] mt-0.5 truncate">
                {unclaimedMissionsCount > 0 ? `${unclaimedMissionsCount} Ready to Claim!` : '5 Active Missions'}
              </p>
            </div>
          </div>
        </div>

        {/* Mystic Reel (Optional Rewarded simulation) */}
        <div
          onClick={() => {
            triggerHaptic('click');
            onOpenRewardedAd();
          }}
          className="bg-[#29203D] border border-[rgba(196,167,255,0.20)] hover:border-[#A855F7] p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#A855F7]/20 text-[#C4A7FF] flex items-center justify-center shrink-0">
              <Film size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-headline font-black text-[11px] text-[#F8F5FF] leading-none uppercase truncate">
                Mystic Reel
              </p>
              <p className="text-[8px] text-[#C6BDD9] mt-0.5 truncate">
                +1 Free Booster (3s)
              </p>
            </div>
          </div>
          <span className="text-[8px] font-headline font-bold text-[#F5C76B] shrink-0 ml-1">FREE</span>
        </div>
      </div>

      {/* Live Event Play Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border border-[rgba(245,199,107,0.35)] shadow-md p-3.5 rounded-2xl text-center relative overflow-hidden flex flex-col w-full items-center"
      >
        <div className="inline-flex items-center gap-1 bg-[#F5C76B]/20 text-[#F5C76B] border border-[#F5C76B]/40 px-2.5 py-0.5 rounded-full font-headline text-[9px] font-bold uppercase tracking-wider mb-1.5">
          <Zap size={10} className="fill-current text-[#F5C76B]" />
          Live Event Active
        </div>
        <h3 className="font-headline text-xl font-black uppercase text-[#F5C76B] tracking-tight leading-none mb-1">
          Crystal Frenzy
        </h3>
        <p className="text-[11px] text-[#C6BDD9] font-medium max-w-xs mx-auto mb-2.5">
          Stage {gameState.currentPlayingLevelId || 1}: Clear match-3 objectives to claim stars!
        </p>

        <button
          onClick={goToMap}
          className="w-full bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] hover:brightness-110 text-[#211238] py-2.5 px-4 rounded-xl font-headline font-black text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(245,199,107,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Map size={16} className="text-[#211238]" />
          EXPLORE REALM MAP
        </button>
      </motion.div>

      {/* Quick Access to Map */}
      <div
        onClick={() => {
          triggerHaptic('click');
          setTab('map');
        }}
        className="card-glowing-blue p-3 rounded-xl flex items-center justify-between hover:border-[#579BFF] transition-all cursor-pointer group w-full"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#579BFF]/20 border border-[#579BFF]/40 flex items-center justify-center shrink-0">
            <Map size={16} className="text-[#39D5E8]" />
          </div>
          <div className="min-w-0">
            <h4 className="font-headline font-bold text-xs uppercase text-[#F8F5FF] mb-0.5 group-hover:text-[#39D5E8] transition-colors truncate">
              Realm Map: 50 Stages
            </h4>
            <p className="text-[9px] text-[#C6BDD9] font-medium truncate">
              Journey across archipelago islands &amp; conquer bosses.
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#39D5E8] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
      </div>
    </div>
  );
};
