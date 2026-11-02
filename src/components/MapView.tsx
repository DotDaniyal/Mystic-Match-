import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldAlert, Award, Play, X, Lock } from 'lucide-react';
import { Level, GameState } from '../types';

interface MapViewProps {
  levels: Level[];
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  setSelectedLevelId: (id: number) => void;
  triggerHaptic: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  levels,
  gameState,
  setTab,
  setSelectedLevelId,
  triggerHaptic,
  triggerPushNotification,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedBossLevel, setSelectedBossLevel] = useState<Level | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Programmatically position each node in a scrollable, beautiful winding vertical road
  const mapNodes = useMemo(() => {
    return levels.map((lvl) => {
      const i = lvl.id;
      // Arrange levels so Stage 1 is at the bottom, and Stage 50 is at the top
      // Spacing: 140px per stage
      const y = (levels.length - i) * 140 + 80;
      // Fluid percentage horizontal position (between 25% and 75%) that adapts perfectly to any screen width
      const xPct = 50 + Math.sin(i * 1.1) * 26;
      return {
        ...lvl,
        xPct,
        y,
      };
    });
  }, [levels]);

  // Create smooth curved lines (SVG quadratic curves) between map nodes using percentages
  const pathD = useMemo(() => {
    if (mapNodes.length === 0) return '';
    // Sort ascending by level ID to draw path from bottom (Stage 1) up to top (Stage 50)
    const sorted = [...mapNodes].sort((a, b) => a.id - b.id);
    let d = `M ${sorted[0].xPct} ${sorted[0].y}`;
    for (let idx = 1; idx < sorted.length; idx++) {
      const prevNode = sorted[idx - 1];
      const currNode = sorted[idx];
      const cpY = (prevNode.y + currNode.y) / 2;
      // Control point offset creates a lovely curved wavy path
      const cpX = (prevNode.xPct + currNode.xPct) / 2 + (prevNode.id % 2 === 0 ? 6 : -6);
      d += ` Q ${cpX} ${cpY}, ${currNode.xPct} ${currNode.y}`;
    }
    return d;
  }, [mapNodes]);

  // Scroll to active (unlocked but unplayed) level or the highest unlocked level on mount
  useEffect(() => {
    if (containerRef.current) {
      const activeLvl = levels.find((l) => !l.isLocked && l.stars === 0) || levels[0];
      if (activeLvl) {
        // Calculate corresponding y coordinate
        const activeY = (levels.length - activeLvl.id) * 140 + 80;
        // Center the active node in the 540px high viewport
        containerRef.current.scrollTop = activeY - 240;
      }
    }
  }, [levels]);

  const openLevelDetails = (level: Level) => {
    triggerHaptic();
    if (level.isLocked) {
      triggerPushNotification('Stage Locked!', `You must clear previous stages to unlock Stage ${level.id}.`);
      return;
    }
    if (level.isBoss) {
      setSelectedBossLevel(level);
    } else {
      setSelectedLevel(level);
    }
  };

  const launchLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    triggerHaptic();
    setSelectedLevel(null);
    setSelectedBossLevel(null);
    setTab('game');
  };

  // Calculate dynamic progress
  const completedLevels = levels.filter((lvl) => lvl.stars > 0).length;
  const totalLevels = levels.length;
  const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  // Total height of winding path SVG matching our node coordinate system
  const canvasHeight = levels.length * 140 + 100;

  return (
    <div className="flex flex-col w-full h-full min-h-0 select-none relative z-10 text-white flex-1 overflow-hidden">
      {/* Top Banner Context */}
      <div className="mb-2 sm:mb-3 shrink-0 flex flex-col gap-1 sm:gap-1.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-headline font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-[#39D5E8] bg-[#29203D] px-2 py-0.5 rounded-full border border-[rgba(57,213,232,0.40)] leading-none">
              World 01 • Celestial Archipelago
            </span>
            <h1 className="font-headline font-black text-lg sm:text-xl tracking-tight text-[#F8F5FF] mt-1 leading-none uppercase">
              THE FLOATING REALM
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-headline font-bold text-[#C6BDD9] leading-none">
              Progress
            </span>
            <span className="font-headline font-black text-sm sm:text-base mt-0.5 text-[#39D5E8] leading-none">
              {completedLevels} / {totalLevels}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 sm:h-3 bg-[#10152D] border border-[rgba(196,167,255,0.20)] p-0.5 relative overflow-hidden rounded-full mt-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#39D5E8] via-[#579BFF] to-[#A855F7] rounded-full shadow-[0_0_10px_rgba(57,213,232,0.7)] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Scrollable Level Map Container */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full bg-gradient-to-b from-[#211238] via-[#18102E] to-[#10152D] border-2 border-[rgba(196,167,255,0.25)] rounded-2xl shadow-[0_4px_25px_rgba(33,18,56,0.6)] overflow-y-auto overflow-x-hidden p-3 sm:p-4 select-none scroll-smooth overscroll-contain"
      >
        {/* Dynamic scroll indicator on map */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-[9px] font-headline font-bold uppercase tracking-widest text-[#39D5E8] bg-[#29203D] border border-[rgba(57,213,232,0.40)] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
          <span>👑 Celestial Spire</span>
        </div>

        <div className="relative w-full" style={{ height: `${canvasHeight}px` }}>
          {/* Atmospheric Celestial Light Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-[#7138C8]/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-[#A855F7]/10 blur-3xl" />
            <div className="absolute top-2/3 left-1/3 w-72 h-72 rounded-full bg-[#39D5E8]/10 blur-3xl" />
          </div>

          {/* Winding Path SVG Layer */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none z-0"
            viewBox={`0 0 100 ${canvasHeight}`}
            preserveAspectRatio="none"
            style={{ height: `${canvasHeight}px` }}
          >
            <path
              d={pathD}
              fill="none"
              stroke="#7138C8"
              strokeDasharray="2 1.5"
              vectorEffect="non-scaling-stroke"
              strokeWidth="4"
              className="opacity-70"
            />
          </svg>

          {/* Map Nodes Container */}
          <div className="relative z-10 w-full h-full">
            {mapNodes.map((lvl) => {
              const nodeClass = lvl.isBoss ? 'w-16 h-16 sm:w-18 sm:h-18 text-xl sm:text-2xl' : 'w-12 h-12 sm:w-13 sm:h-13 text-sm sm:text-base';
              
              return (
                <div
                  key={lvl.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                  style={{ left: `${lvl.xPct}%`, top: `${lvl.y}px` }}
                  onClick={() => openLevelDetails(lvl)}
                >
                  {/* Star Display (only for normal nodes or completed boss nodes) */}
                  {!lvl.isBoss && (
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3].map((sIndex) => (
                        <Star
                          key={`map-node-star-${lvl.id}-${sIndex}`}
                          size={11}
                          className={`${
                            sIndex <= lvl.stars
                              ? 'text-[#F5C76B] fill-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.8)]'
                              : 'text-[#29203D] fill-[#18102E]'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Boss Indicator Header */}
                  {lvl.isBoss && (
                    <div className="flex items-center gap-1 mb-1.5 bg-[#29203D] text-[#FB7185] px-2 py-0.5 font-headline font-bold text-[8px] uppercase rounded-full border border-[#F43F5E]/50 shadow-md">
                      <ShieldAlert size={9} /> Boss
                    </div>
                  )}

                  {/* Level Number Card */}
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.94 }}
                    className={`font-headline font-black rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all ${nodeClass} ${
                      lvl.isLocked
                        ? 'bg-[#211238] text-[#C6BDD9]/40 border-[rgba(196,167,255,0.15)]'
                        : lvl.isBoss
                        ? 'bg-gradient-to-br from-[#F43F5E] via-[#7138C8] to-[#211238] text-white border-[#FB7185] shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                        : lvl.stars > 0
                        ? 'bg-gradient-to-br from-[#7138C8] via-[#A855F7] to-[#579BFF] text-white border-[rgba(196,167,255,0.45)] shadow-[0_0_12px_rgba(113,56,200,0.35)]'
                        : 'bg-gradient-to-br from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] text-[#211238] border-[#FEF3C7] shadow-[0_0_16px_rgba(245,199,107,0.45)] ring-2 ring-[#F5C76B]'
                    }`}
                  >
                    {lvl.isLocked ? (
                      <Lock size={lvl.isBoss ? 20 : 16} className="text-[#C6BDD9]/40" />
                    ) : lvl.isBoss ? (
                      <span>🐉</span>
                    ) : (
                      <span>{lvl.id < 10 ? `0${lvl.id}` : lvl.id}</span>
                    )}
                  </motion.div>

                  {/* Name Tag */}
                  <span className={`font-headline font-bold text-[9px] mt-1.5 px-2 py-0.5 rounded-full border whitespace-nowrap group-hover:text-[#39D5E8] transition-colors ${
                    lvl.isBoss 
                      ? 'bg-[#29203D]/95 border-[#F43F5E]/40 text-[#FB7185]' 
                      : 'bg-[#29203D]/95 border-[rgba(196,167,255,0.25)] text-[#C6BDD9]'
                  }`}>
                    {lvl.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-2 shrink-0 flex items-center justify-between px-2 text-[10px] sm:text-[11px] font-headline font-bold text-[#C6BDD9]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7138C8] border border-[rgba(196,167,255,0.40)]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] border border-[#FB7185]" />
          <span>Boss Stage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.15)]" />
          <span>Locked</span>
        </div>
      </div>

      {/* Level Details Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <div
            className="fixed inset-0 z-[100] bg-[#10152D]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none touch-manipulation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedLevel(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] rounded-2xl shadow-[0_10px_35px_rgba(33,18,56,0.65)] w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative flex flex-col gap-3 sm:gap-4 text-left max-h-[90dvh] overflow-y-auto allow-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                onClick={() => setSelectedLevel(null)}
              >
                <X size={16} />
              </button>

              <div>
                <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-[#39D5E8]">
                  Stage Details
                </span>
                <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F8F5FF] leading-tight mt-0.5">
                  Stage {selectedLevel.id}: {selectedLevel.name}
                </h2>
              </div>

              {/* Star Progress */}
              <div className="flex justify-center gap-3 py-3 bg-[#211238] border border-[rgba(196,167,255,0.20)] rounded-xl">
                {[1, 2, 3].map((sIndex) => (
                  <Star
                    key={`modal-star-${selectedLevel.id}-${sIndex}`}
                    size={30}
                    className={`${
                      sIndex <= selectedLevel.stars
                        ? 'text-[#F5C76B] fill-[#F5C76B] drop-shadow-[0_0_8px_rgba(245,199,107,0.8)]'
                        : 'text-[#29203D] fill-[#18102E]'
                    }`}
                  />
                ))}
              </div>

              {/* Battle Stats */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[rgba(196,167,255,0.15)]">
                  <span className="font-bold text-[#C6BDD9]">Objective</span>
                  <span className="font-headline font-black text-[#F8F5FF] uppercase flex items-center gap-1">
                    {selectedLevel.objectiveTarget} {selectedLevel.objectiveType}s
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[rgba(196,167,255,0.15)]">
                  <span className="font-bold text-[#C6BDD9]">Recommended Power</span>
                  <span className="font-headline font-black text-[#F8F5FF]">
                    {selectedLevel.recommendedPower.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[rgba(196,167,255,0.15)]">
                  <span className="font-bold text-[#C6BDD9]">Potential Rewards</span>
                  <span className="font-headline font-black text-[#39D5E8] flex items-center gap-1">
                    <Award size={13} className="text-[#F5C76B]" />
                    {selectedLevel.loot}
                  </span>
                </div>
              </div>

              {/* Launch Action */}
              <button
                className="w-full py-3.5 bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] hover:brightness-110 text-[#211238] font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(245,199,107,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={() => launchLevel(selectedLevel.id)}
              >
                <Play size={16} className="fill-current text-[#211238]" />
                Launch Stage
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Boss Challenge Preview Modal */}
      <AnimatePresence>
        {selectedBossLevel && (
          <div
            className="fixed inset-0 z-[100] bg-[#10152D]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none touch-manipulation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedBossLevel(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[#F43F5E]/60 rounded-2xl shadow-[0_10px_35px_rgba(244,63,94,0.35)] w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative flex flex-col gap-3 sm:gap-4 text-left max-h-[90dvh] overflow-y-auto allow-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                onClick={() => setSelectedBossLevel(null)}
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐉</span>
                <div>
                  <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-[#FB7185]">
                    Boss Battle Challenge
                  </span>
                  <h2 className="font-headline font-black text-xl text-[#F8F5FF] leading-tight mt-0.5">
                    Stage {selectedBossLevel.id}: {selectedBossLevel.name}
                  </h2>
                </div>
              </div>

              <div className="w-full h-32 bg-gradient-to-tr from-[#211238] to-[#29203D] border border-[#F43F5E]/40 rounded-xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <span className="text-5xl animate-bounce">🐲</span>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#FB7185] mt-2 bg-[#211238]/90 px-2.5 py-0.5 rounded-full border border-[#F43F5E]/40">
                  Guardian of floating crystals
                </span>
              </div>

              <p className="text-xs text-[#C6BDD9] font-medium leading-relaxed">
                Clear all match objectives in this Boss Stage to collect double experience, epic dragon aether fragments, and gold rewards!
              </p>

              <div className="flex flex-col gap-2 text-xs py-1.5 px-3 bg-[#211238] border border-[rgba(196,167,255,0.20)] rounded-xl">
                <div className="flex justify-between border-b border-[rgba(196,167,255,0.15)] pb-1">
                  <span className="font-headline font-bold text-[10px] uppercase text-[#C6BDD9]">Objective Target</span>
                  <span className="font-headline font-black text-xs text-[#FB7185]">
                    Match {selectedBossLevel.objectiveTarget} {selectedBossLevel.objectiveType}s
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-headline font-bold text-[10px] uppercase text-[#C6BDD9]">Potential Rewards</span>
                  <span className="font-headline font-black text-xs text-[#F5C76B]">
                    💎 {selectedBossLevel.loot}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-3.5 bg-gradient-to-r from-[#F43F5E] via-[#7138C8] to-[#A855F7] hover:brightness-110 text-white font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={() => launchLevel(selectedBossLevel.id)}
              >
                <Play size={16} className="fill-current" />
                Launch Boss Battle
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
