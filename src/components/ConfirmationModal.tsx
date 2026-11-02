import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDestructive = true,
  icon,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  // Keyboard accessibility: Escape triggers safe cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus safe cancel button on open
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[150] bg-[#10152D]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none touch-manipulation"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-modal-title"
          aria-describedby="confirmation-modal-message"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="w-full max-w-full bg-gradient-to-b from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] p-5 sm:p-6 rounded-2xl shadow-[0_12px_45px_rgba(113,56,200,0.5)] text-center text-[#F8F5FF] relative max-h-[90dvh] overflow-y-auto allow-scroll"
            style={{ width: '100%', maxWidth: 'min(100%, 360px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#211238] to-[#7138C8] border-2 border-[rgba(196,167,255,0.35)] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(113,56,200,0.4)]">
              {icon || (isDestructive ? <ShieldAlert className="text-[#F5C76B]" size={26} /> : <AlertCircle className="text-[#39D5E8]" size={26} />)}
            </div>

            {/* Title & Message */}
            <h3
              id="confirmation-modal-title"
              className="font-headline font-black text-lg sm:text-xl uppercase tracking-wider text-[#F8F5FF] mb-1.5"
            >
              {title}
            </h3>
            <p
              id="confirmation-modal-message"
              className="text-xs sm:text-sm text-[#C6BDD9] font-medium leading-relaxed mb-5 px-1"
            >
              {message}
            </p>

            {/* Action Buttons: Responsive to destructive vs positive intent */}
            <div className="flex flex-col gap-2.5">
              {isDestructive ? (
                <>
                  <button
                    ref={cancelBtnRef}
                    type="button"
                    onClick={onCancel}
                    className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-headline font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#39D5E8] to-[#579BFF] text-[#211238] hover:brightness-110 active:scale-[0.98] shadow-[0_4px_18px_rgba(57,213,232,0.4)] transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-headline font-bold text-xs uppercase tracking-wider bg-[#211238] border border-rose-500/60 text-rose-300 hover:bg-rose-950/60 hover:border-rose-400 shadow-[0_2px_12px_rgba(244,63,94,0.15)] transition-all cursor-pointer min-h-[44px] flex items-center justify-center active:scale-[0.98]"
                  >
                    {confirmLabel}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-headline font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#F5C76B] via-[#FDE68A] to-[#F18BCB] text-[#211238] hover:brightness-110 active:scale-[0.98] shadow-[0_4px_20px_rgba(245,199,107,0.4)] transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    {confirmLabel}
                  </button>
                  <button
                    ref={cancelBtnRef}
                    type="button"
                    onClick={onCancel}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-headline font-bold text-xs uppercase tracking-wider bg-[#211238] border border-[rgba(196,167,255,0.25)] text-[#C6BDD9] hover:text-[#F8F5FF] transition-all cursor-pointer min-h-[44px] flex items-center justify-center active:scale-[0.98]"
                  >
                    {cancelLabel}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
