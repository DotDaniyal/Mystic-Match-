import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 inset-x-4 z-[90] flex justify-center pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-sm bg-gradient-to-r from-[#29203D] via-[#211238] to-[#10152D] border-2 border-[rgba(196,167,255,0.30)] text-[#F8F5FF] p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_35px_rgba(113,56,200,0.35)] flex items-start gap-3 pointer-events-auto backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-xl bg-[#7138C8]/30 flex items-center justify-center text-[#39D5E8] mt-0.5 border border-[#39D5E8]/40 shrink-0">
          <Bell size={16} className="text-[#39D5E8] animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#F5C76B] leading-tight">
            {title}
          </h4>
          <p className="text-[10px] text-[#C6BDD9] leading-normal mt-0.5 font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#C6BDD9] hover:text-[#F8F5FF] hover:bg-white/10 rounded-lg p-1 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
};
