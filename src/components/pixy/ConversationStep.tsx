"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface ConversationStepProps {
  stepKey: string;
  children: ReactNode;
}

export function ConversationStep({ stepKey, children }: ConversationStepProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
