"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            role="status"
            className="rounded-full border border-white/10 bg-[#1a1130]/95 px-5 py-3 text-sm text-text-primary shadow-lg backdrop-blur"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
