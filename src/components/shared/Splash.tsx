import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashProps {
  show: boolean;
}

export function Splash({ show }: SplashProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-56 h-56 mb-6 flex items-center justify-center"
          >
            <img 
              src="/logo-512.png" 
              alt="Pawon Salam Logo" 
              className="w-full h-full object-cover rounded-[40px] shadow-[0_25px_50px_-12px_rgba(255,193,7,0.5)] border-4 border-white"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/food/512/512';
              }}
            />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Manager</h1>
            <p className="text-slate-500 text-sm mt-1">Kitchen & Mini Bar Inventory</p>
          </motion.div>
          <motion.div 
            className="absolute bottom-12 flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce delay-300"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
