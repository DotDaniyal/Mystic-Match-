import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, ShoppingBag, ArrowLeft, Check, Coins } from 'lucide-react';
import { BOOSTER_SHOP_ITEMS } from '../data';
import { GameState, ShopItem, BoosterType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface BoosterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchase: (item: ShopItem) => boolean | void;
  onGoToEarnCoins?: () => void;
  triggerHaptic: (type?: any) => void;
}

const FALLBACK_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_hint',
    name: 'Mystic Hint',
    type: 'single',
    boosterType: 'hint',
    amount: 1,
    costCoins: 100,
    coinCost: 100,
    icon: '💡',
    description: 'Highlights a guaranteed matching move when you need guidance.',
  },
  {
    id: 'shop_shuffle',
    name: 'Vortex Shuffle',
    type: 'single',
    boosterType: 'shuffle',
    amount: 1,
    costCoins: 150,
    coinCost: 150,
    icon: '🔄',
    description: 'Reshuffles all tiles on the board into fresh match opportunities.',
  },
  {
    id: 'shop_undo',
    name: 'Chrono Undo',
    type: 'single',
    boosterType: 'undo',
    amount: 1,
    costCoins: 150,
    coinCost: 150,
    icon: '⏪',
    description: 'Reverses your most recent move, restoring your moves and score.',
  },
  {
    id: 'shop_hammer',
    name: 'Titan Hammer',
    type: 'single',
    boosterType: 'hammer',
    amount: 1,
    costCoins: 200,
    coinCost: 200,
    icon: '🔨',
    description: 'Smashes and collects any selected crystal immediately.',
  },
  {
    id: 'shop_rainbow',
    name: 'Magic Match (Rainbow)',
    type: 'single',
    boosterType: 'rainbow',
    amount: 1,
    costCoins: 250,
    coinCost: 250,
    icon: '🌈',
    description: 'Transforms 4 board crystals into your exact objective gem type!',
  },
  {
    id: 'shop_bundle',
    name: 'Grand Mage Bundle',
    type: 'bundle',
    amount: 1,
    costCoins: 750,
    coinCost: 750,
    icon: '✨',
    isPopular: true,
    description: 'Special value pack: 1 Hint, 1 Shuffle, 1 Undo, 1 Hammer, and 1 Rainbow Surge!',
  },
];

export const BoosterShopModal: React.FC<BoosterShopModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase,
  onGoToEarnCoins,
  triggerHaptic,
}) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successItemId, setSuccessItemId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lastPurchaseTimeRef = useRef<number>(0);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe items fallback
  const items = Array.isArray(BOOSTER_SHOP_ITEMS) && BOOSTER_SHOP_ITEMS.length > 0
    ? BOOSTER_SHOP_ITEMS
    : FALLBACK_SHOP_ITEMS;

  const currentCoins = gameState?.coins ?? 0;
  const boosters = gameState?.boostersCount ?? { hammer: 0, shuffle: 0, rainbow: 0, hint: 0, undo: 0 };

  // Keyboard accessibility: Escape triggers safe close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isInsufficientOpen) {
          setIsInsufficientOpen(false);
        } else if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, [isOpen, isConfirmOpen, isInsufficientOpen, onClose]);

  // Retrieve current owned quantity for this item
  const getOwnedCount = (item: ShopItem): number | string => {
    if (item.type === 'bundle' || item.id === 'shop_bundle') {
      return 'Pack (+1 ea)';
    }
    const bType = (item.boosterType || item.type) as BoosterType;
    if (bType && typeof boosters[bType] === 'number') {
      return boosters[bType];
    }
    return 0;
  };

  const handleInitiateBuy = (item: ShopItem) => {
    // Rapid-tap debounce
    const now = Date.now();
    if (now - lastPurchaseTimeRef.current < 450 || isProcessing) {
      return;
    }
    lastPurchaseTimeRef.current = now;

    triggerHaptic('click');
    setSelectedItem(item);

    const cost = item.costCoins ?? item.coinCost ?? 0;
    if (currentCoins < cost) {
      setIsInsufficientOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem || isProcessing) return;

    const cost = selectedItem.costCoins ?? selectedItem.coinCost ?? 0;
    if (currentCoins < cost) {
      setIsConfirmOpen(false);
      setIsInsufficientOpen(true);
      return;
    }

    setIsProcessing(true);
    lastPurchaseTimeRef.current = Date.now();

    try {
      onPurchase(selectedItem);
      triggerHaptic('booster');

      // Visual success confirmation
      setSuccessItemId(selectedItem.id);
      setSuccessMessage(`+${selectedItem.amount || 1} ${selectedItem.name} added to your inventory!`);

      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => {
        setSuccessItemId(null);
        setSuccessMessage(null);
      }, 2500);
    } catch (err) {
      console.error('Error executing booster purchase:', err);
    } finally {
      setIsConfirmOpen(false);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-[#10152D]/85 backdrop-blur-md select-none touch-manipulation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              triggerHaptic('click');
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-3 sm:p-4 md:p-5 shadow-[0_12px_45px_rgba(113,56,200,0.35)] rounded-2xl text-[#F8F5FF] max-h-[92dvh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title, Back, Coin Counter, and Close Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(196,167,255,0.20)] shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    onClose();
                  }}
                  className="w-8 h-8 rounded-xl bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] hover:border-[#39D5E8]/50 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
                  title="Return to previous screen"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5C76B] to-[#F18BCB] text-[#211238] flex items-center justify-center font-black shadow-md shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div className="min-w-0">
                  <h3 id="shop-modal-title" className="text-sm sm:text-base font-headline font-black uppercase text-[#F8F5FF] leading-none truncate">
                    Booster Emporium
                  </h3>
                  <p className="text-[9px] text-[#C6BDD9] mt-0.5 truncate">Equip mystical artifacts</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Coins Counter Badge */}
                <div className="flex items-center gap-1 bg-[#211238] px-2 py-1 rounded-xl border border-[#F5C76B]/60 text-xs font-headline font-black text-[#F5C76B] shadow-inner">
                  <span>🪙</span>
                  <span>{currentCoins.toLocaleString()}</span>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] hover:border-rose-400/60 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                  title="Close Emporium"
                  aria-label="Close Emporium"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Inventory Strip: Live Booster Counts */}
            <div className="py-2 px-2.5 bg-[#211238]/90 border border-[rgba(196,167,255,0.20)] rounded-xl my-2 shrink-0 flex items-center justify-between text-[9px] font-headline font-bold text-[#C6BDD9] flex-wrap gap-1">
              <span className="text-[#F5C76B] uppercase tracking-wider text-[8px] font-black">Equipped:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-0.5" title="Hints">💡 <strong className="text-[#F5C76B]">{boosters.hint ?? 0}</strong></span>
                <span className="flex items-center gap-0.5" title="Shuffles">🔄 <strong className="text-[#A855F7]">{boosters.shuffle ?? 0}</strong></span>
                <span className="flex items-center gap-0.5" title="Undos">⏪ <strong className="text-[#39D5E8]">{boosters.undo ?? 0}</strong></span>
                <span className="flex items-center gap-0.5" title="Hammers">🔨 <strong className="text-[#F5C76B]">{boosters.hammer ?? 0}</strong></span>
                <span className="flex items-center gap-0.5" title="Rainbows">🌈 <strong className="text-[#F18BCB]">{boosters.rainbow ?? 0}</strong></span>
              </div>
            </div>

            {/* Live Purchase Success Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 p-2 bg-emerald-500/20 border border-emerald-400/60 rounded-xl flex items-center gap-2 text-xs text-emerald-200 shrink-0 font-medium"
                >
                  <Check size={16} className="text-emerald-300 shrink-0" />
                  <span className="truncate">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shop Items List */}
            <div className="flex-1 overflow-y-auto allow-scroll py-1 space-y-2 pr-0.5">
              {items.map((item) => {
                const cost = item.costCoins ?? item.coinCost ?? 0;
                const canAfford = currentCoins >= cost;
                const isBundle = item.type === 'bundle' || item.id === 'shop_bundle';
                const owned = getOwnedCount(item);
                const isJustPurchased = successItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                      isJustPurchased
                        ? 'bg-emerald-950/70 border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : isBundle
                        ? 'bg-gradient-to-r from-[#331d56] via-[#29203D] to-[#211238] border-[#F5C76B]/60 shadow-[0_0_15px_rgba(245,199,107,0.25)]'
                        : 'bg-[#29203D] border-[rgba(196,167,255,0.20)] hover:border-[#7138C8]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                          isBundle
                            ? 'bg-gradient-to-br from-[#F5C76B] to-[#F18BCB] border-[#F5C76B] text-[#211238] text-2xl shadow-md'
                            : 'bg-[#211238] border-[rgba(196,167,255,0.25)]'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-headline font-black text-xs sm:text-sm text-[#F8F5FF] truncate leading-none">
                            {item.name}
                          </h4>
                          {isBundle ? (
                            <span className="bg-[#F5C76B] text-[#211238] text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-headline leading-none">
                              Save 20%
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-[#39D5E8] bg-[#39D5E8]/10 border border-[#39D5E8]/40 px-1.5 py-0.2 rounded font-headline leading-none">
                              Owned: {owned}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-[#C6BDD9] line-clamp-2 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleInitiateBuy(item)}
                      className={`shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md disabled:opacity-50 ${
                        isJustPurchased
                          ? 'bg-emerald-400 text-slate-950'
                          : canAfford
                          ? isBundle
                            ? 'bg-gradient-to-r from-[#F5C76B] to-[#F18BCB] text-[#211238] hover:brightness-110 shadow-[0_2px_12px_rgba(245,199,107,0.35)]'
                            : 'bg-gradient-to-r from-[#7138C8] to-[#A855F7] text-[#F8F5FF] hover:brightness-110 shadow-[0_2px_12px_rgba(113,56,200,0.35)]'
                          : 'bg-[#211238] text-[#C6BDD9]/40 border border-[rgba(196,167,255,0.15)] hover:border-[#F5C76B]/40'
                      }`}
                      title={canAfford ? `Purchase ${item.name}` : `Need ${cost - currentCoins} more coins`}
                    >
                      {isJustPurchased ? (
                        <>
                          <Check size={12} />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <span>🪙</span>
                          <span>{cost}</span>
                          <span className="text-[9px] opacity-80 ml-0.5">{canAfford ? 'BUY' : 'LACK'}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="pt-2 mt-1 border-t border-[rgba(196,167,255,0.20)] text-center shrink-0">
              <p className="text-[9px] text-[#C6BDD9]">
                ⚡ Boosters never expire and persist across all play sessions.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Purchase"
        message={`Acquire ${selectedItem?.name} for ${(selectedItem?.costCoins ?? selectedItem?.coinCost ?? 0).toLocaleString()} coins? This will add to your booster inventory.`}
        confirmLabel={`Pay ${(selectedItem?.costCoins ?? selectedItem?.coinCost ?? 0)} 🪙`}
        cancelLabel="Cancel"
        onConfirm={handleConfirmPurchase}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={false}
        icon={<Sparkles className="text-[#F5C76B]" size={26} />}
      />

      {/* Insufficient Coins Modal (High z-index to overlay shop safely) */}
      {isInsufficientOpen && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#10152D]/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsInsufficientOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[#F5C76B]/80 p-5 max-w-xs w-full text-center rounded-2xl shadow-[0_10px_35px_rgba(245,199,107,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#F5C76B]/20 border border-[#F5C76B]/50 flex items-center justify-center text-[#F5C76B] mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-base font-headline font-black uppercase text-[#F5C76B] mb-1">
              Not Enough Coins!
            </h4>
            <p className="text-xs text-[#C6BDD9] mb-3 leading-relaxed">
              You currently have <span className="font-bold text-[#F5C76B]">{currentCoins.toLocaleString()} 🪙</span>, but{' '}
              <span className="font-bold text-[#F8F5FF]">{selectedItem?.name}</span> costs{' '}
              <span className="font-bold text-[#F5C76B]">{(selectedItem?.costCoins ?? selectedItem?.coinCost ?? 0).toLocaleString()} 🪙</span>.
            </p>
            <p className="text-[10px] text-[#C6BDD9]/80 mb-4">
              You need <span className="font-bold text-[#F8F5FF]">{Math.max(0, (selectedItem?.costCoins ?? selectedItem?.coinCost ?? 0) - currentCoins)}</span> more coins.
            </p>

            <div className="flex flex-col gap-2">
              {onGoToEarnCoins && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    setIsInsufficientOpen(false);
                    onClose();
                    onGoToEarnCoins();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] text-[#211238] rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins size={14} />
                  <span>Earn Coins via Quests</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  setIsInsufficientOpen(false);
                }}
                className="w-full py-2 bg-[#211238] border border-[rgba(196,167,255,0.25)] rounded-xl font-headline text-xs font-bold uppercase text-[#C6BDD9] hover:text-[#F8F5FF] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
